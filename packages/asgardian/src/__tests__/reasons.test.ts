import { describe, it, expect } from 'vitest'

import { ForbiddenError } from '../core/errors'
import { createAbility } from '../'

describe('Ability Reasons', () => {
  it('should set and retrieve reasons', () => {
    const ability = createAbility<'publish', 'Post'>()

    ability.can('read', 'Post').reason('Can read all posts')
    ability.can('update', 'Post', { userId: 1 }).reason('Can only update own posts')
    ability.cannot('publish', 'Post', { status: 'draft' }).reason('Cannot publish draft posts')
    ability.cannot('delete', 'Post').reason('Deletion not allowed')

    expect(ability.getReason('read', 'Post')).toBe('Can read all posts')
    expect(ability.getReason('update', 'Post', { userId: 1 })).toBe('Can only update own posts')
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

  it('should return the most recent matching rule reason', () => {
    const ability = createAbility<never, 'Post'>()

    ability.can('read', 'Post').reason('First read reason')
    ability.can('read', 'Post').reason('Second read reason') // Overrides the first reason
    ability.cannot('read', 'Post', { private: true }).reason('First reason')
    ability.cannot('read', 'Post', { archived: true }).reason('Second reason')

    expect(ability.getReason('read', 'Post')).toBe('Second read reason')
    expect(ability.getReason('read', 'Post', { private: true, archived: false })).toBe(
      'First reason',
    )
    expect(ability.getReason('read', 'Post', { private: false, archived: true })).toBe(
      'Second reason',
    )
  })

  it('should handle reasons with conditions that do not match', () => {
    const ability = createAbility<never, 'Post'>()

    ability.can('update', 'Post').reason('Can update all posts')
    ability.cannot('update', 'Post', { locked: true }).reason('Post is locked')

    expect(ability.getReason('update', 'Post', { locked: false })).toBe('Can update all posts')
    expect(ability.getReason('update', 'Post', { locked: true })).toBe('Post is locked')
    expect(ability.getReason('update', 'Post', { userId: 2 })).toBe('Can update all posts')
  })

  it('should throw ForbiddenError when access is denied', () => {
    const ability = createAbility<never, 'Post'>()

    ability.can('read', 'Post').reason('Read access granted')
    ability.cannot('delete', 'Post').reason('Deletion not allowed')

    expect(() => ability.throwIfNotAllowed('read', 'Post')).not.toThrowError()

    expect(() => ability.throwIfNotAllowed('delete', 'Post')).toThrowError(ForbiddenError)
    expect(() => ability.throwIfNotAllowed('delete', 'Post')).toThrowError('Deletion not allowed')
  })

  it('should throw ForbiddenError with default message when no reason is provided', () => {
    const ability = createAbility<never, 'Post'>()

    ability.cannot('update', 'Post')

    expect(() => ability.throwIfNotAllowed('update', 'Post')).toThrowError(ForbiddenError)
    expect(() => ability.throwIfNotAllowed('update', 'Post')).toThrowError('Access denied')
  })

  it('should throw ForbiddenError with default message when action is not explicitly allowed', () => {
    const ability = createAbility<never, 'Post'>()

    expect(() => ability.throwIfNotAllowed('update', 'Post')).toThrowError(ForbiddenError)
    expect(() => ability.throwIfNotAllowed('update', 'Post')).toThrowError('Access denied')
  })

  it('should throw ForbiddenError with reason based on conditions', () => {
    const ability = createAbility<never, 'Post'>()

    ability.can('update', 'Post').reason('Can update all posts')
    ability.cannot('update', 'Post', { locked: true }).reason('Post is locked for editing')

    expect(() => ability.throwIfNotAllowed('update', 'Post', { locked: false })).not.toThrowError()

    expect(() => ability.throwIfNotAllowed('update', 'Post', { locked: true })).toThrowError(
      ForbiddenError,
    )
    expect(() => ability.throwIfNotAllowed('update', 'Post', { locked: true })).toThrowError(
      'Post is locked for editing',
    )
  })

  it('should handle ForbiddenError instanceof checks', () => {
    const ability = createAbility<never, 'Post'>()

    ability.cannot('delete', 'Post').reason('Custom error message')

    try {
      ability.throwIfNotAllowed('delete', 'Post')
    } catch (error) {
      // I don't like type assertions like this, but in a test it's fine
      const _typedError = error as ForbiddenError

      expect(_typedError).toBeInstanceOf(ForbiddenError)
      expect(_typedError.name).toBe('ForbiddenError')
      expect(_typedError.message).toBe('Custom error message')
    }
  })

  it('should work with chained ability definitions and reasons on cannot rules', () => {
    const ability = createAbility<never, 'Post' | 'Comment'>()
      .can('read', 'Post')
      .reason('Can read all posts')
      .can('update', 'Post', { authorId: 123 })
      .reason('Can update own posts')
      .cannot('delete', 'Post')
      .reason('Deletion forbidden')
      .can('create', 'Comment')
      .reason('Can create comments')
      .cannot('update', 'Comment', { locked: true })
      .reason('Comment is locked')

    expect(ability.getReason('delete', 'Post')).toBe('Deletion forbidden')
    expect(ability.getReason('update', 'Comment', { locked: true })).toBe('Comment is locked')
    expect(ability.getReason('read', 'Post')).toBe('Can read all posts')
    expect(ability.getReason('create', 'Comment')).toBe('Can create comments')
  })

  it('should prioritize cannot rules with reasons over can rules', () => {
    const ability = createAbility<never, 'Post'>()

    ability.can('manage', 'Post').reason('Full access granted')
    ability.cannot('delete', 'Post').reason('Deletion disabled')

    expect(ability.isAllowed('create', 'Post')).toBeTruthy()
    expect(ability.isAllowed('delete', 'Post')).toBeFalsy()
    expect(ability.getReason('create', 'Post')).toBe('Full access granted')
    expect(ability.getReason('delete', 'Post')).toBe('Deletion disabled')
  })

  it('should handle multiple cannot rules with different reasons', () => {
    const ability = createAbility<never, 'Post'>()

    ability.can('manage', 'Post').reason('Full access granted')
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
})
