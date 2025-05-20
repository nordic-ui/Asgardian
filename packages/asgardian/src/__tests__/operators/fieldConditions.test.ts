import { describe, expect, it, vi, afterAll } from 'vitest'

import { checkConditionValue } from '../../core/checkConditionValue'
import { Condition } from '../../types'

describe('Field Conditions', () => {
  const consoleMock = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

  afterAll(() => {
    consoleMock.mockReset()
  })

  it('should handle $eq operator', () => {
    const condition: Condition = {
      status: { $eq: 'published' },
    }

    expect(checkConditionValue(condition, { status: 'published' })).toBe(true)

    const mismatchCondition: Condition = {
      status: { $eq: 'draft' },
    }

    expect(checkConditionValue(mismatchCondition, { status: 'published' })).toBe(false)
  })

  it('should handle $ne operator', () => {
    const condition: Condition = {
      status: { $ne: 'draft' },
    }

    expect(checkConditionValue(condition, { status: 'published' })).toBe(true)

    const mismatchCondition: Condition = {
      status: { $ne: 'published' },
    }

    expect(checkConditionValue(mismatchCondition, { status: 'published' })).toBe(false)
  })

  it('should handle $in operator', () => {
    const condition: Condition = {
      status: { $in: ['published', 'archived'] },
    }

    expect(checkConditionValue(condition, { status: 'published' })).toBe(true)

    const mismatchCondition: Condition = {
      status: { $in: ['draft', 'pending'] },
    }

    expect(checkConditionValue(mismatchCondition, { status: 'published' })).toBe(false)
  })

  it('should handle $nin operator', () => {
    const condition: Condition = {
      status: { $nin: ['draft', 'pending'] },
    }

    expect(checkConditionValue(condition, { status: 'published' })).toBe(true)

    const mismatchCondition: Condition = {
      status: { $nin: ['published', 'archived'] },
    }

    expect(checkConditionValue(mismatchCondition, { status: 'published' })).toBe(false)
  })

  it('should handle $gt operator', () => {
    const condition: Condition = {
      views: { $gt: 100 },
    }

    expect(checkConditionValue(condition, { views: 150 })).toBe(true)

    const mismatchCondition: Condition = {
      views: { $gt: 200 },
    }

    expect(checkConditionValue(mismatchCondition, { views: 150 })).toBe(false)
  })

  it('should handle $gte operator', () => {
    const condition: Condition = {
      views: { $gte: 150 },
    }

    expect(checkConditionValue(condition, { views: 150 })).toBe(true)

    const condition2: Condition = {
      views: { $gte: 100 },
    }

    expect(checkConditionValue(condition2, { views: 150 })).toBe(true)

    const mismatchCondition: Condition = {
      views: { $gte: 200 },
    }

    expect(checkConditionValue(mismatchCondition, { views: 150 })).toBe(false)
  })

  it('should handle $lt operator', () => {
    const condition: Condition = {
      views: { $lt: 200 },
    }

    expect(checkConditionValue(condition, { views: 150 })).toBe(true)

    const mismatchCondition: Condition = {
      views: { $lt: 100 },
    }

    expect(checkConditionValue(mismatchCondition, { views: 150 })).toBe(false)
  })

  it('should handle $lte operator', () => {
    const condition: Condition = {
      views: { $lte: 150 },
    }

    expect(checkConditionValue(condition, { views: 150 })).toBe(true)

    const condition2: Condition = {
      views: { $lte: 200 },
    }

    expect(checkConditionValue(condition2, { views: 150 })).toBe(true)

    const mismatchCondition: Condition = {
      views: { $lte: 100 },
    }

    expect(checkConditionValue(mismatchCondition, { views: 150 })).toBe(false)
  })

  it('should handle $between operator for numbers', () => {
    const condition: Condition = {
      views: { $between: [100, 200] },
    }

    expect(checkConditionValue(condition, { views: 150 })).toBe(true)

    const mismatchCondition: Condition = {
      views: { $between: [0, 100] },
    }

    expect(checkConditionValue(mismatchCondition, { views: 150 })).toBe(false)
  })

  it('should handle $between operator for dates', () => {
    const condition: Condition = {
      createdAt: { $between: [new Date('2022-12-31'), new Date('2023-01-02')] },
    }

    expect(checkConditionValue(condition, { createdAt: new Date('2023-01-01') })).toBe(true)

    const mismatchCondition: Condition = {
      createdAt: { $between: [new Date('2023-02-01'), new Date('2023-03-01')] },
    }

    expect(checkConditionValue(mismatchCondition, { createdAt: new Date('2023-01-01') })).toBe(
      false,
    )
  })

  it('should handle $regex operator', () => {
    const condition: Condition = {
      name: { $regex: /^Test/ },
    }

    expect(checkConditionValue(condition, { name: 'Test Post' })).toBe(true)

    const mismatchCondition: Condition = {
      name: { $regex: /Article$/ },
    }

    expect(checkConditionValue(mismatchCondition, { name: 'Test Post' })).toBe(false)
  })

  it('should handle $contains operator', () => {
    const condition: Condition = {
      name: { $contains: 'Post' },
    }

    expect(checkConditionValue(condition, { name: 'Test Post' })).toBe(true)

    const mismatchCondition: Condition = {
      name: { $contains: 'Article' },
    }

    expect(checkConditionValue(mismatchCondition, { name: 'Test Post' })).toBe(false)
  })

  it('should handle $startsWith operator', () => {
    const condition: Condition = {
      name: { $startsWith: 'Test' },
    }

    expect(checkConditionValue(condition, { name: 'Test Post' })).toBe(true)

    const mismatchCondition: Condition = {
      name: { $startsWith: 'Draft' },
    }

    expect(checkConditionValue(mismatchCondition, { name: 'Test Post' })).toBe(false)
  })

  it('should handle $endsWith operator', () => {
    const condition: Condition = {
      name: { $endsWith: 'Post' },
    }

    expect(checkConditionValue(condition, { name: 'Test Post' })).toBe(true)

    const mismatchCondition: Condition = {
      name: { $endsWith: 'Article' },
    }

    expect(checkConditionValue(mismatchCondition, { name: 'Test Post' })).toBe(false)
  })
})
