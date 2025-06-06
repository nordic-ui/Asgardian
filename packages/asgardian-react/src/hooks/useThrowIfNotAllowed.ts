import type { Condition } from "@nordic-ui/asgardian";

import { useAbility } from ".";

export const useThrowIfNotAllowed = <
  TActions extends string = string,
  TResources extends string = string,
>(
  action: TActions,
  resource: TResources,
  conditions?: Condition
): void => {
  const { throwIfNotAllowed } = useAbility<TActions, TResources>();

  return throwIfNotAllowed(action, resource, conditions);
};
