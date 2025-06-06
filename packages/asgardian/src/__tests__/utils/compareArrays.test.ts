import { describe, it, expect } from 'vitest'

import { compareArrays } from '../../core/utils'

describe('compareArrays', () => {
  it('should return true for identical simple arrays', () => {
    expect(compareArrays([1, 2, 3], [1, 2, 3])).toBeTruthy()
    expect(compareArrays(['a', 'b', 'c'], ['a', 'b', 'c'])).toBeTruthy()
  })

  it('should return false for different arrays', () => {
    expect(compareArrays([1, 2, 3], [1, 2, 4])).toBeFalsy()
    expect(compareArrays([1, 2, 3], [1, 2])).toBeFalsy()
    expect(compareArrays([1, 2], [1, 2, 3])).toBeFalsy()
  })

  it('should compare nested arrays correctly', () => {
    expect(compareArrays([1, [2, 3]], [1, [2, 3]])).toBeTruthy()
    expect(compareArrays([1, [2, 3]], [1, [2, 4]])).toBeFalsy()
  })

  it('should compare arrays with objects correctly', () => {
    expect(compareArrays([{ a: 1 }, { b: 2 }], [{ a: 1 }, { b: 2 }])).toBeTruthy()
    expect(compareArrays([{ a: 1 }, { b: 2 }], [{ a: 1 }, { b: 3 }])).toBeFalsy()
  })

  it('should handle complex nested structures', () => {
    const a = [1, { b: [2, { c: 3 }] }]
    const b = [1, { b: [2, { c: 3 }] }]
    const c = [1, { b: [2, { c: 4 }] }]
    expect(compareArrays(a, b)).toBeTruthy()
    expect(compareArrays(a, c)).toBeFalsy()
  })
})
