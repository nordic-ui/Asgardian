import type { Condition } from "@nordic-ui/asgardian";

import { useAbility } from "../hooks";

/**
 * A hook to check if a user can perform a specific action on a resource.
 *
 * @param action - The action to check (e.g., `read`, `create`, `update`, `delete`).
 * @param resource - The resource to check the action against (e.g., `Post`, `Comment`).
 * @param conditions - Optional conditions to apply to the action check.
 * @returns An object containing:
 *  - `can`: A boolean indicating if the action is allowed on the resource.
 *  - `reason`: A string providing the reason for the action's allowance or denial.
 */
export const useCan = <
  TActions extends string = string,
  TResources extends string = string,
>(
  action: TActions,
  resource: TResources,
  conditions?: Condition
): {
  can: boolean;
  reason: string | undefined;
} => {
  const { isAllowed, getReason } = useAbility<TActions, TResources>();

  return {
    can: isAllowed(action, resource, conditions),
    reason: getReason(action, resource, conditions),
  };
};
