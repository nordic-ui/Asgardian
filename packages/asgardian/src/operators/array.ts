import type { OperatorValue } from '../types'
import { createOperator } from './utils'

export const includesAll = createOperator<OperatorValue>('includesAll')
export const includesAny = createOperator<OperatorValue>('includesAny')
