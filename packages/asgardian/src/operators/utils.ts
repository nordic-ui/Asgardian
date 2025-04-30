import type { OperatorFunction, TypedOperatorValue } from '../types'

export const createOperator =
  <T>(type: string): OperatorFunction<T> =>
  (...values) => {
    // TODO: Find way to avoid the assertion here
    const opValues = values as TypedOperatorValue<T>
    opValues.__type = Symbol.for(type)

    return opValues
  }
