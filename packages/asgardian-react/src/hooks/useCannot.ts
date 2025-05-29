import type { Condition } from "@nordic-ui/asgardian";

import { useAbilityContext } from "../context";

export const useCannot = <
  TActions extends string = string,
  TResources extends string = string,
>(
  action: TActions,
  resource: TResources,
  conditions?: Condition
): boolean => {
  const { notAllowed } = useAbilityContext<TActions, TResources>();

  return notAllowed(action, resource, conditions);
};
