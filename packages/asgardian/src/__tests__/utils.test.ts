import { describe, it, expect } from 'vitest'

import { normalizeDate, getDeepValue, compareArrays, compareObjects, isRecord } from '../core/utils'

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

describe('getDeepValue', () => {
  it('should return undefined for null or non-object inputs', () => {
    expect(getDeepValue(null, 'any.path')).toBeUndefined()
    expect(getDeepValue(undefined, 'any.path')).toBeUndefined()
    expect(getDeepValue('string', 'any.path')).toBeUndefined()
    expect(getDeepValue(123, 'any.path')).toBeUndefined()
  })

  it('should return the value at a simple path', () => {
    const obj = { name: 'John', age: 30 }
    expect(getDeepValue(obj, 'name')).toBe('John')
    expect(getDeepValue(obj, 'age')).toBe(30)
  })

  it('should return the value at a nested path', () => {
    const obj = {
      user: {
        profile: {
          id: 123,
          details: {
            verified: true,
          },
        },
      },
    }
    expect(getDeepValue(obj, 'user.profile.id')).toBe(123)
    expect(getDeepValue(obj, 'user.profile.details.verified')).toBe(true)
  })

  it('should return undefined for invalid paths', () => {
    const obj = { user: { name: 'John' } }
    expect(getDeepValue(obj, 'user.profile')).toBeUndefined()
    expect(getDeepValue(obj, 'user.profile.id')).toBeUndefined()
  })
})

describe('compareArrays', () => {
  it('should return true for identical simple arrays', () => {
    expect(compareArrays([1, 2, 3], [1, 2, 3])).toBe(true)
    expect(compareArrays(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(true)
  })

  it('should return false for different arrays', () => {
    expect(compareArrays([1, 2, 3], [1, 2, 4])).toBe(false)
    expect(compareArrays([1, 2, 3], [1, 2])).toBe(false)
    expect(compareArrays([1, 2], [1, 2, 3])).toBe(false)
  })

  it('should compare nested arrays correctly', () => {
    expect(compareArrays([1, [2, 3]], [1, [2, 3]])).toBe(true)
    expect(compareArrays([1, [2, 3]], [1, [2, 4]])).toBe(false)
  })

  it('should compare arrays with objects correctly', () => {
    expect(compareArrays([{ a: 1 }, { b: 2 }], [{ a: 1 }, { b: 2 }])).toBe(true)
    expect(compareArrays([{ a: 1 }, { b: 2 }], [{ a: 1 }, { b: 3 }])).toBe(false)
  })

  it('should handle complex nested structures', () => {
    const a = [1, { b: [2, { c: 3 }] }]
    const b = [1, { b: [2, { c: 3 }] }]
    const c = [1, { b: [2, { c: 4 }] }]
    expect(compareArrays(a, b)).toBe(true)
    expect(compareArrays(a, c)).toBe(false)
  })
})

describe('compareObjects', () => {
  it('should return true for identical simple objects', () => {
    expect(compareObjects({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true)
    expect(compareObjects({ a: 'test', b: true }, { a: 'test', b: true })).toBe(true)
  })

  it('should return false for different objects', () => {
    expect(compareObjects({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false)
    expect(compareObjects({ a: 1, b: 2 }, { a: 1 })).toBe(false)
    expect(compareObjects({ a: 1 }, { a: 1, b: 2 })).toBe(false)
  })

  it('should compare nested objects correctly', () => {
    expect(compareObjects({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })).toBe(true)
    expect(compareObjects({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 3 } })).toBe(false)
  })

  it('should compare objects with arrays correctly', () => {
    expect(compareObjects({ a: 1, b: [1, 2] }, { a: 1, b: [1, 2] })).toBe(true)
    expect(compareObjects({ a: 1, b: [1, 2] }, { a: 1, b: [1, 3] })).toBe(false)
  })

  it('should handle complex nested structures', () => {
    const a = { a: 1, b: { c: [1, { d: 2 }] } }
    const b = { a: 1, b: { c: [1, { d: 2 }] } }
    const c = { a: 1, b: { c: [1, { d: 3 }] } }
    expect(compareObjects(a, b)).toBe(true)
    expect(compareObjects(a, c)).toBe(false)
  })
})

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
