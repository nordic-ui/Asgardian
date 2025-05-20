import { Condition } from '../types'
import { evaluateFieldOperators } from './evaluateFieldOperators'
import { compareArrays, compareObjects, getDeepValue } from './utils'
import { isArray, isRecord } from './guards'

/**
 * Evaluates a condition against a given data object.
 * This function recursively handles logical operators (`$and`, `$or`, `$not`)
 * and individual field conditions.
 *
 * @param condition The condition object to evaluate.
 * @param data The data object to check the condition against.
 * @returns a `boolean` value based on whether the condition is met or not.
 */
export const checkConditionValue = (
  condition: Condition | undefined,
  data: Condition | undefined,
): boolean => {
  // If no conditions are defined, it's considered a match (empty condition means no restrictions)
  if (!condition) return true

  // All sub-conditions must be true for `$and`
  if ('$and' in condition && isArray(condition.$and)) {
    return condition.$and.every((subCondition) => checkConditionValue(subCondition, data))
  }

  // At least one sub-condition must be true for `$or`
  if ('$or' in condition && isArray(condition.$or)) {
    return condition.$or.some((subCondition) => checkConditionValue(subCondition, data))
  }

  // The sub-condition must be false for `$not`
  if ('$not' in condition && condition.$not !== undefined) {
    return !checkConditionValue(condition.$not, data)
  }

  // If it's not a logical operator at the top level,
  // it must be a field condition or a direct value comparison.
  // This part handles evaluating individual field conditions.
  // For a field condition object, all its conditions must be true (implicit AND).
  return Object.entries(condition).every(([field, fieldCondition]) => {
    if (['$and', '$or', '$not'].includes(field)) return true

    const fieldValue = getDeepValue(data, field)

    // If both fieldValue and fieldCondition are arrays, check for equality
    if (isArray(fieldValue) && isArray(fieldCondition)) {
      return compareArrays(fieldValue, fieldCondition)
    }

    if (isRecord(fieldValue) && isRecord(fieldCondition)) {
      return compareObjects(fieldValue, fieldCondition)
    }

    if (fieldCondition === null || !isRecord(fieldCondition) || isArray(fieldCondition)) {
      return fieldValue === fieldCondition
    }

    return evaluateFieldOperators(fieldValue, fieldCondition)
  })
}
