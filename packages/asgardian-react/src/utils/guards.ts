import { CreateAbility } from "@nordic-ui/asgardian";

/**
 * Type guard to check if the input is a valid `ability`.
 *
 * @param input - The input to check.
 * @returns true if the input is a valid ability, false otherwise.
 */
export const isAbilityGuard = <
  TActions extends string,
  TResources extends string,
>(
  input: unknown
): input is { ability: CreateAbility<TActions, TResources> } => {
  if (!input || input === null || typeof input !== "object") return false;

  if (
    "ability" in input &&
    input.ability !== null &&
    typeof input.ability === "object" &&
    "can" in input.ability &&
    typeof input.ability.can === "function" &&
    "cannot" in input.ability &&
    typeof input.ability.cannot === "function" &&
    "isAllowed" in input.ability &&
    typeof input.ability.isAllowed === "function" &&
    "notAllowed" in input.ability &&
    typeof input.ability.notAllowed === "function" &&
    "rules" in input.ability &&
    Array.isArray(input.ability.rules)
  ) {
    return true;
  }

  return false;
};
