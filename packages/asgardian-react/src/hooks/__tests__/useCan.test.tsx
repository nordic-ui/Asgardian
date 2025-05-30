import { renderHook, RenderHookResult } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useCan } from "../useCan";
import { createAbility } from "@nordic-ui/asgardian";
import { AbilityProvider } from "../../context";

type TestActions = "read" | "write" | "delete" | "publish" | "manage";
type TestResources = "Article" | "Comment" | "User" | "Profile" | "all";
type UseAbilityReturn = ReturnType<typeof useCan<TestActions, TestResources>>;

describe("useCan Hook", () => {
  const renderUseCanHook = (
    action: TestActions,
    subject: TestResources
  ): RenderHookResult<UseAbilityReturn, unknown> => {
    const testAbility = createAbility<TestActions, TestResources>();
    testAbility.can("read", "Article");
    testAbility.can(["read", "write"], "Comment");

    return renderHook(
      () => useCan<TestActions, TestResources>(action, subject),
      {
        wrapper: ({ children }) => (
          <AbilityProvider ability={testAbility}>{children}</AbilityProvider>
        ),
      }
    );
  };

  it("should return false for an action not allowed on a resource", () => {
    const { result } = renderUseCanHook("delete", "Article");

    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe("boolean");
    expect(result.current).toBe(false);
  });

  it("should return true for an action allowed on a resource", () => {
    const { result } = renderUseCanHook("write", "Comment");

    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe("boolean");
    expect(result.current).toBe(true);
  });
});
