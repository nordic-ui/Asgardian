import { describe, it, expect } from 'vitest'

import { isRecord } from '../../core/utils'

describe('isRecord', () => {
  it('should return true for objects', () => {
    expect(isRecord({})).toBe(true)
    expect(isRecord({ a: 1 })).toBe(true)
  })

  it('should return false for non-objects', () => {
    expect(isRecord(null)).toBe(false)
    expect(isRecord(undefined)).toBe(false)
    expect(isRecord('string')).toBe(false)
    expect(isRecord(123)).toBe(false)
    expect(isRecord(true)).toBe(false)
  })

  it('should return false for arrays', () => {
    expect(isRecord([])).toBe(false)
    expect(isRecord([1, 2, 3])).toBe(false)
  })

  it('should return false for Date objects', () => {
    expect(isRecord(new Date())).toBe(false)
  })
})
