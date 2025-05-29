import { useAbilityContext } from "../context";

export const useCan = <
  TActions extends string = string,
  TResources extends string = string,
>(
  action: TActions,
  resource: TResources
): boolean => {
  const ability = useAbilityContext<TActions, TResources>();

  return ability.isAllowed(action, resource);
};
