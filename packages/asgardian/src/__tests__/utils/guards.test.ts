import { describe, it, expect } from 'vitest'

import { isRecord, isArray } from '../../core/guards'

describe('Guards', () => {
  describe('isRecord', () => {
    it('should return true for objects', () => {
      expect(isRecord({})).toBeTruthy()
      expect(isRecord({ a: 1 })).toBeTruthy()
    })

    it('should return false for non-objects', () => {
      expect(isRecord(null)).toBeFalsy()
      expect(isRecord(undefined)).toBeFalsy()
      expect(isRecord('string')).toBeFalsy()
      expect(isRecord(123)).toBeFalsy()
      expect(isRecord(true)).toBeFalsy()
    })

    it('should return false for arrays', () => {
      expect(isRecord([])).toBeFalsy()
      expect(isRecord([1, 2, 3])).toBeFalsy()
    })

    it('should return false for Date objects', () => {
      expect(isRecord(new Date())).toBeFalsy()
    })
  })

  describe('isArray', () => {
    it('should return true for arrays', () => {
      expect(isArray([])).toBeTruthy()
      expect(isArray([1, 2, 3])).toBeTruthy()
    })

    it('should return false for non-arrays', () => {
      expect(isArray(null)).toBeFalsy()
      expect(isArray(undefined)).toBeFalsy()
      expect(isArray('string')).toBeFalsy()
      expect(isArray(123)).toBeFalsy()
      expect(isArray(true)).toBeFalsy()
    })

    it('should return false for objects', () => {
      expect(isArray({})).toBeFalsy()
      expect(isArray({ a: 1 })).toBeFalsy()
    })

    it('should return false for Date objects', () => {
      expect(isArray(new Date())).toBeFalsy()
    })
  })
})
