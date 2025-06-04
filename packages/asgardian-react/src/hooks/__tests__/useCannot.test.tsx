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
    testAbility.can("read", "Article").reason("Cannot read articles");
    testAbility
      .can(["read", "write"], "Comment")
      .reason("Cannot read or write comments");

    return renderHook(
      () => useCannot<TestActions, TestResources>(action, subject),
      {
        wrapper: ({ children }) => (
          <AbilityProvider ability={testAbility}>{children}</AbilityProvider>
        ),
      }
    );
  };

  it("should return true for an action not allowed on a resource", () => {
    const { result } = renderUseCannotHook("delete", "Article");

    expect(result.current).toBeDefined();
    expect(typeof result.current.cannot).toBe("boolean");
    expect(result.current.cannot).toBeTruthy();
  });

  it("should return false for an action allowed on a resource", () => {
    const { result } = renderUseCannotHook("write", "Comment");

    expect(result.current).toBeDefined();
    expect(typeof result.current.cannot).toBe("boolean");
    expect(result.current.cannot).toBeFalsy();
  });

  it("should return the correct reason for an disallowed action", () => {
    const { result } = renderUseCannotHook("read", "Article");

    expect(result.current).toBeDefined();
    expect(typeof result.current.reason).toBe("string");
    expect(result.current.reason).toBe("Cannot read articles");
  });

  it("should return the correct reason for an array of actions", () => {
    const { result: readResult } = renderUseCannotHook("read", "Comment");
    const { result: writeResult } = renderUseCannotHook("write", "Comment");

    expect(readResult.current).toBeDefined();
    expect(typeof readResult.current.reason).toBe("string");
    expect(readResult.current.reason).toBe("Cannot read or write comments");

    expect(writeResult.current).toBeDefined();
    expect(typeof writeResult.current.reason).toBe("string");
    expect(writeResult.current.reason).toBe("Cannot read or write comments");
  });

  it("should return undefined reason for an action not allowed on a resource", () => {
    const { result } = renderUseCannotHook("delete", "Comment");

    expect(result.current).toBeDefined();
    expect(typeof result.current.reason).toBe("undefined");
    expect(result.current.reason).toBeUndefined(); // No reason set for this action
  });
});
