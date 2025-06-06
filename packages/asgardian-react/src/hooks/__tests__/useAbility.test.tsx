import { createAbility, CreateAbility } from "@nordic-ui/asgardian";
import type { FC, PropsWithChildren, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  render,
  renderHook,
  act,
  RenderHookResult,
} from "@testing-library/react";

import { AbilityProvider } from "../../";
import { useAbility } from "../useAbility";

type TestActions = "read" | "write" | "delete" | "publish" | "manage";
type TestResources = "Article" | "Comment" | "User" | "Profile" | "all";
type UseAbilityReturn = ReturnType<
  typeof useAbility<TestActions, TestResources>
>;

describe("useAbility Hook and AbilityProvider", () => {
  let testAbility: CreateAbility<TestActions, TestResources>;

  beforeEach(() => {
    testAbility = createAbility<TestActions, TestResources>();
  });

  // Helper component to test the hook within a provider
  const TestComponent: FC<{
    action: TestActions | TestActions[];
    resource: TestResources | TestResources[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any;
    checkType: "isAllowed" | "notAllowed";
  }> = ({ action, resource, data, checkType }) => {
    const { isAllowed, notAllowed } = useAbility<TestActions, TestResources>();
    const result =
      checkType === "isAllowed"
        ? isAllowed(action, resource, data)
          ? "Allowed"
          : "Not Allowed"
        : notAllowed(action, resource, data)
          ? "Not Allowed"
          : "Allowed";
    return <div data-testid="result">{result}</div>;
  };

  const renderAbilityWrapper = (
    currentAbility: CreateAbility<TestActions, TestResources>,
    children: ReactNode
  ) =>
    render(children, {
      wrapper: ({ children }) => (
        <AbilityProvider ability={currentAbility}>{children}</AbilityProvider>
      ),
    });

  // Wrapper for renderHook to include AbilityProvider
  const renderUseAbilityHook = (
    currentAbility: CreateAbility<TestActions, TestResources>
  ): RenderHookResult<UseAbilityReturn, unknown> => {
    return renderHook(() => useAbility<TestActions, TestResources>(), {
      wrapper: ({ children }) => (
        <AbilityProvider ability={currentAbility}>{children}</AbilityProvider>
      ),
    });
  };

  it("should provide isAllowed and notAllowed from the ability instance", () => {
    testAbility.can("read", "Article");

    const { result } = renderUseAbilityHook(testAbility);

    expect(result.current.isAllowed).toBeInstanceOf(Function);
    expect(result.current.notAllowed).toBeInstanceOf(Function);

    expect(result.current.isAllowed("read", "Article")).toBeTruthy();
    expect(result.current.notAllowed("read", "Article")).toBeFalsy();
    expect(result.current.isAllowed("write", "Article")).toBeFalsy();
  });

  it('should correctly check permissions defined with "can"', () => {
    testAbility.can("write", "Article");

    const ui = renderAbilityWrapper(
      testAbility,
      <TestComponent action="write" resource="Article" checkType="isAllowed" />
    );

    expect(ui.getByTestId("result").textContent).toBe("Allowed");
  });

  it('should correctly check permissions defined with "cannot"', () => {
    testAbility.can("write", "Article");
    testAbility.cannot("write", "Article"); // "cannot" overrides "can"

    const ui = renderAbilityWrapper(
      testAbility,
      <TestComponent action="write" resource="Article" checkType="isAllowed" />
    );

    expect(ui.getByTestId("result").textContent).toBe("Not Allowed");
  });

  it("should correctly use notAllowed", () => {
    testAbility.can("read", "Article");
    testAbility.cannot("publish", "Article");

    const { result } = renderUseAbilityHook(testAbility);

    expect(result.current.notAllowed("publish", "Article")).toBeTruthy();
    expect(result.current.notAllowed("read", "Article")).toBeFalsy();
  });

  it('should handle "manage" and "all" permissions', () => {
    testAbility.can("manage", "Article");

    const { result: manageArticleResult } = renderUseAbilityHook(testAbility);

    expect(
      manageArticleResult.current.isAllowed("read", "Article")
    ).toBeTruthy();
    expect(manageArticleResult.current.isAllowed("write", "Article")).toBe(
      true
    );
    expect(manageArticleResult.current.isAllowed("delete", "Article")).toBe(
      true
    );

    const allAbility = createAbility<TestActions, TestResources>();
    allAbility.can("read", "all");

    const { result: readAllResult } = renderUseAbilityHook(allAbility);

    expect(readAllResult.current.isAllowed("read", "Article")).toBeTruthy();
    expect(readAllResult.current.isAllowed("read", "Comment")).toBeTruthy();

    const manageAllAbility = createAbility<TestActions, TestResources>();
    manageAllAbility.can("manage", "all");

    const { result: manageAllResult } = renderUseAbilityHook(manageAllAbility);

    expect(manageAllResult.current.isAllowed("delete", "Comment")).toBeTruthy();
    expect(
      manageAllResult.current.isAllowed("publish", "Article")
    ).toBeTruthy();
  });

  it("should correctly check permissions with conditions", () => {
    const userData = { id: 1, role: "editor" };
    const post = { authorId: 1, status: "draft" };
    const otherPost = { authorId: 2, status: "published" };

    testAbility.can("write", "Article", { authorId: { $eq: userData.id } });
    testAbility.can("publish", "Article", { status: { $eq: "draft" } });

    const { result } = renderUseAbilityHook(testAbility);

    expect(
      result.current.isAllowed("write", "Article", { authorId: userData.id })
    ).toBeTruthy();
    expect(
      result.current.isAllowed("write", "Article", {
        authorId: otherPost.authorId,
      })
    ).toBeFalsy();
    expect(result.current.isAllowed("publish", "Article", post)).toBeTruthy();
    expect(
      result.current.isAllowed("publish", "Article", {
        authorId: userData.id,
        status: "review",
      })
    ).toBeFalsy();
  });

  it("should check against multiple actions or resources", () => {
    testAbility.can(["read", "write"], "Article");
    testAbility.can("publish", ["Article", "Comment"]);

    const { result } = renderUseAbilityHook(testAbility);

    expect(result.current.isAllowed("read", "Article")).toBeTruthy();
    expect(result.current.isAllowed("write", "Article")).toBeTruthy();
    expect(result.current.isAllowed("delete", "Article")).toBeFalsy();

    expect(
      result.current.isAllowed(["read", "delete"], "Article")
    ).toBeTruthy(); // One of them is allowed
    expect(result.current.isAllowed(["delete", "manage"], "Article")).toBe(
      false
    ); // None allowed

    expect(result.current.isAllowed("publish", "Article")).toBeTruthy();
    expect(result.current.isAllowed("publish", "Comment")).toBeTruthy();
    expect(result.current.isAllowed("publish", "User")).toBeFalsy(); // Assuming User is not TestResource

    expect(
      result.current.isAllowed("publish", ["Article", "User"])
    ).toBeTruthy(); // One of them is allowed
    expect(result.current.isAllowed("publish", ["User", "Profile"])).toBe(
      false
    );
  });

  it("should throw an error if useAbility is called outside of AbilityProvider", () => {
    // Suppress console.error output from React for this expected error
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => renderHook(() => useAbility())).toThrow(
      "useAbilityContext must be used within an AbilityProvider"
    );

    console.error = originalError; // Restore console.error
  });

  it("should throw an error if AbilityProvider does not receive an ability instance (via context)", () => {
    const originalError = console.error;
    console.error = vi.fn(); // Suppress React's error boundary output

    const FaultyProvider: FC<PropsWithChildren> = ({ children }) => (
      // @ts-expect-error - Intentionally passing null to test error handling
      <AbilityProvider ability={null}>{children}</AbilityProvider>
    );

    expect(() => {
      renderHook(() => useAbility(), {
        wrapper: FaultyProvider,
      });
    }).toThrow(
      "Ability instance not found in AbilityProvider. Did you pass the `ability` prop?"
    );

    console.error = originalError;
  });

  it("should reflect changes if the ability prop on AbilityProvider changes", () => {
    const initialAbility = createAbility<TestActions, TestResources>();
    initialAbility.can("read", "Article");

    const newAbility = createAbility<TestActions, TestResources>();
    newAbility.can("write", "Article");

    let currentAbility = initialAbility;

    const { result, rerender } = renderHook(
      () => useAbility<TestActions, TestResources>(),
      {
        wrapper: ({ children }) => (
          <AbilityProvider ability={currentAbility}>{children}</AbilityProvider>
        ),
      }
    );

    expect(result.current.isAllowed("read", "Article")).toBeTruthy();
    expect(result.current.isAllowed("write", "Article")).toBeFalsy();

    act(() => {
      currentAbility = newAbility;
      rerender();
    });

    expect(result.current.isAllowed("read", "Article")).toBeFalsy();
    expect(result.current.isAllowed("write", "Article")).toBeTruthy();
  });

  it("should work with default string actions/resources if not specified", () => {
    const genericAbility = createAbility<"view", "Dashboard">(); // Uses default string types
    genericAbility.can("view", "Dashboard");

    const { result } = renderHook(() => useAbility(), {
      // No generics passed to useAbility
      wrapper: ({ children }) => (
        <AbilityProvider ability={genericAbility}>{children}</AbilityProvider>
      ),
    });

    expect(result.current.isAllowed("view", "Dashboard")).toBeTruthy();
    expect(result.current.isAllowed("edit", "Dashboard")).toBeFalsy();
  });
});
