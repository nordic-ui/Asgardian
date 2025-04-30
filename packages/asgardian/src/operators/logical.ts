import type { OperatorValue } from '../types'
import { createOperator } from './utils'

export const or = createOperator<OperatorValue>('or')
export const and = createOperator<OperatorValue>('and')
export const not = createOperator<OperatorValue>('not')
export const nand = createOperator<OperatorValue>('nand') // NOT AND
export const nor = createOperator<OperatorValue>('nor') // NOT OR
export const xor = createOperator<OperatorValue>('xor') // Exclusive OR
export const xnor = createOperator<OperatorValue>('xnor') // Exclusive NOR (equality)
