import { type ChangeEvent, useMemo, useState } from "react";
import { createAbility } from "@nordic-ui/asgardian";

import { AbilityProvider, useAbility } from "../..";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("RBAC Ability Hook", () => {
  it("should create and use abilities based on user roles", async () => {
    type Actions = "create" | "read" | "update" | "delete" | "manage";
    type Resources = "Post" | "Comment" | "User" | "all";

    // Create ability instance based on user role
    function createUserAbility(userRole: string) {
      const ability = createAbility<Actions, Resources>();

      switch (userRole) {
        case "admin":
          ability.can("manage", "all");
          break;
        case "editor":
          ability.can(["create", "read", "update"], "Post");
          ability.can(["read", "create"], "Comment");
          break;
        case "user":
          ability.can("read", "Post");
          ability.can("create", "Comment");
          break;
        default:
          ability.can("read", "Post");
      }

      return ability;
    }

    // Root component
    function App() {
      const [user, setUser] = useState({ role: "editor" });
      const ability = useMemo(() => createUserAbility(user.role), [user.role]);

      const handleRoleChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setUser({ role: event.target.value });
      };

      return (
        <>
          <label htmlFor="role-select">Select User Role:</label>
          <select
            id="role-select"
            value={user.role}
            onChange={handleRoleChange}
          >
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="user">User</option>
            <option value="guest">Guest</option>
          </select>

          <AbilityProvider ability={ability}>
            <Dashboard />
          </AbilityProvider>
        </>
      );
    }

    // Component using the hook
    function Dashboard() {
      const { isAllowed, notAllowed } = useAbility<Actions, Resources>();

      return (
        <div>
          <h1>Dashboard</h1>

          {isAllowed("create", "Post") && <button>Create New Post</button>}

          {isAllowed(["update", "delete"], "Post") && (
            <button>Manage Posts</button>
          )}

          {notAllowed("delete", "User") && <p>You cannot delete users</p>}
        </div>
      );
    }

    const ui = render(<App />);

    expect(ui.getByText(/select user role/i)).toBeInTheDocument();
    expect(ui.getByText(/dashboard/i)).toBeInTheDocument();
    expect(ui.getByText(/dashboard/i)).toBeInTheDocument();
    expect(ui.getByText(/create new post/i)).toBeInTheDocument();
    expect(ui.getByText(/manage posts/i)).toBeInTheDocument();
    expect(ui.getByText(/you cannot delete users/i)).toBeInTheDocument();

    const selectElement = ui.getByRole("combobox");

    await userEvent.selectOptions(selectElement, "Admin");
    expect(selectElement).toHaveValue("admin");

    expect(ui.queryByText(/you cannot delete users/i)).not.toBeInTheDocument();

    await userEvent.selectOptions(selectElement, "Guest");
    expect(selectElement).toHaveValue("guest");

    expect(ui.queryByText(/you cannot delete users/i)).toBeInTheDocument();
  });
});
