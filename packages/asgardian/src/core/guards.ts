/**
 * Type guard that checks whether a given value is a non-null object (record).
 */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null &&
  typeof value !== 'undefined' &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  !(value instanceof Date)

/**
 * Type guard that checks whether a given value is a non-null array.
 */
export const isArray = (value: unknown): value is unknown[] =>
  value !== null &&
  typeof value !== 'undefined' &&
  typeof value === 'object' &&
  Array.isArray(value)
