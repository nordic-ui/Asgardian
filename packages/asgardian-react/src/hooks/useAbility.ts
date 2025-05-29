import { useMemo } from "react";
import { useAbilityContext } from "../context/Ability.Context";

export const useAbility = <
  TActions extends string = string,
  TResources extends string = string,
>() => {
  const ability = useAbilityContext<TActions, TResources>();

  return useMemo(
    () => ({
      isAllowed: (...args: Parameters<typeof ability.isAllowed>) =>
        ability.isAllowed(...args),
      notAllowed: (...args: Parameters<typeof ability.notAllowed>) =>
        ability.notAllowed(...args),
      can: (...args: Parameters<typeof ability.isAllowed>) =>
        ability.isAllowed(...args),
      cannot: (...args: Parameters<typeof ability.notAllowed>) =>
        ability.notAllowed(...args),
    }),
    [ability]
  );
};
