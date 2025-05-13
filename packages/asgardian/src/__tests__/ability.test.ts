import { describe, it, expect } from 'vitest'

import { createAbility } from '../core/ability'

describe('Ability', () => {
  it('should allow an action on a resource when permitted', () => {
    const ability = createAbility<never, 'Post'>()

    ability.can('read', 'Post')

    expect(ability.isAllowed('read', 'Post')).toBe(true)
  })

  it('should not allow an action on a resource when not permitted', () => {
    const ability = createAbility<never, 'Post'>()

    expect(ability.isAllowed('read', 'Post')).toBe(false)
  })

  it('should handle multiple actions in a single rule', () => {
    const ability = createAbility<never, 'Post'>()

    ability.can(['read', 'create'], 'Post')

    expect(ability.isAllowed('read', 'Post')).toBe(true)
    expect(ability.isAllowed('create', 'Post')).toBe(true)
    expect(ability.isAllowed('update', 'Post')).toBe(false)
  })

  it('should handle all resources', () => {
    const ability = createAbility<never, 'Post' | 'Comment'>()

    ability.can('manage', 'all')

    // Basic "all" resource tests
    expect(ability.isAllowed('create', 'Post')).toBe(true)
    expect(ability.isAllowed('delete', 'Post')).toBe(true)
    expect(ability.isAllowed('create', 'Comment')).toBe(true)
  })

  it('should handle all resources with exceptions', () => {
    const ability = createAbility<never, 'Post' | 'Comment'>()

    ability.can('manage', 'all')
    ability.cannot('delete', 'Comment') // this should take precedence over the previous rule since it's declared later

    // Test permissions with exception
    expect(ability.isAllowed(['create', 'delete'], 'Post')).toBe(true)

    expect(ability.isAllowed('create', 'Comment')).toBe(true)
    expect(ability.isAllowed('delete', 'Comment')).toBe(false)
  })

  it('should handle all actions with exceptions', () => {
    const ability = createAbility<never, 'Post' | 'Comment'>()

    ability.can('manage', 'Post')
    ability.cannot('delete', 'Post')
    ability.can('delete', 'all') // this should take precedence over the previous rules since `all` includes `Post`

    // Test permissions with action exceptions
    expect(ability.isAllowed(['create', 'update', 'delete'], 'Post')).toBe(true)

    // Inherited "all" permissions
    expect(ability.isAllowed('create', 'Comment')).toBe(false)
    expect(ability.isAllowed('delete', 'Comment')).toBe(true) // TODO: Figure out if this is the behaviour I want
  })

  it('should respect conditions when checking permissions', () => {
    const ability = createAbility<never, 'Post'>()

    ability.can('read', 'Post', { published: { $eq: true } })

    expect(ability.isAllowed('read', 'Post', { published: true })).toBe(true)
    expect(ability.isAllowed('read', 'Post', { published: false })).toBe(false)
  })

  it('should handle multiple conditions', () => {
    const ability = createAbility<never, 'Post'>()

    ability.can('manage', 'Post', { $and: [{ authorId: 123 }, { published: true }] })

    expect(ability.isAllowed('manage', 'Post', { authorId: 123, published: true })).toBe(true)
    expect(ability.isAllowed('manage', 'Post', { authorId: 123, published: false })).toBe(false)
    expect(ability.isAllowed('manage', 'Post', { authorId: 456 })).toBe(false)
  })

  it('should handle cannot rules', () => {
    const ability = createAbility<never, 'Post'>()

    ability.can('manage', 'Post')
    ability.cannot('delete', 'Post')

    expect(ability.isAllowed(['create', 'read', 'update'], 'Post')).toBe(true)
    expect(ability.isAllowed('delete', 'Post')).toBe(false)
  })

  it('should handle role-based permissions', () => {
    const adminAbility = createAbility<never, 'Post' | 'Comment'>()

    adminAbility.can('manage', 'all')

    expect(adminAbility.isAllowed('create', 'Post')).toBe(true)
    expect(adminAbility.isAllowed('delete', 'Comment')).toBe(true)

    const userAbility = createAbility<never, 'Post' | 'Comment'>()

    userAbility.can('read', 'Post')
    userAbility.can(['create', 'update', 'delete'], 'Post', { authorId: { $eq: 123 } })
    userAbility.can(['create', 'read'], 'Comment')

    expect(userAbility.isAllowed('read', 'Post')).toBe(true)
    expect(userAbility.isAllowed(['create', 'delete'], 'Post', { authorId: 123 })).toBe(true)
    expect(userAbility.isAllowed(['create', 'delete'], 'Post', { authorId: 456 })).toBe(false)

    const visitorAbility = createAbility<never, 'Post' | 'Comment'>()

    visitorAbility.can('read', 'Post', { published: { $eq: true } })
    visitorAbility.can('read', 'Comment')

    expect(visitorAbility.isAllowed('read', 'Post', { published: true })).toBe(true)
    expect(visitorAbility.isAllowed('read', 'Post', { published: false })).toBe(false)
    expect(visitorAbility.isAllowed('create', 'Post')).toBe(false)
  })

  it('should handle chained ability definitions', () => {
    const ability = createAbility<never, 'Post' | 'Comment'>()
      .can('read', 'Post')
      .can(['read', 'create'], 'Comment')
      .cannot('update', 'Comment')

    expect(ability.isAllowed('read', 'Post')).toBe(true)
    expect(ability.isAllowed('delete', 'Post')).toBe(false)
    expect(ability.isAllowed('read', 'Comment')).toBe(true)
    expect(ability.isAllowed('create', 'Comment')).toBe(true)
    expect(ability.isAllowed('update', 'Comment')).toBe(false)
    expect(ability.isAllowed('delete', 'Comment')).toBe(false)
  })
})
