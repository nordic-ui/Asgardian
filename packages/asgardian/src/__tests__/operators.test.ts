import { describe, expect, it } from 'vitest'

import { checkConditionValue } from '../core/checkConditionValue'
import { Condition } from '../types'

describe('checkConditionValue', () => {
  describe('Basic Field Conditions', () => {
    it('should return true for a direct field equality match', () => {
      const condition: Condition = {
        status: 'published',
      }
      expect(checkConditionValue(condition, { status: 'published' })).toBe(true)
    })

    it('should return false for a direct field equality mismatch', () => {
      const condition: Condition = {
        status: 'draft',
      }

      expect(checkConditionValue(condition, { status: 'published' })).toBe(false)
    })

    it('should handle nested field equality with direct value', () => {
      const condition: Condition = {
        'author.id': 101,
      }

      expect(checkConditionValue(condition, { author: { id: 101 } })).toBe(true)
    })

    it('should handle nested field equality mismatch with direct value', () => {
      const condition: Condition = {
        'author.id': 999,
      }

      expect(checkConditionValue(condition, { author: { id: 101 } })).toBe(false)
    })

    it('should handle boolean field equality', () => {
      const condition: Condition = {
        isFeatured: false,
      }

      expect(checkConditionValue(condition, { isFeatured: false })).toBe(true)
    })

    it('should handle null field equality', () => {
      const condition: Condition = {
        category: null,
      }

      expect(checkConditionValue(condition, { category: null })).toBe(true)
    })

    it('should return false for a null field with non-null condition', () => {
      const condition: Condition = {
        category: 'some_category',
      }

      expect(checkConditionValue(condition, { category: null })).toBe(false)
    })
  })

  describe('Operator Conditions', () => {
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

  describe('Combined Field Conditions', () => {
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

  describe('Logical Operator Conditions', () => {
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

  describe('Combined Logical and Field Conditions', () => {
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

  describe('Edge Cases', () => {
    it('should return true for undefined condition', () => {
      expect(checkConditionValue(undefined, {})).toBe(true)
    })

    it('should return true for an empty condition object', () => {
      const condition: Condition = {} // Technically an empty AND equivalent

      expect(checkConditionValue(condition, {})).toBe(true)
    })

    it('should return false for a condition with unknown operator and data does not match', () => {
      const condition: Condition = {
        // @ts-expect-error - This is to simulate an unknown operator
        views: { $unknownOperator: 100 },
      }

      expect(checkConditionValue(condition, { views: 150 })).toBe(false)
    })

    it('should return false for a field condition on a non-existent nested path', () => {
      const condition: Condition = {
        'nonExistent.field': 'someValue',
      }

      expect(checkConditionValue(condition, { views: 150 })).toBe(false)
    })

    it('should return false for an operator condition on a non-existent nested path', () => {
      const condition: Condition = {
        'nonExistent.field': { $gt: 10 },
      }

      expect(checkConditionValue(condition, { views: 150 })).toBe(false)
    })

    it('should return true for an equality condition on a non-existent nested path when the condition value is also undefined', () => {
      const condition: Condition = {
        'nonExistent.field': undefined,
      }

      expect(checkConditionValue(condition, { views: 150 })).toBe(true)
    })

    it('should return false for an equality condition on an existing field when the condition value is undefined', () => {
      const condition: Condition = {
        status: undefined,
      }

      expect(checkConditionValue(condition, { status: 'published' })).toBe(false)
    })

    it('should return false for a condition on a non-object field', () => {
      const condition: Condition = {
        'status.nested': 'value', // 'status' is a string, cannot have nested properties
      }

      expect(checkConditionValue(condition, { status: 'published' })).toBe(false)
    })

    it('should handle null values correctly with $eq', () => {
      const condition: Condition = { value: { $eq: null } }

      expect(checkConditionValue(condition, { value: null })).toBe(true)

      const conditionMismatch: Condition = { value: { $eq: 'some value' } }

      expect(checkConditionValue(conditionMismatch, { value: null })).toBe(false)
    })

    it('should handle null values correctly with $ne', () => {
      const condition: Condition = { value: { $ne: 'some value' } }

      expect(checkConditionValue(condition, { value: null })).toBe(true)

      const conditionMismatch: Condition = { value: { $ne: null } }

      expect(checkConditionValue(conditionMismatch, { value: null })).toBe(false)
    })
  })
})
