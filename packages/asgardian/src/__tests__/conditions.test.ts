import { describe, it, expectTypeOf, expect } from 'vitest'

import type { Condition } from '../types'

describe('Conditions', () => {
  describe('Valid Operators', () => {
    it('should handle basic field conditions', () => {
      expect(expectTypeOf({ name: 'John Doe' }).toExtend<Condition>()).toBeTruthy()
    })

    it('should handle operator conditions', () => {
      expect(expectTypeOf({ $eq: 123 }).toExtend<Condition>()).toBeTruthy()
    })

    it('should handle mixed conditions', () => {
      expect(
        expectTypeOf({
          name: 'John Doe',
          age: { $gte: 35 },
          position: {
            role: 'Engineer',
            salary: { $between: [1000, 2000] },
          },
        }).toExtend<Condition>(),
      ).toBeTruthy()
    })
  })

  describe('Invalid Operators', () => {
    it('should handle invalid operator conditions', () => {
      expect(expectTypeOf({ $unkownOperator: 123 }).not.toExtend<Condition>()).toBeTruthy()
      expect(expectTypeOf({ $unkownOperator: 123 }).not.toExtend<Condition>()).toBeTruthy()
      expect(expectTypeOf({ nested: { $unkownOperator: 123 } }).toExtend<Condition>()).toBeTruthy()
    })
  })
})
