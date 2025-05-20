import { describe, expect, it, vi, afterAll } from 'vitest'

import { checkConditionValue } from '../../core/checkConditionValue'
import { Condition } from '../../types'

describe('Edge Cases', () => {
  const consoleMock = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

  afterAll(() => {
    consoleMock.mockReset()
  })

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
    expect(consoleMock).toHaveBeenCalledOnce()
    expect(consoleMock).toHaveBeenLastCalledWith('Unknown operator: $unknownOperator')
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
