import { createAbility, ForbiddenError } from "@nordic-ui/asgardian";
import { renderHook, RenderHookResult } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AbilityProvider } from "../../context";
import { useThrowIfNotAllowed } from "../useThrowIfNotAllowed";

type TestActions = "read" | "write" | "delete" | "publish" | "manage";
type TestResources = "Article" | "Comment" | "User" | "Profile" | "all";
type UseAbilityReturn = ReturnType<
  typeof useThrowIfNotAllowed<TestActions, TestResources>
>;

describe("useThrowIfNotAllowed Hook", () => {
  const renderUseThrowIfNotAllowedHook = (
    action: TestActions,
    subject: TestResources
  ): RenderHookResult<UseAbilityReturn, unknown> => {
    const testAbility = createAbility<TestActions, TestResources>();
    testAbility.can("read", "Article").reason("Can read articles");
    testAbility.cannot("write", "Article").reason("Cannot write articles");

    return renderHook(
      () => useThrowIfNotAllowed<TestActions, TestResources>(action, subject),
      {
        wrapper: ({ children }) => (
          <AbilityProvider ability={testAbility}>{children}</AbilityProvider>
        ),
      }
    );
  };

  it("should not throw an error for an allowed action on a resource", () => {
    expect(() =>
      renderUseThrowIfNotAllowedHook("read", "Article")
    ).not.toThrowError(ForbiddenError);

    expect(
      renderUseThrowIfNotAllowedHook("read", "Article").result.current
    ).toBeUndefined();
  });

  it("should throw an error for a disallowed action on a resource", () => {
    expect(() => renderUseThrowIfNotAllowedHook("publish", "Article")).toThrow(
      ForbiddenError
    );
    expect(() =>
      renderUseThrowIfNotAllowedHook("publish", "Article")
    ).toThrowError("Access denied");
  });

  it("should throw an error with the correct reason for a disallowed action", () => {
    expect(() =>
      renderUseThrowIfNotAllowedHook("write", "Article")
    ).toThrowError(ForbiddenError);
    expect(() =>
      renderUseThrowIfNotAllowedHook("write", "Article")
    ).toThrowError("Cannot write articles");
  });
});
