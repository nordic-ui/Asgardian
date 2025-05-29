/**
 * Asserts that a condition is true, throwing an error if it is not.
 *
 * @param condition - The condition to be checked. It can be a boolean value or a function that returns a boolean value.
 * @param message - The error message to be thrown if the condition is false. It can be a string or an Error object.
 * @throws {Error} - Throws an error if the condition is false.
 */
export function assert(
  condition: boolean | (() => boolean),
  message: string | Error
): asserts condition {
  const result = typeof condition === "function" ? condition() : condition;
  if (!result) throw typeof message === "string" ? new Error(message) : message;
}

/**
 * Type guard function type.
 *
 * @internal Should not be exported.
 */
type TypeGuard<T> = (input: unknown) => input is T;

/**
 * Asserts the type of input to be of `T`.
 *
 * This is preferable to using `as` for type casting.
 *
 * @param input - The input to be checked.
 * @param guard - The type guard function to validate the input.
 * @param message - The error message to be thrown if the input does not match the type `T`. It can be a string or an Error object.
 * @throws {Error} - Will throw an error if the input does not match the type `T`.
 */
export function assertType<T>(
  input: unknown,
  guard: TypeGuard<T>,
  message: string | Error = "Input does not match expected type"
): asserts input is T {
  if (!guard(input)) {
    throw typeof message === "string" ? new Error(message) : message;
  }
}
