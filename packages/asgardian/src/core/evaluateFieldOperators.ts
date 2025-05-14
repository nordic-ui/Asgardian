import { ConditionValue, Operators } from '../types'
import { isRecord } from './utils'

/**
 * Evaluates the operators applied to a specific field value.
 *
 * @param fieldValue The value of the field from the data object.
 * @param operators The operators object for this field (e.g., { $gt: 5, $lt: 10 }).
 * @returns True if the field value satisfies all specified operators, false otherwise.
 */
export const evaluateFieldOperators = (
  fieldValue: ConditionValue,
  operators: Operators & Record<string, ConditionValue>,
): boolean => {
  // All operators on a single field must be satisfied (implicit AND)
  return Object.keys(operators).every((operator) => {
    const operatorValue = operators[operator]

    switch (operator) {
      case '$eq': {
        // Handle undefined and null equality explicitly
        return fieldValue === operatorValue
      }

      case '$ne': {
        // Handle undefined and null inequality explicitly
        return fieldValue !== operatorValue
      }

      case '$in': {
        if (!Array.isArray(operatorValue)) {
          console.warn('$in operator requires an array value.')
          return false
        }
        // If fieldValue is an array, check for intersection
        if (Array.isArray(fieldValue)) {
          return fieldValue.some((item) => operatorValue.includes(item))
        }

        return operatorValue.includes(fieldValue)
      }

      case '$nin': {
        if (!Array.isArray(operatorValue)) {
          console.warn('$nin operator requires an array value.')
          return false
        }
        // If fieldValue is an array, check for no intersection
        if (Array.isArray(fieldValue)) {
          return !fieldValue.some((item) => operatorValue.includes(item))
        }

        return !operatorValue.includes(fieldValue)
      }

      case '$gt': {
        return (
          typeof fieldValue === 'number' &&
          typeof operatorValue === 'number' &&
          fieldValue > operatorValue
        )
      }

      case '$gte': {
        return (
          typeof fieldValue === 'number' &&
          typeof operatorValue === 'number' &&
          fieldValue >= operatorValue
        )
      }

      case '$lt': {
        return (
          typeof fieldValue === 'number' &&
          typeof operatorValue === 'number' &&
          fieldValue < operatorValue
        )
      }

      case '$lte': {
        return (
          typeof fieldValue === 'number' &&
          typeof operatorValue === 'number' &&
          fieldValue <= operatorValue
        )
      }

      case '$between': {
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
        }

        return false
      }

      case '$regex': {
        return (
          operatorValue instanceof RegExp &&
          typeof fieldValue === 'string' &&
          operatorValue.test(fieldValue)
        )
      }

      case '$contains': {
        return (
          typeof fieldValue === 'string' &&
          typeof operatorValue === 'string' &&
          fieldValue.includes(operatorValue)
        )
      }

      case '$startsWith': {
        return (
          typeof fieldValue === 'string' &&
          typeof operatorValue === 'string' &&
          fieldValue.startsWith(operatorValue)
        )
      }

      case '$endsWith': {
        return (
          typeof fieldValue === 'string' &&
          typeof operatorValue === 'string' &&
          fieldValue.endsWith(operatorValue)
        )
      }

      default: {
        if (operator.startsWith('$')) {
          console.warn(`Unknown operator: ${operator}`)
          return false
        }

        // This is a nested field access, not an operator
        if (fieldValue && typeof fieldValue === 'object' && !Array.isArray(fieldValue)) {
          const typedFieldValue = isRecord(fieldValue) ? fieldValue : {}
          return typedFieldValue[operator] === operatorValue
        }

        return false
      }
    }
  })
}
