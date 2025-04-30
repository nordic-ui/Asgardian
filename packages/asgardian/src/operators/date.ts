import { createOperator } from './utils'

export const before = createOperator<Date | string>('before')
export const after = createOperator<Date | string>('after')
export const within = createOperator<[Date | string, Date | string]>('within') // date range
export const pastDays = createOperator<number>('pastDays') // past X days
export const futureDays = createOperator<number>('futureDays') // future X days
