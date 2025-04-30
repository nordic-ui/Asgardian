import { createOperator } from './utils'

export const contains = createOperator<string>('contains')
export const startsWith = createOperator<string>('startsWith')
export const endsWith = createOperator<string>('endsWith')
export const matches = createOperator<RegExp>('matches') // regex pattern matching
