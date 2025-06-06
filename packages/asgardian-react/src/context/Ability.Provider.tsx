import { useMemo, type PropsWithChildren } from "react";
import type { CreateAbility } from "@nordic-ui/asgardian";

import { AbilityContext } from "./Ability.Context";

type AbilityProviderProps<
  TActions extends string = string,
  TResources extends string = string,
> = PropsWithChildren<{
  ability: CreateAbility<TActions, TResources>;
}>;

/**
 * A provider component that supplies an ability instance to its children.
 *
 * @template TActions - The type of actions that can be performed.
 * @template TResources - The type of resources that can be acted upon.
 */
export const AbilityProvider = <
  TActions extends string = string,
  TResources extends string = string,
>({
  ability,
  children,
}: AbilityProviderProps<TActions, TResources>) => {
  if (!ability) {
    throw new Error(
      "Ability instance not found in AbilityProvider. Did you pass the `ability` prop?"
    );
  }

  const contextValue = useMemo(() => ({ ability }), [ability]);

  return (
    <AbilityContext.Provider value={contextValue}>
      {children}
    </AbilityContext.Provider>
  );
};
