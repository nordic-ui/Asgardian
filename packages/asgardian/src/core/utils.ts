import { ConditionValue, DataObject, NewCondition } from '../types'

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
 * Safely gets the value of a potentially nested property from an object.
 *
 * @param obj The object to retrieve the value from.
 * @param path The path to the property (e.g., "user.profile.id").
 * @returns The value of the property, or `undefined` if the path is invalid or the property doesn't exist.
 */
export const getDeepValue = (obj: NewCondition | DataObject, path: string): ConditionValue => {
  if (!obj) {
    return undefined
  }

  const keys = path.split('.')
  let current = obj

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    // Check for null or non-object before attempting property access
    if (!key || current === null || typeof current !== 'object' || !(key in current)) {
      return undefined // Path is invalid or property doesn't exist at this level
    }
    current = current[key]
  }

  return current
}
