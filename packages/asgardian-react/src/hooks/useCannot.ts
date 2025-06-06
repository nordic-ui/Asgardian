import type { Condition } from "@nordic-ui/asgardian";

import { useAbility } from "../hooks";

/**
 * A hook to check if a user cannot perform a specific action on a resource.
 *
 * @param action - The action to check (e.g., `read`, `create`, `update`, `delete`).
 * @param resource - The resource to check the action against (e.g., `Post`, `Comment`).
 * @param conditions - Optional conditions to apply to the action check.
 * @returns An object containing:
 *  - `cannot`: A boolean indicating if the action is disallowed on the resource.
 *  - `reason`: A string providing the reason for the action's allowance or denial.
 */
export const useCannot = <
  TActions extends string = string,
  TResources extends string = string,
>(
  action: TActions,
  resource: TResources,
  conditions?: Condition
): {
  cannot: boolean;
  reason: string | undefined;
} => {
  const { notAllowed, getReason } = useAbility<TActions, TResources>();

  return {
    cannot: notAllowed(action, resource, conditions),
    reason: getReason(action, resource, conditions),
  };
};
