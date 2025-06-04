import { describe, expect, it, vi, afterAll } from 'vitest'

import { checkConditionValue } from '../../core/checkConditionValue'
import type { Condition } from '../../types'

describe('Basic Field Conditions', () => {
  const consoleMock = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

  afterAll(() => {
    consoleMock.mockReset()
  })

  it('should return true for a direct field equality match', () => {
    const condition: Condition = {
      status: 'published',
    }
    expect(checkConditionValue(condition, { status: 'published' })).toBeTruthy()
  })

  it('should return false for a direct field equality mismatch', () => {
    const condition: Condition = {
      status: 'draft',
    }

    expect(checkConditionValue(condition, { status: 'published' })).toBeFalsy()
  })

  it('should handle nested field equality mismatch with direct value', () => {
    const condition: Condition = {
      'author.id': 999,
    }

    expect(checkConditionValue(condition, { author: { id: 101 } })).toBeFalsy()
  })

  it('should handle boolean field equality', () => {
    const condition: Condition = {
      isFeatured: false,
    }

    expect(checkConditionValue(condition, { isFeatured: false })).toBeTruthy()
  })

  it('should handle null field equality', () => {
    const condition: Condition = {
      category: null,
    }

    expect(checkConditionValue(condition, { category: null })).toBeTruthy()
  })

  it('should return false for a null field with non-null condition', () => {
    const condition: Condition = {
      category: 'some_category',
    }

    expect(checkConditionValue(condition, { category: null })).toBeFalsy()
  })
})
