import { describe, it, expect } from 'vitest'

import { compareArrays } from '../../core/utils'

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
