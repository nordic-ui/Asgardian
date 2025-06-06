import type { ConditionValue } from '../types'
import { isArray, isRecord } from './guards'

/**
 * Normalizes a date input to a `Date` object. If the input is a string, it will be parsed into a `Date`.
 *
 * @param date The date to normalize, can be a `Date` object or a `string`.
 * @returns A `Date` object.
 */
export const normalizeDate = (date: Date | string): Date => {
  return typeof date === 'string' ? new Date(date) : date
}

/**
 * Type guard to check if an object has a specific key.
 *
 * @param obj The object to check.
 * @param key The key to look for.
 * @returns `true` if the key exists on the object.
 */
function hasKey(obj: unknown, key: string): obj is Record<string, unknown> {
  return obj !== null && typeof obj === 'object' && key in obj
}

/**
 * Safely gets the value of a potentially nested property from an object.
 *
 * @param obj The object to retrieve the value from.
 * @param path The path to the property (e.g., `"user.profile.id"`).
 * @returns The value of the property, or `undefined` if the path is invalid or the property doesn't exist.
 */
export const getDeepValue = (obj: unknown, path: string): ConditionValue => {
  if (!obj || typeof obj !== 'object') return undefined

  const keys = path.split('.')
  let current: unknown = obj

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]!

    if (!hasKey(current, key)) {
      return undefined
    }

    current = current[key]
  }

  return current
}

/**
 * Deeply compares two arrays to determine if they're identical.
 * Handles nested arrays and objects.
 *
 * @param a The first array to compare.
 * @param b The second array to compare.
 * @returns `true` if the arrays are equal, `false` otherwise.
 */
export const compareArrays = (a: unknown[], b: unknown[]): boolean => {
  if (!isArray(a) || !isArray(b) || a.length !== b.length) return false

  return a.every((item, index) => {
    const otherItem = b[index]

    if (isArray(item) && isArray(otherItem)) return compareArrays(item, otherItem)
    else if (isRecord(item) && isRecord(otherItem)) return compareObjects(item, otherItem)

    return item === otherItem
  })
}

/**
 * Deeply compares two objects (records) to determine if they're identical.
 * Handles nested objects and arrays.
 *
 * @param a The first object to compare.
 * @param b The second object to compare.
 * @returns `true` if the objects are equal, `false` otherwise.
 */
export const compareObjects = (a: Record<string, unknown>, b: Record<string, unknown>): boolean => {
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)

  if (aKeys.length !== bKeys.length) return false

  return aKeys.every((key) => {
    const item = a[key]
    const otherItem = b[key]

    if (isArray(item) && isArray(otherItem)) return compareArrays(item, otherItem)
    else if (isRecord(item) && isRecord(otherItem)) return compareObjects(item, otherItem)

    return item === otherItem
  })
}
