import type { Condition } from "@nordic-ui/asgardian";

import { useAbilityContext } from "../context";

export const useCan = <
  TActions extends string = string,
  TResources extends string = string,
>(
  action: TActions,
  resource: TResources,
  conditions?: Condition
): boolean => {
  const { isAllowed } = useAbilityContext<TActions, TResources>();

  return isAllowed(action, resource, conditions);
};
