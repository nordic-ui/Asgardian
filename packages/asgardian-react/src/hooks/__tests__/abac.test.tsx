import { createAbility } from "@nordic-ui/asgardian";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { type ChangeEvent, useMemo, useState } from "react";
import userEvent from "@testing-library/user-event";

import { AbilityProvider, useAbility } from "../..";

describe("ABAC Ability Hook", () => {
  it("should handle attribute-based access control with complex conditions", async () => {
    type Actions =
      | "create"
      | "read"
      | "update"
      | "delete"
      | "publish"
      | "approve"
      | "manage";
    type Resources = "Post" | "Comment" | "User" | "Department" | "all";

    interface User {
      id: number;
      role: string;
      department: string;
      level: number;
      permissions: string[];
    }

    interface Post {
      id: number;
      authorId: number;
      departmentId: string;
      status: "draft" | "review" | "published";
      confidential: boolean;
    }

    // Create ability based on user attributes and context
    function createAttributeBasedAbility(user: User) {
      const ability = createAbility<Actions, Resources>();

      // Basic role-based permissions
      if (user.role === "admin") {
        ability.can("manage", "all");
        return ability;
      }

      // Department-based permissions
      if (user.role === "manager" && user.level >= 5) {
        ability.can("manage", "Department", { departmentId: user.department });
        ability.can(["read", "update"], "User", {
          department: user.department,
        });
      }

      // Content creation based on role and department
      if (["editor", "manager"].includes(user.role)) {
        ability.can("create", "Post", { departmentId: user.department });
        ability.can(["read", "update"], "Post", {
          $or: [
            { authorId: user.id },
            { departmentId: user.department, confidential: false },
          ],
        });
      }

      // Publishing permissions based on level and role
      if (
        user.role === "manager" ||
        (user.role === "editor" && user.level >= 3)
      ) {
        ability.can("publish", "Post", {
          departmentId: user.department,
          status: { $in: ["draft", "review"] },
        });
      }

      // Approval permissions for senior staff
      if (user.level >= 4) {
        ability.can("approve", "Post", { departmentId: user.department });
      }

      // Self-management permissions
      ability.can(["read", "update"], "User", { id: user.id });

      // Everyone can read published, non-confidential posts
      ability.can("read", "Post", {
        status: "published",
        confidential: false,
      });

      // Special permissions array override
      if (user.permissions.includes("DELETE_ANY_POST")) {
        ability.can("delete", "Post");
      }

      // Restrict confidential content
      ability.cannot("read", "Post", {
        confidential: true,
        departmentId: { $ne: user.department },
      });

      return ability;
    }

    // Test component with context-aware permissions
    function App() {
      const [currentUser, setCurrentUser] = useState<User>({
        id: 1,
        role: "editor",
        department: "marketing",
        level: 3,
        permissions: [],
      });

      const [selectedPost, setSelectedPost] = useState<Post>({
        id: 1,
        authorId: 1,
        departmentId: "marketing",
        status: "draft",
        confidential: false,
      });

      const ability = useMemo(
        () => createAttributeBasedAbility(currentUser),
        [currentUser]
      );

      const handleUserChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const userType = event.target.value;
        switch (userType) {
          case "admin":
            setCurrentUser({
              id: 1,
              role: "admin",
              department: "it",
              level: 10,
              permissions: [],
            });
            break;
          case "manager":
            setCurrentUser({
              id: 2,
              role: "manager",
              department: "marketing",
              level: 6,
              permissions: [],
            });
            break;
          case "senior-editor":
            setCurrentUser({
              id: 3,
              role: "editor",
              department: "marketing",
              level: 4,
              permissions: ["DELETE_ANY_POST"],
            });
            break;
          case "junior-editor":
            setCurrentUser({
              id: 4,
              role: "editor",
              department: "sales",
              level: 2,
              permissions: [],
            });
            break;
          default:
            setCurrentUser({
              id: 1,
              role: "editor",
              department: "marketing",
              level: 3,
              permissions: [],
            });
        }
      };

      const handlePostChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const postType = event.target.value;
        switch (postType) {
          case "own-draft":
            setSelectedPost({
              id: 1,
              authorId: currentUser.id,
              departmentId: currentUser.department,
              status: "draft",
              confidential: false,
            });
            break;
          case "other-published":
            setSelectedPost({
              id: 2,
              authorId: 999,
              departmentId: "hr",
              status: "published",
              confidential: false,
            });
            break;
          case "confidential":
            setSelectedPost({
              id: 3,
              authorId: 999,
              departmentId: "finance",
              status: "published",
              confidential: true,
            });
            break;
          case "dept-review":
            setSelectedPost({
              id: 4,
              authorId: 999,
              departmentId: currentUser.department,
              status: "review",
              confidential: false,
            });
            break;
        }
      };

      return (
        <>
          <div>
            <label htmlFor="user-select">Current User:</label>
            <select id="user-select" onChange={handleUserChange}>
              <option value="editor">Editor (Level 3, Marketing)</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager (Level 6, Marketing)</option>
              <option value="senior-editor">
                Senior Editor (Level 4, Marketing)
              </option>
              <option value="junior-editor">
                Junior Editor (Level 2, Sales)
              </option>
            </select>
          </div>

          <div>
            <label htmlFor="post-select">Selected Post:</label>
            <select id="post-select" onChange={handlePostChange}>
              <option value="own-draft">Own Draft Post</option>
              <option value="other-published">Other Published Post</option>
              <option value="confidential">Confidential Post</option>
              <option value="dept-review">Department Post in Review</option>
            </select>
          </div>

          <AbilityProvider ability={ability}>
            <Dashboard currentUser={currentUser} selectedPost={selectedPost} />
          </AbilityProvider>
        </>
      );
    }

    // Dashboard component with attribute-based checks
    function Dashboard({
      currentUser,
      selectedPost,
    }: {
      currentUser: User;
      selectedPost: Post;
    }) {
      const { isAllowed } = useAbility<Actions, Resources>();

      return (
        <div>
          <h1>ABAC Dashboard</h1>

          <div data-testid="user-info">
            User: {currentUser.role} (Level {currentUser.level},{" "}
            {currentUser.department})
          </div>

          <div data-testid="post-info">
            Post: {selectedPost.status} (
            {selectedPost.confidential ? "confidential" : "public"},{" "}
            {selectedPost.departmentId})
          </div>

          {/* Basic post actions */}
          {/* @ts-expect-error - Intentionally using non-condition for the test */}
          {isAllowed("read", "Post", selectedPost) && (
            <button data-testid="read-post">Read Post</button>
          )}

          {/* @ts-expect-error - Intentionally using non-condition for the test */}
          {isAllowed("update", "Post", selectedPost) && (
            <button data-testid="update-post">Update Post</button>
          )}

          {/* @ts-expect-error - Intentionally using non-condition for the test */}
          {isAllowed("delete", "Post", selectedPost) && (
            <button data-testid="delete-post">Delete Post</button>
          )}

          {/* Publishing permissions */}
          {/* @ts-expect-error - Intentionally using non-condition for the test */}
          {isAllowed("publish", "Post", selectedPost) && (
            <button data-testid="publish-post">Publish Post</button>
          )}

          {/* @ts-expect-error - Intentionally using non-condition for the test */}
          {isAllowed("approve", "Post", selectedPost) && (
            <button data-testid="approve-post">Approve Post</button>
          )}

          {/* Department management */}
          {isAllowed("manage", "Department", {
            departmentId: currentUser.department,
          }) && (
            <button data-testid="manage-department">Manage Department</button>
          )}

          {/* User management */}
          {/* @ts-expect-error - Intentionally using non-condition for the test */}
          {isAllowed("update", "User", currentUser) && (
            <button data-testid="update-self">Update Profile</button>
          )}

          {isAllowed("read", "User", {
            department: currentUser.department,
          }) && <button data-testid="view-team">View Team</button>}

          {/* Content creation */}
          {isAllowed("create", "Post", {
            departmentId: currentUser.department,
          }) && <button data-testid="create-post">Create Post</button>}
        </div>
      );
    }

    const ui = render(<App />);

    // Initial state: Editor (Level 3, Marketing) with Own Draft Post
    expect(ui.getByTestId("user-info")).toHaveTextContent(
      /user: editor \(Level 3, marketing\)/i
    );
    expect(ui.getByTestId("post-info")).toHaveTextContent(
      /post: draft \(public, marketing\)/i
    );

    // Should be able to read and update own draft
    expect(ui.getByTestId("read-post")).toBeInTheDocument();
    expect(ui.getByTestId("update-post")).toBeInTheDocument();
    expect(ui.getByTestId("publish-post")).toBeInTheDocument(); // Level 3 editor can publish
    expect(ui.queryByTestId("delete-post")).not.toBeInTheDocument(); // No delete permission
    expect(ui.queryByTestId("manage-department")).not.toBeInTheDocument(); // Not a manager
    expect(ui.getByTestId("update-self")).toBeInTheDocument(); // Can update own profile
    expect(ui.getByTestId("create-post")).toBeInTheDocument(); // Can create in own department

    // Switch to Admin user
    const userSelect = ui.getByLabelText("Current User:");
    await userEvent.selectOptions(userSelect, "admin");

    expect(ui.getByTestId("user-info")).toHaveTextContent(
      /user: admin \(Level 10, it\)/i
    );

    // Admin should have all permissions
    expect(ui.getByTestId("read-post")).toBeInTheDocument();
    expect(ui.getByTestId("update-post")).toBeInTheDocument();
    expect(ui.getByTestId("delete-post")).toBeInTheDocument();
    expect(ui.getByTestId("publish-post")).toBeInTheDocument();
    expect(ui.getByTestId("approve-post")).toBeInTheDocument();
    expect(ui.getByTestId("manage-department")).toBeInTheDocument();

    // Switch to Manager (Level 6, Marketing)
    await userEvent.selectOptions(userSelect, "manager");
    expect(ui.getByTestId("user-info")).toHaveTextContent(
      /user: manager \(Level 6, marketing\)/i
    );
    expect(ui.getByTestId("manage-department")).toBeInTheDocument(); // Manager can manage department
    expect(ui.getByTestId("view-team")).toBeInTheDocument(); // Can view team members
    expect(ui.getByTestId("approve-post")).toBeInTheDocument(); // Level 6 can approve

    // Switch to Junior Editor (Level 2, Sales)
    await userEvent.selectOptions(userSelect, "junior-editor");
    expect(ui.getByTestId("user-info")).toHaveTextContent(
      /user: editor \(Level 2, sales\)/i
    );
    expect(ui.queryByTestId("publish-post")).not.toBeInTheDocument(); // Level 2 cannot publish
    expect(ui.queryByTestId("approve-post")).not.toBeInTheDocument(); // Level 2 cannot approve

    // Test with confidential post
    const postSelect = ui.getByLabelText("Selected Post:");
    await userEvent.selectOptions(postSelect, "confidential");
    expect(ui.getByTestId("post-info")).toHaveTextContent(
      /post: published \(confidential, finance\)/i
    );
    expect(ui.queryByTestId("read-post")).not.toBeInTheDocument(); // Cannot read confidential from other department

    // Switch to Senior Editor with special permissions
    await userEvent.selectOptions(userSelect, "senior-editor");
    await userEvent.selectOptions(postSelect, "own-draft");
    expect(ui.getByTestId("user-info")).toHaveTextContent(
      /user: editor \(Level 4, marketing\)/i
    );
    expect(ui.getByTestId("delete-post")).toBeInTheDocument(); // Has DELETE_ANY_POST permission
    expect(ui.getByTestId("approve-post")).toBeInTheDocument(); // Level 4 can approve

    // Test department-specific permissions
    await userEvent.selectOptions(postSelect, "dept-review");
    expect(ui.getByTestId("post-info")).toHaveTextContent(
      /post: review \(public, marketing\)/i
    );
    expect(ui.getByTestId("read-post")).toBeInTheDocument(); // Can read department post
    expect(ui.getByTestId("publish-post")).toBeInTheDocument(); // Can publish department post in review
  });
});
