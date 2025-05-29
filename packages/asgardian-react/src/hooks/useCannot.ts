import { useAbilityContext } from "../context";

export const useCannot = <
  TActions extends string = string,
  TResources extends string = string,
>(
  action: TActions,
  resource: TResources
): boolean => {
  const ability = useAbilityContext<TActions, TResources>();

  return ability.notAllowed(action, resource);
};
