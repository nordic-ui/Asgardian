import { describe, it, expect } from 'vitest'

import { ForbiddenError } from '../core/errors'
import { createAbility } from '../'

describe('Ability Reasons', () => {
  it('should set and retrieve reasons for cannot rules', () => {
    const ability = createAbility<'publish', 'Post'>()

    ability.can('read', 'Post')
    ability.can('update', 'Post', { userId: 1 })
    ability.cannot('publish', 'Post', { status: 'draft' }).reason('Cannot publish draft posts')
    ability.cannot('delete', 'Post').reason('Deletion not allowed')

    expect(ability.getReason('publish', 'Post', { status: 'draft' })).toBe(
      'Cannot publish draft posts',
    )
    expect(ability.getReason('delete', 'Post')).toBe('Deletion not allowed')
  })

  it('should return undefined for rules without reasons', () => {
    const ability = createAbility<never, 'Post'>()

    ability.can('read', 'Post')
    ability.cannot('delete', 'Post')

    expect(ability.getReason('read', 'Post')).toBeUndefined()
    expect(ability.getReason('delete', 'Post')).toBeUndefined()
    expect(ability.getReason('update', 'Post')).toBeUndefined()
  })

  it('should return the most recent matching cannot rule reason', () => {
    const ability = createAbility<never, 'Post'>()

    ability.can('read', 'Post')
    ability.cannot('read', 'Post', { private: true }).reason('First reason')
    ability.cannot('read', 'Post', { archived: true }).reason('Second reason')

    expect(ability.getReason('read', 'Post', { private: true, archived: false })).toBe(
      'First reason',
    )
    expect(ability.getReason('read', 'Post', { private: false, archived: true })).toBe(
      'Second reason',
    )
  })

  it('should handle reasons with conditions that do not match', () => {
    const ability = createAbility<never, 'Post'>()

    ability.can('update', 'Post')
    ability.cannot('update', 'Post', { locked: true }).reason('Post is locked')

    expect(ability.getReason('update', 'Post', { locked: false })).toBeUndefined()
    expect(ability.getReason('update', 'Post', { locked: true })).toBe('Post is locked')
    expect(ability.getReason('update', 'Post', { userId: 2 })).toBeUndefined()
  })

  it('should throw ForbiddenError when access is denied', () => {
    const ability = createAbility<never, 'Post'>()

    ability.can('read', 'Post')
    ability.cannot('delete', 'Post').reason('Deletion not allowed')

    expect(() => ability.throwIfNotAllowed('read', 'Post')).not.toThrow()

    expect(() => ability.throwIfNotAllowed('delete', 'Post')).toThrow(ForbiddenError)
    expect(() => ability.throwIfNotAllowed('delete', 'Post')).toThrow('Deletion not allowed')
  })

  it('should throw ForbiddenError with default message when no reason is provided', () => {
    const ability = createAbility<'write', 'Post'>()

    ability.cannot('write', 'Post')

    expect(() => ability.throwIfNotAllowed('write', 'Post')).toThrow(ForbiddenError)
    expect(() => ability.throwIfNotAllowed('write', 'Post')).toThrow('Access denied')
  })

  it('should throw ForbiddenError with default message when action is not explicitly allowed', () => {
    const ability = createAbility<'write', 'Post'>()

    // No rules defined, so 'write' should not be allowed
    expect(() => ability.throwIfNotAllowed('write', 'Post')).toThrow(ForbiddenError)
    expect(() => ability.throwIfNotAllowed('write', 'Post')).toThrow('Access denied')
  })

  it('should throw ForbiddenError with reason based on conditions', () => {
    const ability = createAbility<never, 'Post'>()

    ability.can('update', 'Post')
    ability.cannot('update', 'Post', { locked: true }).reason('Post is locked for editing')

    expect(() => ability.throwIfNotAllowed('update', 'Post', { locked: false })).not.toThrow()

    expect(() => ability.throwIfNotAllowed('update', 'Post', { locked: true })).toThrow(
      ForbiddenError,
    )
    expect(() => ability.throwIfNotAllowed('update', 'Post', { locked: true })).toThrow(
      'Post is locked for editing',
    )
  })

  it('should handle ForbiddenError instanceof checks', () => {
    const ability = createAbility<never, 'Post'>()

    ability.cannot('delete', 'Post').reason('Custom error message')

    try {
      ability.throwIfNotAllowed('delete', 'Post')
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenError)
      expect(error).toBeInstanceOf(Error)
      expect((error as ForbiddenError).name).toBe('ForbiddenError')
      expect((error as ForbiddenError).message).toBe('Custom error message')
    }
  })

  it('should work with chained ability definitions and reasons on cannot rules', () => {
    const ability = createAbility<never, 'Post' | 'Comment'>()
      .can('read', 'Post')
      .can('update', 'Post', { authorId: 123 })
      .cannot('delete', 'Post')
      .reason('Deletion forbidden')
      .can('create', 'Comment')
      .cannot('update', 'Comment', { locked: true })
      .reason('Comment is locked')

    expect(ability.getReason('delete', 'Post')).toBe('Deletion forbidden')
    expect(ability.getReason('update', 'Comment', { locked: true })).toBe('Comment is locked')
    expect(ability.getReason('read', 'Post')).toBeUndefined()
    expect(ability.getReason('create', 'Comment')).toBeUndefined()
  })

  it('should prioritize cannot rules with reasons over can rules', () => {
    const ability = createAbility<never, 'Post'>()

    ability.can('manage', 'Post')
    ability.cannot('delete', 'Post').reason('Deletion disabled')

    expect(ability.isAllowed('create', 'Post')).toBe(true)
    expect(ability.isAllowed('delete', 'Post')).toBe(false)
    expect(ability.getReason('create', 'Post')).toBeUndefined() // can rules don't have reasons
    expect(ability.getReason('delete', 'Post')).toBe('Deletion disabled')
  })

  it('should handle multiple cannot rules with different reasons', () => {
    const ability = createAbility<never, 'Post'>()

    ability.can('manage', 'Post')
    ability.cannot('delete', 'Post', { published: true }).reason('Cannot delete published posts')
    ability
      .cannot('delete', 'Post', { hasComments: true })
      .reason('Cannot delete posts with comments')

    expect(ability.getReason('delete', 'Post', { published: true, hasComments: false })).toBe(
      'Cannot delete published posts',
    )
    expect(ability.getReason('delete', 'Post', { published: false, hasComments: true })).toBe(
      'Cannot delete posts with comments',
    )
  })

  it('should do x', () => {
    const ability = createAbility<never, 'Post'>()
    ability
      .cannot('read', 'Post')
      .reason('Read access denied')
      .cannot('update', 'Post')
      .reason('Update access denied')
      .cannot('delete', 'Post')
      .reason('Delete access denied')
      .cannot('create', 'Post')
      .reason('Create access denied')

    expect(ability.getReason('read', 'Post')).toBe('Read access denied')
    expect(ability.getReason('update', 'Post')).toBe('Update access denied')
    expect(ability.getReason('delete', 'Post')).toBe('Delete access denied')
    expect(ability.getReason('create', 'Post')).toBe('Create access denied')
  })
})
