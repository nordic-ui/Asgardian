import {
  ArrayOperatorValue,
  ComparisonOperatorValue,
  DateOperatorValue,
  DateRangeOperatorValue,
  DaysOperatorValue,
  LogicalOperatorValue,
  RegexOperatorValue,
  RuleValue,
  StringOperatorValue,
} from './types'

type OperatorValue = unknown
type OperatorFunction<T = OperatorValue> = (...values: T[]) => OperatorValue[] & { __type: symbol }

const createOperator =
  <T>(type: string): OperatorFunction<T> =>
  (...values) => {
    // TODO: Find way to avoid the assertion here
    const opValues = values as ReturnType<OperatorFunction<T>>
    opValues.__type = Symbol.for(type)

    return opValues
  }

export const isOperator = (value: unknown, type: string): boolean =>
  Array.isArray(value) &&
  // TODO: Find way to avoid the assertion here
  (value as ReturnType<OperatorFunction<unknown>>).__type === Symbol.for(type)

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

// Logical operators
export const or = createOperator<OperatorValue>('or')
export const and = createOperator<OperatorValue>('and')
export const not = createOperator<OperatorValue>('not')
export const nand = createOperator<OperatorValue>('nand') // NOT AND
export const nor = createOperator<OperatorValue>('nor') // NOT OR
export const xor = createOperator<OperatorValue>('xor') // Exclusive OR
export const xnor = createOperator<OperatorValue>('xnor') // Exclusive NOR (equality)

// Comparison operators
export const gt = createOperator<number>('gt') // greater than
export const gte = createOperator<number>('gte') // greater than or equal
export const lt = createOperator<number>('lt') // less than
export const lte = createOperator<number>('lte') // less than or equal
export const between = createOperator<number>('between') // value falls between two numbers

// String operators
export const contains = createOperator<string>('contains')
export const startsWith = createOperator<string>('startsWith')
export const endsWith = createOperator<string>('endsWith')
export const matches = createOperator<RegExp>('matches') // regex pattern matching

// Array operators
export const includesAll = createOperator<OperatorValue>('includesAll')
export const includesAny = createOperator<OperatorValue>('includesAny')

// Date operators
export const before = createOperator<Date | string>('before')
export const after = createOperator<Date | string>('after')
export const within = createOperator<[Date | string, Date | string]>('within') // date range
export const pastDays = createOperator<number>('pastDays') // past X days
export const futureDays = createOperator<number>('futureDays') // future X days
