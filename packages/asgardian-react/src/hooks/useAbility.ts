import { useMemo, useContext } from "react";
import type { CreateAbility } from "@nordic-ui/asgardian";

import { assert, assertType, isAbilityGuard } from "../utils";
import { AbilityContext } from "../context";

/**
 * A hook to access the ability context and provide a simplified API for checking permissions.
 *
 * @template TActions - The type of actions that can be performed (default is `string`).
 * @template TResources - The type of resources that can be acted upon (default is `string`).
 * @returns An object with methods to check permissions:
 *  - `isAllowed`: Checks if an action is allowed on a resource.
 *  - `notAllowed`: Checks if an action is not allowed on a resource.
 *  - `can`: Alias for `isAllowed`.
 *  - `cannot`: Alias for `notAllowed`.
 *  - `getReason`: Retrieves the reason for the action's allowance or denial.
 */
export const useAbility = <
  TActions extends string = string,
  TResources extends string = string,
>() => {
  const context = useContext(AbilityContext);

  assert(!!context, "useAbilityContext must be used within an AbilityProvider");
  assertType<{ ability: CreateAbility<TActions, TResources> }>(
    context,
    isAbilityGuard
  );

  const { ability } = context;

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
      getReason: (...args: Parameters<typeof ability.getReason>) =>
        ability.getReason(...args),
      throwIfNotAllowed: (
        ...args: Parameters<typeof ability.throwIfNotAllowed>
      ) => ability.throwIfNotAllowed(...args),
    }),
    [ability]
  );
};
