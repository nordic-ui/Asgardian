import type {
  ArrayOperatorValue,
  ComparisonOperatorValue,
  DateOperatorValue,
  DateRangeOperatorValue,
  DaysOperatorValue,
  LogicalOperatorValue,
  OperatorValue,
  RegexOperatorValue,
  RuleValue,
  StringOperatorValue,
  TypedOperatorValue,
} from '../types'

export const isOperator = (value: OperatorValue, type: string): boolean =>
  // TODO: Find way to avoid the assertion here
  Array.isArray(value) && (value as TypedOperatorValue<OperatorValue>).__type === Symbol.for(type)

// Type guards
export function isLogicalOperator(value: RuleValue): value is LogicalOperatorValue {
  return (
    Array.isArray(value) &&
    ['or', 'and', 'not', 'nand', 'nor', 'xor', 'xnor'].some((type) => isOperator(value, type))
  )
}

export function isComparisonOperator(value: RuleValue): value is ComparisonOperatorValue {
  return (
    Array.isArray(value) &&
    ['gt', 'gte', 'lt', 'lte', 'between'].some((type) => isOperator(value, type))
  )
}

export function isStringOperator(value: RuleValue): value is StringOperatorValue {
  return (
    Array.isArray(value) &&
    ['contains', 'startsWith', 'endsWith'].some((type) => isOperator(value, type))
  )
}

export function isRegexOperator(value: RuleValue): value is RegexOperatorValue {
  return Array.isArray(value) && isOperator(value, 'matches')
}

export function isArrayOperator(value: RuleValue): value is ArrayOperatorValue {
  return (
    Array.isArray(value) && ['includesAll', 'includesAny'].some((type) => isOperator(value, type))
  )
}

export function isDateOperator(value: RuleValue): value is DateOperatorValue {
  return Array.isArray(value) && ['before', 'after'].some((type) => isOperator(value, type))
}

export function isDaysOperator(value: RuleValue): value is DaysOperatorValue {
  return Array.isArray(value) && ['pastDays', 'futureDays'].some((type) => isOperator(value, type))
}

export function isDateRangeOperator(value: RuleValue): value is DateRangeOperatorValue {
  return Array.isArray(value) && isOperator(value, 'within')
}

export function isDateLike(value: unknown): value is Date | string {
  return value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))
}
