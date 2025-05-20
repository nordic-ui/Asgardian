import { describe, it, expect } from 'vitest'

import { isRecord, isArray } from '../../core/guards'

describe('Guards', () => {
  describe('isRecord', () => {
    it('should return true for objects', () => {
      expect(isRecord({})).toBe(true)
      expect(isRecord({ a: 1 })).toBe(true)
    })

    it('should return false for non-objects', () => {
      expect(isRecord(null)).toBe(false)
      expect(isRecord(undefined)).toBe(false)
      expect(isRecord('string')).toBe(false)
      expect(isRecord(123)).toBe(false)
      expect(isRecord(true)).toBe(false)
    })

    it('should return false for arrays', () => {
      expect(isRecord([])).toBe(false)
      expect(isRecord([1, 2, 3])).toBe(false)
    })

    it('should return false for Date objects', () => {
      expect(isRecord(new Date())).toBe(false)
    })
  })

  describe('isArray', () => {
    it('should return true for arrays', () => {
      expect(isArray([])).toBe(true)
      expect(isArray([1, 2, 3])).toBe(true)
    })

    it('should return false for non-arrays', () => {
      expect(isArray(null)).toBe(false)
      expect(isArray(undefined)).toBe(false)
      expect(isArray('string')).toBe(false)
      expect(isArray(123)).toBe(false)
      expect(isArray(true)).toBe(false)
    })

    it('should return false for objects', () => {
      expect(isArray({})).toBe(false)
      expect(isArray({ a: 1 })).toBe(false)
    })

    it('should return false for Date objects', () => {
      expect(isArray(new Date())).toBe(false)
    })
  })
})
