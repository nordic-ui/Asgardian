import {
  NewCondition,
  ConditionValue,
  DataObject,
  // We might need some of the operator types later
  // for type checking or specific operator logic
  // TypedOperatorValue,
  // ComparisonOperatorValue,
  // StringOperatorValue,
  // etc.
} from '../types'

/**
 * Safely gets the value of a potentially nested property from an object.
 * Manually implemented deep property access without external libraries.
 *
 * @param obj The object to retrieve the value from.
 * @param path The path to the property (e.g., "user.profile.id").
 * @returns The value of the property, or undefined if the path is invalid or the property doesn't exist.
 */
function getDeepValue(obj: DataObject, path: string): ConditionValue {
  if (!obj) {
    return undefined
  }

  const keys = path.split('.')
  let current: any = obj // Use 'any' for intermediate checks due to potential nested structures

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    // Check for null or non-object before attempting property access
    if (current === null || typeof current !== 'object' || !(key in current)) {
      return undefined // Path is invalid or property doesn't exist at this level
    }
    current = current[key]
  }

  return current
}

/**
 * Evaluates a condition against a given data object.
 * This function recursively handles logical operators ($and, $or, $not)
 * and individual field conditions.
 *
 * @param condition The condition object to evaluate.
 * @param data The data object to check the condition against.
 * @returns True if the condition is met, false otherwise.
 */
export function checkConditionValue(
  condition: NewCondition | undefined,
  data: DataObject,
): boolean {
  if (!condition) {
    // If no conditions are defined, it's considered a match (empty condition means no restrictions)
    return true
  }

  // Check for logical operators at the top level
  if ('$and' in condition && Array.isArray(condition.$and)) {
    // All sub-conditions must be true for $and
    return condition.$and.every((subCondition) => checkConditionValue(subCondition, data))
  }

  if ('$or' in condition && Array.isArray(condition.$or)) {
    // At least one sub-condition must be true for $or
    return condition.$or.some((subCondition) => checkConditionValue(subCondition, data))
  }

  if ('$not' in condition && condition.$not !== undefined) {
    // The sub-condition must be false for $not
    // Ensure condition.$not is treated as a NewCondition
    return !checkConditionValue(condition.$not as NewCondition, data)
  }

  // If it's not a logical operator at the top level,
  // it must be a field condition or a direct value comparison.
  // This part handles evaluating individual field conditions.
  // For a field condition object, all its conditions must be true (implicit AND).
  return Object.keys(condition).every((field) => {
    const fieldCondition = condition[field]
    // Use our custom deep property access function
    const fieldValue = getDeepValue(data, field)

    // If the field condition is a direct value (not an operator object)
    if (
      typeof fieldCondition !== 'object' ||
      fieldCondition === null ||
      Array.isArray(fieldCondition)
    ) {
      // Direct equality check
      return fieldValue === fieldCondition
    }

    // If the field condition is an operator object (e.g., { $gt: 5, $lt: 10 })
    // Ensure fieldCondition is treated as a record for recursive evaluation
    return evaluateFieldOperators(fieldValue, fieldCondition as Record<string, ConditionValue>)
  })
}

/**
 * Evaluates the operators applied to a specific field value.
 *
 * @param fieldValue The value of the field from the data object.
 * @param operators The operators object for this field (e.g., { $gt: 5, $lt: 10 }).
 * @returns True if the field value satisfies all specified operators, false otherwise.
 */
function evaluateFieldOperators(
  fieldValue: ConditionValue,
  operators: Record<string, ConditionValue>,
): boolean {
  // All operators on a single field must be satisfied (implicit AND)
  return Object.keys(operators).every((operator) => {
    const operatorValue = operators[operator]

    switch (operator) {
      case '$eq':
        // Handle undefined and null equality explicitly
        return fieldValue === operatorValue
      case '$ne':
        // Handle undefined and null inequality explicitly
        return fieldValue !== operatorValue
      case '$in':
        if (!Array.isArray(operatorValue)) {
          console.warn('$in operator requires an array value.')
          return false // $in requires an array operand
        }
        // If fieldValue is an array, check for intersection
        if (Array.isArray(fieldValue)) {
          return fieldValue.some((item) => operatorValue.includes(item))
        }
        // Otherwise, check if scalar fieldValue is in the operator array
        return operatorValue.includes(fieldValue)

      case '$nin':
        if (!Array.isArray(operatorValue)) {
          console.warn('$nin operator requires an array value.')
          return false // $nin requires an array operand
        }
        // If fieldValue is an array, check for no intersection
        if (Array.isArray(fieldValue)) {
          return !fieldValue.some((item) => operatorValue.includes(item))
        }
        // Otherwise, check if scalar fieldValue is NOT in the operator array
        return !operatorValue.includes(fieldValue)
      case '$gt':
        // Ensure both values are numbers for comparison
        return (
          typeof fieldValue === 'number' &&
          typeof operatorValue === 'number' &&
          fieldValue > operatorValue
        )
      case '$gte':
        // Ensure both values are numbers for comparison
        return (
          typeof fieldValue === 'number' &&
          typeof operatorValue === 'number' &&
          fieldValue >= operatorValue
        )
      case '$lt':
        // Ensure both values are numbers for comparison
        return (
          typeof fieldValue === 'number' &&
          typeof operatorValue === 'number' &&
          fieldValue < operatorValue
        )
      case '$lte':
        // Ensure both values are numbers for comparison
        return (
          typeof fieldValue === 'number' &&
          typeof operatorValue === 'number' &&
          fieldValue <= operatorValue
        )
      case '$between':
        // Check if operatorValue is an array with exactly two comparable values
        if (Array.isArray(operatorValue) && operatorValue.length === 2) {
          const [start, end] = operatorValue
          // Basic numerical or date comparison. Extend for other types if needed.
          if (
            typeof fieldValue === 'number' &&
            typeof start === 'number' &&
            typeof end === 'number'
          ) {
            return fieldValue >= start && fieldValue <= end
          }
          // Add date comparison if necessary, using getTime() for reliability
          if (fieldValue instanceof Date && start instanceof Date && end instanceof Date) {
            const fieldTime = fieldValue.getTime()
            const startTime = start.getTime()
            const endTime = end.getTime()
            return fieldTime >= startTime && fieldTime <= endTime
          }
          // Consider adding string or other comparisons if needed
        }
        // Invalid $between condition format or types don't match
        return false
      case '$regex':
        // Check if operatorValue is a RegExp instance and fieldValue is a string
        return (
          operatorValue instanceof RegExp &&
          typeof fieldValue === 'string' &&
          operatorValue.test(fieldValue)
        )
      case '$contains':
        // Check if both are strings and fieldValue includes operatorValue
        return (
          typeof fieldValue === 'string' &&
          typeof operatorValue === 'string' &&
          fieldValue.includes(operatorValue)
        )
      case '$startsWith':
        // Check if both are strings and fieldValue starts with operatorValue
        return (
          typeof fieldValue === 'string' &&
          typeof operatorValue === 'string' &&
          fieldValue.startsWith(operatorValue)
        )
      case '$endsWith':
        // Check if both are strings and fieldValue ends with operatorValue
        return (
          typeof fieldValue === 'string' &&
          typeof operatorValue === 'string' &&
          fieldValue.endsWith(operatorValue)
        )
      // Add cases for other operators as needed
      default:
        // Unknown operator, log a warning and treat as not meeting the condition
        console.warn(`Unknown operator: ${operator}`)
        return false
    }
  })
}
