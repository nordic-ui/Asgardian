import { createAbility } from "@nordic-ui/asgardian";
import { renderHook, RenderHookResult } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useReason } from "../useReason";
import { AbilityProvider } from "../../context";

type TestActions = "read" | "write" | "delete" | "publish" | "manage";
type TestResources = "Article" | "Comment" | "User" | "Profile" | "all";
type UseAbilityReturn = ReturnType<
  typeof useReason<TestActions, TestResources>
>;

describe("useReason Hook", () => {
  const renderUseReasonHook = (
    action: TestActions,
    subject: TestResources
  ): RenderHookResult<UseAbilityReturn, unknown> => {
    const testAbility = createAbility<TestActions, TestResources>();
    testAbility.can("read", "Article").reason("Can read articles");
    testAbility
      .can(["read", "write"], "Comment")
      .reason("Can read and write comments");
    testAbility.cannot("delete", "Article").reason("Cannot delete articles");

    return renderHook(
      () => useReason<TestActions, TestResources>(action, subject),
      {
        wrapper: ({ children }) => (
          <AbilityProvider ability={testAbility}>{children}</AbilityProvider>
        ),
      }
    );
  };

  it("should return undefined for an action not allowed on a resource", () => {
    const { result } = renderUseReasonHook("publish", "Article");

    expect(result.current).toBeUndefined();
  });

  it("should return the correct reason for an allowed action", () => {
    const { result } = renderUseReasonHook("write", "Comment");

    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe("string");
    expect(result.current).toBe("Can read and write comments");
  });

  it("should return the correct reason for a disallowed action", () => {
    const { result } = renderUseReasonHook("delete", "Article");

    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe("string");
    expect(result.current).toBe("Cannot delete articles");
  });
});
