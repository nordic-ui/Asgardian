import {
  isArrayOperator,
  isComparisonOperator,
  isDateOperator,
  isDateRangeOperator,
  isDaysOperator,
  isLogicalOperator,
  isOperator,
  isRegexOperator,
  isStringOperator,
} from './operators'
import { ConditionValue, RuleValue } from './types'

const normalizeDate = (date: Date | string): Date => {
  return typeof date === 'string' ? new Date(date) : date
}

function isDateLike(value: unknown): value is Date | string {
  return value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))
}

export const checkConditionValue = (
  ruleValue: RuleValue,
  conditionValue: ConditionValue,
): boolean => {
  // Logical operators
  if (isLogicalOperator(ruleValue) && isOperator(ruleValue, 'or')) {
    if (Array.isArray(conditionValue)) return ruleValue.some((v) => conditionValue.includes(v))
    return ruleValue.includes(conditionValue)
  }

  if (isLogicalOperator(ruleValue) && isOperator(ruleValue, 'and')) {
    return Array.isArray(conditionValue) && ruleValue.every((v) => conditionValue.includes(v))
  }

  if (isLogicalOperator(ruleValue) && isOperator(ruleValue, 'not')) {
    return !ruleValue.includes(conditionValue)
  }

  // Advanced logical operators
  if (isLogicalOperator(ruleValue) && isOperator(ruleValue, 'nand')) {
    // NAND: NOT (A AND B) - returns true if NOT all values are present
    return Array.isArray(conditionValue) && !ruleValue.every((v) => conditionValue.includes(v))
  }

  if (isLogicalOperator(ruleValue) && isOperator(ruleValue, 'nor')) {
    // NOR: NOT (A OR B) - returns true if NONE of the values are present
    return Array.isArray(conditionValue) && !ruleValue.some((v) => conditionValue.includes(v))
  }

  if (isLogicalOperator(ruleValue) && isOperator(ruleValue, 'xor')) {
    // XOR: returns true if EXACTLY ONE of the values is present
    return (
      Array.isArray(conditionValue) &&
      ruleValue.filter((v) => conditionValue.includes(v)).length === 1
    )
  }

  if (isLogicalOperator(ruleValue) && isOperator(ruleValue, 'xnor')) {
    // XNOR: returns true if ALL or NONE of the values are present
    const matchCount = ruleValue.filter(
      (v) => Array.isArray(conditionValue) && conditionValue.includes(v),
    ).length
    return matchCount === 0 || matchCount === ruleValue.length
  }

  // Comparison operators
  if (isComparisonOperator(ruleValue) && isOperator(ruleValue, 'gt')) {
    if (!ruleValue[0]) return false
    return typeof conditionValue === 'number' && conditionValue > ruleValue[0]
  }

  if (isComparisonOperator(ruleValue) && isOperator(ruleValue, 'gte')) {
    if (!ruleValue[0]) return false
    return typeof conditionValue === 'number' && conditionValue >= ruleValue[0]
  }

  if (isComparisonOperator(ruleValue) && isOperator(ruleValue, 'lt')) {
    if (!ruleValue[0]) return false
    return typeof conditionValue === 'number' && conditionValue < ruleValue[0]
  }

  if (isComparisonOperator(ruleValue) && isOperator(ruleValue, 'lte')) {
    if (!ruleValue[0]) return false
    return typeof conditionValue === 'number' && conditionValue <= ruleValue[0]
  }

  if (isComparisonOperator(ruleValue) && isOperator(ruleValue, 'between')) {
    if (!ruleValue[0] || !ruleValue[1]) return false
    return (
      typeof conditionValue === 'number' &&
      conditionValue >= ruleValue[0] &&
      conditionValue <= ruleValue[1]
    )
  }

  // String operators
  if (isStringOperator(ruleValue) && isOperator(ruleValue, 'contains')) {
    return typeof conditionValue === 'string' && ruleValue.some((v) => conditionValue.includes(v))
  }
  if (isStringOperator(ruleValue) && isOperator(ruleValue, 'startsWith')) {
    return typeof conditionValue === 'string' && ruleValue.some((v) => conditionValue.startsWith(v))
  }
  if (isStringOperator(ruleValue) && isOperator(ruleValue, 'endsWith')) {
    return typeof conditionValue === 'string' && ruleValue.some((v) => conditionValue.endsWith(v))
  }
  if (isRegexOperator(ruleValue) && isOperator(ruleValue, 'matches')) {
    if (!ruleValue[0]) return false
    return typeof conditionValue === 'string' && ruleValue[0].test(conditionValue)
  }

  // Array operators
  if (isArrayOperator(ruleValue) && isOperator(ruleValue, 'includesAll')) {
    if (!ruleValue[0]) return false
    return Array.isArray(conditionValue) && ruleValue[0]?.every((v) => conditionValue.includes(v))
  }
  if (isArrayOperator(ruleValue) && isOperator(ruleValue, 'includesAny')) {
    if (!ruleValue[0]) return false
    return Array.isArray(conditionValue) && ruleValue[0]?.some((v) => conditionValue.includes(v))
  }

  // Date operators
  if (isDateOperator(ruleValue) && isOperator(ruleValue, 'before')) {
    if (!conditionValue || !isDateLike(conditionValue) || !ruleValue[0]) return false

    const compareDate = normalizeDate(ruleValue[0])
    const checkDate = normalizeDate(conditionValue)

    return checkDate < compareDate
  }

  if (isDateOperator(ruleValue) && isOperator(ruleValue, 'after')) {
    if (!conditionValue || !isDateLike(conditionValue) || !ruleValue[0]) return false

    const compareDate = normalizeDate(ruleValue[0])
    const checkDate = normalizeDate(conditionValue)

    return checkDate > compareDate
  }

  if (isDateRangeOperator(ruleValue) && isOperator(ruleValue, 'within')) {
    if (!conditionValue || !isDateLike(conditionValue) || !ruleValue[0]) return false

    const [startDate, endDate] = ruleValue[0]
    if (!startDate || !endDate) return false

    const start = normalizeDate(startDate)
    const end = normalizeDate(endDate)
    const checkDate = normalizeDate(conditionValue)

    return checkDate >= start && checkDate <= end
  }

  if (isDaysOperator(ruleValue) && isOperator(ruleValue, 'pastDays')) {
    if (!conditionValue || !isDateLike(conditionValue) || !ruleValue[0]) return false

    const checkDate = normalizeDate(conditionValue as Date | string)
    const now = new Date()
    // Floor both dates to seconds to avoid millisecond precision issues
    const compareDate = new Date(
      Math.floor(now.getTime() / 1000) * 1000 - ruleValue[0] * 24 * 60 * 60 * 1000,
    )
    const checkDateFloored = new Date(Math.floor(checkDate.getTime() / 1000) * 1000)

    return checkDateFloored >= compareDate && checkDate <= now
  }

  if (isDaysOperator(ruleValue) && isOperator(ruleValue, 'futureDays')) {
    if (!conditionValue || !isDateLike(conditionValue) || !ruleValue[0]) return false

    const checkDate = normalizeDate(conditionValue)
    const compareDate = new Date()
    compareDate.setDate(compareDate.getDate() + ruleValue[0])

    return checkDate <= compareDate
  }

  return ruleValue === conditionValue
}
