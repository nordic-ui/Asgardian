import { describe, it, expect } from 'vitest'

import { normalizeDate } from '../../core/utils'

describe('normalizeDate', () => {
  it('should return the same Date object if a Date is provided', () => {
    const date = new Date('2023-01-01')
    expect(normalizeDate(date)).toBe(date)
  })

  it('should convert a date string to a Date object', () => {
    const dateStr = '2023-01-01'
    const result = normalizeDate(dateStr)
    expect(result).toBeInstanceOf(Date)
    expect(result.toISOString().startsWith('2023-01-01')).toBe(true)
  })
})
