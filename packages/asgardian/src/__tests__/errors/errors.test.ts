import { describe, it, expect } from 'vitest'

import { ForbiddenError } from '../../core/errors'

describe('ForbiddenError', () => {
  it('should create error with custom message', () => {
    const error = new ForbiddenError('Custom message')

    expect(error.message).toBe('Custom message')
    expect(error.name).toBe('ForbiddenError')
    expect(error).toBeInstanceOf(Error)
  })

  it('should create error with default message', () => {
    const error = new ForbiddenError()

    expect(error.message).toBe('Access denied')
    expect(error.name).toBe('ForbiddenError')
  })

  it('should maintain proper stack trace', () => {
    const error = new ForbiddenError('Test error')

    expect(error.stack).toBeDefined()
    expect(error.stack).toContain('ForbiddenError')
  })
})
