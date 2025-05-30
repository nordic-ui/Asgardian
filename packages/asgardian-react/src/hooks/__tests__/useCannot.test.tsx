import { renderHook, RenderHookResult } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useCannot } from "../useCannot";
import { createAbility } from "@nordic-ui/asgardian";
import { AbilityProvider } from "../../context";

type TestActions = "read" | "write" | "delete" | "publish" | "manage";
type TestResources = "Article" | "Comment" | "User" | "Profile" | "all";
type UseAbilityReturn = ReturnType<
  typeof useCannot<TestActions, TestResources>
>;

describe("useCannot Hook", () => {
  const renderUseCannotHook = (
    action: TestActions,
    subject: TestResources
  ): RenderHookResult<UseAbilityReturn, unknown> => {
    const testAbility = createAbility<TestActions, TestResources>();
    testAbility.can("read", "Article");
    testAbility.can(["read", "write"], "Comment");

    return renderHook(
      () => useCannot<TestActions, TestResources>(action, subject),
      {
        wrapper: ({ children }) => (
          <AbilityProvider ability={testAbility}>{children}</AbilityProvider>
        ),
      }
    );
  };

  it("should return false for an action not allowed on a resource", () => {
    const { result } = renderUseCannotHook("delete", "Article");

    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe("boolean");
    expect(result.current).toBe(true);
  });

  it("should return true for an action allowed on a resource", () => {
    const { result } = renderUseCannotHook("write", "Comment");

    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe("boolean");
    expect(result.current).toBe(false);
  });
});
