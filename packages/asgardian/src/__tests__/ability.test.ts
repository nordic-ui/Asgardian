import { describe, it, expect } from 'vitest'

import { createAbility } from '../'

describe('Ability', () => {
  it('should allow an action on a resource when permitted', () => {
    const ability = createAbility<never, 'Post'>()

    ability.can('read', 'Post')

    expect(ability.isAllowed('read', 'Post')).toBeTruthy()
  })

  it('should not allow an action on a resource when not permitted', () => {
    const ability = createAbility<never, 'Post'>()

    expect(ability.isAllowed('read', 'Post')).toBeFalsy()
  })

  it("should ensure 'manage' takes precedence over specific actions", () => {
    const ability = createAbility<'publish', 'Post'>()

    expect(ability.isAllowed('publish', 'Post')).toBeFalsy()

    ability.can('manage', 'all')

    expect(ability.isAllowed('publish', 'Post')).toBeTruthy()
  })

  it('should handle multiple actions in a single rule', () => {
    const ability = createAbility<never, 'Post'>()

    ability.can(['read', 'create'], 'Post')

    expect(ability.isAllowed('read', 'Post')).toBeTruthy()
  })

  it('should handle multiple resources in a single rule', () => {
    const ability = createAbility<never, 'Post' | 'Comment'>()

    ability.can('read', ['Post', 'Comment'])

    expect(ability.isAllowed('read', ['Post', 'Comment'])).toBeTruthy()
  })

  it('should handle all resources', () => {
    const ability = createAbility<'publish', 'Post' | 'Comment'>()

    ability.can('manage', 'all')

    expect(ability.isAllowed('create', 'Post')).toBeTruthy()
    expect(ability.isAllowed('delete', 'Post')).toBeTruthy()
    expect(ability.isAllowed('create', 'Comment')).toBeTruthy()
  })

  it('should handle all resources with exceptions', () => {
    const ability = createAbility<never, 'Post' | 'Comment'>()

    ability.can('manage', 'all')
    ability.cannot('delete', 'Comment') // this should take precedence over the previous rule since it's declared later

    expect(ability.isAllowed(['create', 'delete'], 'Post')).toBeTruthy()

    expect(ability.isAllowed('create', 'Comment')).toBeTruthy()
    expect(ability.isAllowed('delete', 'Comment')).toBeFalsy()
  })

  it('should handle all actions with exceptions', () => {
    const ability = createAbility<never, 'Post' | 'Comment'>()

    ability.can('manage', 'Post')
    ability.cannot('delete', 'Post')
    ability.can('delete', 'all') // this should take precedence over the previous rules since `all` includes `Post`

    expect(ability.isAllowed(['create', 'update', 'delete'], 'Post')).toBeTruthy()

    expect(ability.isAllowed('create', 'Comment')).toBeFalsy()
    expect(ability.isAllowed('delete', 'Comment')).toBeTruthy() // TODO: Figure out if this is the behaviour I want
  })

  it('should respect conditions when checking permissions', () => {
    const ability = createAbility<never, 'Post'>()

    ability.can('read', 'Post', { published: true })

    expect(ability.isAllowed('read', 'Post', { published: true })).toBeTruthy()
    expect(ability.isAllowed('read', 'Post', { published: false })).toBeFalsy()
  })

  it('should handle multiple conditions', () => {
    const ability = createAbility<never, 'Post'>()

    // Equivalent to: ability.can('manage', 'Post', { authorId: 123, published: true })
    ability.can('manage', 'Post', { $and: [{ authorId: 123 }, { published: true }] })

    expect(ability.isAllowed('manage', 'Post', { authorId: 123, published: true })).toBeTruthy()
    expect(ability.isAllowed('manage', 'Post', { authorId: 123, published: false })).toBeFalsy()
    expect(ability.isAllowed('manage', 'Post', { authorId: 456, published: true })).toBeFalsy()
  })

  it('should handle cannot rules', () => {
    const ability = createAbility<never, 'Post'>()

    ability.can('manage', 'Post')
    ability.cannot('delete', 'Post')

    expect(ability.isAllowed(['create', 'read', 'update'], 'Post')).toBeTruthy()
    expect(ability.isAllowed('delete', 'Post')).toBeFalsy()
  })

  it('should handle role-based permissions', () => {
    const adminAbility = createAbility<never, 'Post' | 'Comment'>()

    adminAbility.can('manage', 'all')

    expect(adminAbility.isAllowed('create', 'Post')).toBeTruthy()
    expect(adminAbility.isAllowed('delete', 'Comment')).toBeTruthy()

    const userAbility = createAbility<never, 'Post' | 'Comment'>()

    userAbility.can('read', 'Post')
    userAbility.can(['create', 'update', 'delete'], 'Post', { authorId: 123 })
    userAbility.can(['create', 'read'], 'Comment')

    expect(userAbility.isAllowed('read', 'Post')).toBeTruthy()
    expect(userAbility.isAllowed(['create', 'delete'], 'Post', { authorId: 123 })).toBeTruthy()
    expect(userAbility.isAllowed(['create', 'delete'], 'Post', { authorId: 456 })).toBeFalsy()

    const visitorAbility = createAbility<never, 'Post' | 'Comment'>()

    visitorAbility.can('read', 'Post', { published: true })
    visitorAbility.can('read', 'Comment')

    expect(visitorAbility.isAllowed('read', 'Post', { published: true })).toBeTruthy()
    expect(visitorAbility.isAllowed('read', 'Post', { published: false })).toBeFalsy()
    expect(visitorAbility.isAllowed('create', 'Post')).toBeFalsy()
  })

  it('should handle chained ability definitions', () => {
    const ability = createAbility<never, 'Post' | 'Comment'>()
      .can('read', 'Post')
      .can(['read', 'create'], 'Comment')
      .cannot('update', 'Comment')

    expect(ability.isAllowed('read', 'Post')).toBeTruthy()
    expect(ability.isAllowed('delete', 'Post')).toBeFalsy()
    expect(ability.isAllowed('read', 'Comment')).toBeTruthy()
    expect(ability.isAllowed('create', 'Comment')).toBeTruthy()
    expect(ability.isAllowed('update', 'Comment')).toBeFalsy()
    expect(ability.isAllowed('delete', 'Comment')).toBeFalsy()
  })

  it('should handle not allowed actions', () => {
    const ability = createAbility<never, 'Post'>()

    ability.can('read', 'Post')
    ability.cannot('delete', 'Post')

    expect(ability.notAllowed('read', 'Post')).toBeFalsy()
    expect(ability.notAllowed('delete', 'Post')).toBeTruthy()
  })

  it('should handle destructuring of ability', () => {
    const { can, cannot, isAllowed, notAllowed } = createAbility<never, 'Post'>()
    can('read', 'Post')
    cannot('delete', 'Post')

    expect(isAllowed('read', 'Post')).toBeTruthy()
    expect(isAllowed('delete', 'Post')).toBeFalsy()
    expect(notAllowed('read', 'Post')).toBeFalsy()
    expect(notAllowed('delete', 'Post')).toBeTruthy()
  })

  it('should handle reasons', () => {
    const ability = createAbility<'publish', 'Post'>()

    ability.can('read', 'Post')

    ability
      .cannot('update', 'Post', { userId: { $ne: 1 } })
      .reason('User must be the owner of the post')
      .can('update', 'Post', { userId: 1 })

    ability
      .cannot('publish', 'Post', { status: 'draft' })
      .reason('Post must not be in draft status')
      .can('publish', 'Post', { status: 'published' })

    ability.cannot('delete', 'Post').reason('Deletion not allowed')

    expect(ability.isAllowed('read', 'Post')).toBeTruthy()

    expect(ability.isAllowed('update', 'Post', { userId: 1 })).toBeTruthy()
    expect(ability.isAllowed('update', 'Post', { userId: 2 })).toBeFalsy()
    expect(ability.getReason('update', 'Post', { userId: 2 })).toBe(
      'User must be the owner of the post',
    )

    expect(ability.isAllowed('publish', 'Post', { status: 'published' })).toBeTruthy()
    expect(ability.isAllowed('publish', 'Post', { status: 'draft' })).toBeFalsy()
    expect(ability.getReason('publish', 'Post', { status: 'draft' })).toBe(
      'Post must not be in draft status',
    )

    expect(ability.isAllowed('delete', 'Post')).toBeFalsy()
    expect(ability.getReason('delete', 'Post')).toBe('Deletion not allowed')
  })
})
