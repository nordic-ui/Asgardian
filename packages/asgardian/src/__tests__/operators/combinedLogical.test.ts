import { describe, expect, it, vi, afterAll } from 'vitest'

import { checkConditionValue } from '../../core/checkConditionValue'
import { Condition } from '../../types'

describe('Combined Logical and Field Conditions', () => {
  const consoleMock = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

  afterAll(() => {
    consoleMock.mockReset()
  })

  it('should handle a mix of logical and field conditions', () => {
    const condition: Condition = {
      $and: [
        { status: 'published' },
        {
          // This is an OR condition, wrapped in an implicit AND because it's an element in the `$and` array
          $or: [
            { views: { $gt: 200 } }, // mismatches (data.views is 150)
            { 'author.id': 101 }, // matches (data.author.id is 101)
          ],
        },
        { tags: { $in: ['tech'] } }, // matches (data.tags includes 'tech')
      ],
    }
    const condition2: Condition = {
      $and: [
        { status: 'draft' }, // mismatches (data.status is 'published')
        {
          // This is an OR condition, wrapped in an implicit AND because it's an element in the `$and` array
          $or: [
            { views: { $gt: 200 } }, // mismatches (data.views is 150)
            { 'author.id': 1 }, // mismatches (data.author.id is 101)
          ],
        },
        { tags: { $in: ['tech'] } }, // matches (data.tags includes 'tech')
      ],
    }

    expect(
      checkConditionValue(condition, {
        status: 'published',
        views: 150,
        author: { id: 101 },
        tags: ['tech', 'idea'],
      }),
    ).toBe(true)
    expect(
      checkConditionValue(condition2, {
        status: 'draft',
        views: 25,
        author: { id: 10 },
        tags: ['draft', 'idea'],
      }),
    ).toBe(false)
  })

  it('should return correct result with different data object', () => {
    const condition: Condition = {
      status: 'draft',
      'author.isActive': false,
      isFeatured: true,
    }

    expect(
      checkConditionValue(condition, {
        status: 'draft',
        author: { isActive: false },
        isFeatured: true,
      }),
    ).toBe(true)
  })
})
