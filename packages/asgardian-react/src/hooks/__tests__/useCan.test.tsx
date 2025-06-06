import { createAbility } from "@nordic-ui/asgardian";
import { renderHook, RenderHookResult } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AbilityProvider } from "../../context";
import { useCan } from "../useCan";

type TestActions = "read" | "write" | "delete" | "publish" | "manage";
type TestResources = "Article" | "Comment" | "User" | "Profile" | "all";
type UseAbilityReturn = ReturnType<typeof useCan<TestActions, TestResources>>;

describe("useCan Hook", () => {
  const renderUseCanHook = (
    action: TestActions,
    subject: TestResources
  ): RenderHookResult<UseAbilityReturn, unknown> => {
    const testAbility = createAbility<TestActions, TestResources>();
    testAbility.can("read", "Article").reason("Can read articles");
    testAbility
      .can(["read", "write"], "Comment")
      .reason("Can read and write comments");

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
    expect(typeof result.current.can).toBe("boolean");
    expect(result.current.can).toBeFalsy();
  });

  it("should return true for an action allowed on a resource", () => {
    const { result } = renderUseCanHook("write", "Comment");

    expect(result.current).toBeDefined();
    expect(typeof result.current.can).toBe("boolean");
    expect(result.current.can).toBeTruthy();
  });

  it("should return the correct reason for an allowed action", () => {
    const { result } = renderUseCanHook("read", "Article");

    expect(result.current).toBeDefined();
    expect(typeof result.current.reason).toBe("string");
    expect(result.current.reason).toBe("Can read articles");
  });

  it("should return the correct reason for an array of actions", () => {
    const { result: readResult } = renderUseCanHook("read", "Comment");
    const { result: writeResult } = renderUseCanHook("write", "Comment");

    expect(readResult.current).toBeDefined();
    expect(typeof readResult.current.reason).toBe("string");
    expect(readResult.current.reason).toBe("Can read and write comments");

    expect(writeResult.current).toBeDefined();
    expect(typeof writeResult.current.reason).toBe("string");
    expect(writeResult.current.reason).toBe("Can read and write comments");
  });

  it("should return undefined reason for an action not allowed on a resource", () => {
    const { result } = renderUseCanHook("delete", "Comment");

    expect(result.current).toBeDefined();
    expect(typeof result.current.reason).toBe("undefined");
    expect(result.current.reason).toBeUndefined(); // No reason set for this action
  });
});
