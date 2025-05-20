import { describe, expect, it, vi, afterAll } from 'vitest'

import { checkConditionValue } from '../../core/checkConditionValue'
import { Condition } from '../../types'

describe('Combined Field Conditions', () => {
  const consoleMock = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

  afterAll(() => {
    consoleMock.mockReset()
  })

  it('should return true for multiple field conditions when all match', () => {
    const condition: Condition = {
      status: 'published',
      views: { $gt: 100 },
    }

    expect(checkConditionValue(condition, { status: 'published', views: 150 })).toBe(true)
  })

  it('should return false for multiple field conditions when one mismatches', () => {
    const condition: Condition = {
      status: 'published',
      views: { $lt: 100 },
    }

    expect(checkConditionValue(condition, { status: 'published', views: 150 })).toBe(false)
    expect(checkConditionValue(condition, { status: 'draft', views: 50 })).toBe(false)
  })

  it('should handle combined operators on a single field', () => {
    const condition: Condition = {
      views: { $gt: 100, $lt: 200 },
    }

    expect(checkConditionValue(condition, { views: 150 })).toBe(true)

    const mismatchCondition: Condition = {
      views: { $gt: 100, $lt: 150 },
    }

    expect(checkConditionValue(mismatchCondition, { views: 150 })).toBe(false)
  })
})
