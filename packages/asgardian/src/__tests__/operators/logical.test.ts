import { describe, expect, it, vi, afterAll } from 'vitest'

import { checkConditionValue } from '../../core/checkConditionValue'
import { Condition } from '../../types'

describe('Logical Operator Conditions', () => {
  const consoleMock = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

  afterAll(() => {
    consoleMock.mockReset()
  })

  it('should handle $and operator where all sub-conditions match', () => {
    const condition: Condition = {
      $and: [{ status: 'published' }, { views: { $gt: 100 } }, { 'author.isActive': true }],
    }

    expect(
      checkConditionValue(condition, {
        status: 'published',
        views: 150,
        author: { isActive: true },
      }),
    ).toBe(true)
  })

  it('should handle $and operator where one sub-condition mismatches', () => {
    const condition: Condition = {
      $and: [{ status: 'published' }, { views: { $lt: 100 } }, { 'author.isActive': true }],
    }

    expect(
      checkConditionValue(condition, {
        status: 'published',
        views: 150,
        author: { isActive: true },
      }),
    ).toBe(false)
  })

  it('should handle nested $and operators', () => {
    const condition: Condition = {
      $and: [
        { status: 'published' },
        {
          $and: [{ views: { $gt: 100 } }, { 'author.username': { $eq: 'test_user' } }],
        },
      ],
    }

    expect(
      checkConditionValue(condition, {
        status: 'published',
        views: 150,
        author: { username: 'test_user' },
      }),
    ).toBe(true)
    expect(
      checkConditionValue(condition, {
        status: 'published',
        views: 150,
        author: { username: 'non_existing_user' },
      }),
    ).toBe(false)
  })

  it('should handle $or operator where one sub-condition matches', () => {
    const condition: Condition = {
      $or: [{ status: 'draft' }, { views: { $gt: 100 } }, { 'author.id': 999 }],
    }

    expect(
      checkConditionValue(condition, { status: 'published', views: 200, author: { id: 10 } }),
    ).toBe(true)
  })

  it('should handle $or operator where all sub-conditions mismatch', () => {
    const condition: Condition = {
      $or: [{ status: 'draft' }, { views: { $lt: 100 } }, { 'author.id': 999 }],
    }

    expect(
      checkConditionValue(condition, { status: 'published', views: 150, author: { id: 10 } }),
    ).toBe(false)
  })

  it('should handle nested $or operators', () => {
    const condition: Condition = {
      $or: [
        { status: 'draft' },
        {
          $or: [{ views: { $lt: 100 } }, { 'author.username': { $ne: 'non_existing_user' } }],
        },
      ],
    }

    expect(
      checkConditionValue(condition, {
        status: 'draft',
        views: 150,
        author: { username: 'user1' },
      }),
    ).toBe(true)
    expect(
      checkConditionValue(condition, {
        status: 'published',
        views: 150,
        author: { username: 'non_existing_user' },
      }),
    ).toBe(false)
  })

  it('should handle $not operator where the sub-condition matches', () => {
    const condition: Condition = {
      $not: { status: 'published' },
    }

    expect(checkConditionValue(condition, { status: 'published' })).toBe(false)
  })

  it('should handle $not operator where the sub-condition mismatches', () => {
    const condition: Condition = {
      $not: { status: 'draft' },
    }

    expect(checkConditionValue(condition, { status: 'published' })).toBe(true)
  })

  it('should handle $not operator with a field operator condition', () => {
    const condition: Condition = {
      $not: { views: { $gt: 200 } },
    }

    expect(checkConditionValue(condition, { views: 150 })).toBe(true)
    expect(checkConditionValue(condition, { views: 300 })).toBe(false)
  })
})
