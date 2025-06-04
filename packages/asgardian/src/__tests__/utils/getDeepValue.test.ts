import { describe, it, expect } from 'vitest'

import { getDeepValue } from '../../core/utils'

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
    expect(getDeepValue(obj, 'user.profile.details.verified')).toBeTruthy()
  })

  it('should return undefined for invalid paths', () => {
    const obj = { user: { name: 'John' } }
    expect(getDeepValue(obj, 'user.profile')).toBeUndefined()
    expect(getDeepValue(obj, 'user.profile.id')).toBeUndefined()
  })
})
