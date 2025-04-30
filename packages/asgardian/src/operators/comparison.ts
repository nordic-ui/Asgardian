import { createOperator } from './utils'

export const gt = createOperator<number>('gt') // greater than
export const gte = createOperator<number>('gte') // greater than or equal
export const lt = createOperator<number>('lt') // less than
export const lte = createOperator<number>('lte') // less than or equal
export const between = createOperator<number>('between') // value falls between two numbers
