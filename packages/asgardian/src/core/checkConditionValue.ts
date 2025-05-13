import { Condition, DataObject } from '../types'
import { evaluateFieldOperators } from './evaluateFieldOperators'
import { getDeepValue } from './utils'

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
  data: Condition | DataObject,
): boolean => {
  // If no conditions are defined, it's considered a match (empty condition means no restrictions)
  if (!condition) return true

  // All sub-conditions must be true for $and
  if ('$and' in condition && Array.isArray(condition.$and)) {
    return condition.$and.every((subCondition) => checkConditionValue(subCondition, data))
  }

  // At least one sub-condition must be true for $or
  if ('$or' in condition && Array.isArray(condition.$or)) {
    return condition.$or.some((subCondition) => checkConditionValue(subCondition, data))
  }

  if ('$not' in condition && condition.$not !== undefined) {
    // The sub-condition must be false for $not
    // Ensure condition.$not is treated as a NewCondition
    return !checkConditionValue(condition.$not as Condition, data)
  }

  // If it's not a logical operator at the top level,
  // it must be a field condition or a direct value comparison.
  // This part handles evaluating individual field conditions.
  // For a field condition object, all its conditions must be true (implicit AND).
  return Object.keys(condition).every((field) => {
    const fieldCondition = condition[field]
    const fieldValue = getDeepValue(data, field)

    // If the field condition is a direct value (not an operator object)
    if (
      typeof fieldCondition !== 'object' ||
      fieldCondition === null ||
      Array.isArray(fieldCondition)
    ) {
      return fieldValue === fieldCondition
    }

    return evaluateFieldOperators(fieldValue, fieldCondition)
  })
}
