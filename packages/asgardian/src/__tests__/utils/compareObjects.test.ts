import { describe, it, expect } from 'vitest'

import { compareObjects } from '../../core/utils'

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
