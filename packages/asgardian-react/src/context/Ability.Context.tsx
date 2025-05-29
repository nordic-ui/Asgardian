import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from "react";
import type { CreateAbility } from "@nordic-ui/asgardian";

import { assertType, isAbilityGuard } from "../utils";

const AbilityContext = createContext<{ ability: unknown } | null>(null);

type AbilityProviderProps<
  TActions extends string = string,
  TResources extends string = string,
> = PropsWithChildren<{
  ability: CreateAbility<TActions, TResources>;
}>;

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

export const useAbilityContext = <
  TActions extends string = string,
  TResources extends string = string,
>(): CreateAbility<TActions, TResources> => {
  const context = useContext(AbilityContext);

  if (!context) {
    throw new Error("useAbilityContext must be used within an AbilityProvider");
  }

  assertType<{ ability: CreateAbility<TActions, TResources> }>(
    context,
    isAbilityGuard
  );

  return context.ability;
};
