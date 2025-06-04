import { type ChangeEvent, useMemo, useState } from "react";
import { createAbility } from "@nordic-ui/asgardian";

import { AbilityProvider, useAbility } from "../..";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("ABAC Ability Hook 2", () => {
  it("should handle attribute-based access control with conditions", async () => {
    type Actions = "read" | "update" | "delete" | "publish";
    type Resources = "Post" | "User";

    interface User {
      id: number;
      role: string;
      department: string;
      level: number;
    }

    interface Post {
      id: number;
      authorId: number;
      department: string;
      status: "draft" | "published";
      confidential: boolean;
    }

    // Create ability based on user attributes
    function createAbilityForUser(user: User) {
      const ability = createAbility<Actions, Resources>();

      // Can always update own profile
      ability.can("update", "User", { id: user.id });

      // Can read own posts
      ability.can(["read", "update"], "Post", { authorId: user.id });

      // Department-based permissions
      ability.can("read", "Post", {
        department: user.department,
        confidential: false,
      });

      // Level-based permissions
      if (user.level >= 3) {
        ability.can("publish", "Post", { department: user.department });
      }

      if (user.level >= 5) {
        ability.can("delete", "Post", { department: user.department });
      }

      // Role-based overrides
      if (user.role === "admin") {
        ability.can("manage", "all");
      }

      return ability;
    }

    function App() {
      const [user, setUser] = useState<User>({
        id: 1,
        role: "editor",
        department: "marketing",
        level: 3,
      });

      const testPost: Post = {
        id: 1,
        authorId: 1,
        department: "marketing",
        status: "draft",
        confidential: false,
      };

      const otherPost: Post = {
        id: 2,
        authorId: 2,
        department: "sales",
        status: "published",
        confidential: true,
      };

      const ability = useMemo(() => createAbilityForUser(user), [user]);

      const handleUserChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const userType = event.target.value;
        switch (userType) {
          case "admin":
            setUser({ id: 1, role: "admin", department: "it", level: 10 });
            break;
          case "senior":
            setUser({
              id: 1,
              role: "editor",
              department: "marketing",
              level: 5,
            });
            break;
          case "junior":
            setUser({
              id: 1,
              role: "editor",
              department: "marketing",
              level: 2,
            });
            break;
          default:
            setUser({
              id: 1,
              role: "editor",
              department: "marketing",
              level: 3,
            });
        }
      };

      return (
        <>
          <label htmlFor="user-select">User Type:</label>
          <select id="user-select" onChange={handleUserChange}>
            <option value="regular">Regular Editor (Level 3)</option>
            <option value="admin">Admin (Level 10)</option>
            <option value="senior">Senior Editor (Level 5)</option>
            <option value="junior">Junior Editor (Level 2)</option>
          </select>

          <AbilityProvider ability={ability}>
            <Dashboard user={user} testPost={testPost} otherPost={otherPost} />
          </AbilityProvider>
        </>
      );
    }

    function Dashboard({
      user,
      testPost,
      otherPost,
    }: {
      user: User;
      testPost: Post;
      otherPost: Post;
    }) {
      const { isAllowed } = useAbility<Actions, Resources>();

      return (
        <div>
          <h1>ABAC Dashboard</h1>

          <div data-testid="user-info">
            {user.role} (Level {user.level}, {user.department})
          </div>

          {/* Own post permissions */}
          <div data-testid="own-post">
            {/* @ts-expect-error - Intentionally using non-condition for the test */}
            {isAllowed("read", "Post", testPost) && (
              <span>Can read own post</span>
            )}
            {/* @ts-expect-error - Intentionally using non-condition for the test */}
            {isAllowed("update", "Post", testPost) && (
              <span>Can update own post</span>
            )}
            {/* @ts-expect-error - Intentionally using non-condition for the test */}
            {isAllowed("publish", "Post", testPost) && (
              <span>Can publish own post</span>
            )}
            {/* @ts-expect-error - Intentionally using non-condition for the test */}
            {isAllowed("delete", "Post", testPost) && (
              <span>Can delete own post</span>
            )}
          </div>

          {/* Other post permissions */}
          <div data-testid="other-post">
            {/* @ts-expect-error - Intentionally using non-condition for the test */}
            {isAllowed("read", "Post", otherPost) && (
              <span>Can read other post</span>
            )}
            {/* @ts-expect-error - Intentionally using non-condition for the test */}
            {isAllowed("update", "Post", otherPost) && (
              <span>Can update other post</span>
            )}
          </div>

          {/* User permissions */}
          <div data-testid="user-perms">
            {/* @ts-expect-error - Intentionally using non-condition for the test */}
            {isAllowed("update", "User", user) && (
              <span>Can update profile</span>
            )}
            {isAllowed("delete", "User", { id: 999 }) && (
              <span>Can delete others</span>
            )}
          </div>
        </div>
      );
    }

    const ui = render(<App />);

    // Regular Editor (Level 3, Marketing)
    expect(ui.getByTestId("user-info")).toHaveTextContent(
      "editor (Level 3, marketing)"
    );
    expect(ui.getByTestId("own-post")).toHaveTextContent("Can read own post");
    expect(ui.getByTestId("own-post")).toHaveTextContent("Can update own post");
    expect(ui.getByTestId("own-post")).toHaveTextContent(
      "Can publish own post"
    ); // Level 3 can publish
    expect(ui.getByTestId("own-post")).not.toHaveTextContent(
      "Can delete own post"
    ); // Level 3 cannot delete
    expect(ui.getByTestId("other-post")).not.toHaveTextContent(
      "Can read other post"
    ); // Confidential + different dept
    expect(ui.getByTestId("user-perms")).toHaveTextContent(
      "Can update profile"
    );
    expect(ui.getByTestId("user-perms")).not.toHaveTextContent(
      "Can delete others"
    );

    // Switch to Senior Editor (Level 5)
    const selectElement = ui.getByRole("combobox");
    await userEvent.selectOptions(selectElement, "senior");

    expect(ui.getByTestId("user-info")).toHaveTextContent(
      "editor (Level 5, marketing)"
    );
    expect(ui.getByTestId("own-post")).toHaveTextContent("Can delete own post"); // Level 5 can delete

    // Switch to Junior Editor (Level 2)
    await userEvent.selectOptions(selectElement, "junior");

    expect(ui.getByTestId("user-info")).toHaveTextContent(
      "editor (Level 2, marketing)"
    );
    expect(ui.getByTestId("own-post")).not.toHaveTextContent(
      "Can publish own post"
    ); // Level 2 cannot publish
    expect(ui.getByTestId("own-post")).not.toHaveTextContent(
      "Can delete own post"
    ); // Level 2 cannot delete

    // Switch to Admin
    await userEvent.selectOptions(selectElement, "admin");

    expect(ui.getByTestId("user-info")).toHaveTextContent(
      "admin (Level 10, it)"
    );
    expect(ui.getByTestId("own-post")).toHaveTextContent("Can delete own post"); // Admin can do everything
    expect(ui.getByTestId("other-post")).toHaveTextContent(
      "Can read other post"
    ); // Admin overrides confidentiality
    expect(ui.getByTestId("other-post")).toHaveTextContent(
      "Can update other post"
    );
    expect(ui.getByTestId("user-perms")).toHaveTextContent("Can delete others"); // Admin can delete others
  });
});
