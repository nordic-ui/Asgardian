import type { Condition } from "@nordic-ui/asgardian";

import { useAbility } from ".";

/**
 * Hook to get the reason for an action on a resource.
 *
 * @param action - The action to check (e.g., `read`, `create`, `update`, `delete`).
 * @param resource - The resource to check the action against (e.g., `Post`, `Comment`).
 * @param conditions - Optional conditions to apply to the action check.
 * @returns A string providing the reason for the action's allowance or denial, or undefined if no reason is available.
 */
export const useReason = <
  TActions extends string = string,
  TResources extends string = string,
>(
  action: TActions,
  resource: TResources,
  conditions?: Condition
): string | undefined => {
  const { getReason } = useAbility<TActions, TResources>();

  return getReason(action, resource, conditions);
};
