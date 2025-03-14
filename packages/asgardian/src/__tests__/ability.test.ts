import { describe, it, expect } from 'vitest'
import { createAbility } from '../ability'

describe('Ability', () => {
  it('should allow an action on a resource when permitted', () => {
    const ability = createAbility()

    ability.can('read', 'Post')

    expect(ability.isAllowed('read', 'Post')).toBe(true)
  })

  it('should not allow an action on a resource when not permitted', () => {
    const ability = createAbility()

    expect(ability.isAllowed('read', 'Post')).toBe(false)
  })

  it('should handle multiple actions in a single rule', () => {
    const ability = createAbility()

    ability.can(['read', 'create'], 'Post')

    expect(ability.isAllowed('read', 'Post')).toBe(true)
    expect(ability.isAllowed('create', 'Post')).toBe(true)
    expect(ability.isAllowed('update', 'Post')).toBe(false)
  })

  it('should handle all resources', () => {
    const ability = createAbility()

    ability.can('manage', 'all')

    // Basic "all" resource tests
    expect(ability.isAllowed('create', 'Post')).toBe(true)
    expect(ability.isAllowed('delete', 'Post')).toBe(true)
    expect(ability.isAllowed('create', 'Comment')).toBe(true)
  })

  it('should handle all resources with exceptions', () => {
    const ability = createAbility()

    ability.can('manage', 'all')
    ability.cannot('delete', 'Comment') // this should take precedence over the previous rule since it's declared later

    // Test permissions with exception
    expect(ability.isAllowed(['create', 'delete'], 'Post')).toBe(true)

    expect(ability.isAllowed('create', 'Comment')).toBe(true)
    expect(ability.isAllowed('delete', 'Comment')).toBe(false)
  })

  it('should handle all actions with exceptions', () => {
    const ability = createAbility()

    ability.can('manage', 'Post')
    ability.cannot('delete', 'Post')
    ability.can('delete', 'all') // this should take precedence over the previous rules since `all` includes `Post`

    // Test permissions with action exceptions
    expect(ability.isAllowed(['create', 'update', 'delete'], 'Post')).toBe(true)

    // Inherited "all" permissions
    expect(ability.isAllowed('create', 'Comment')).toBe(false)
    expect(ability.isAllowed('delete', 'Comment')).toBe(true) // TODO: Figure out if this is the behaviour I want
  })

  it('should handle class-based resources', () => {
    const ability = createAbility()

    class Post {}

    ability.can('read', Post)

    expect(ability.isAllowed('read', Post)).toBe(true)
  })

  it('should handle function-based resources', () => {
    const ability = createAbility()

    function Post() {}

    ability.can('read', Post)

    expect(ability.isAllowed('read', Post)).toBe(true)
  })

  it('should respect conditions when checking permissions', () => {
    const ability = createAbility()

    ability.can('read', 'Post', { published: true })

    const publishedPost = { published: true }
    const draftPost = { published: false }

    expect(ability.isAllowed('read', 'Post', publishedPost)).toBe(true)
    expect(ability.isAllowed('read', 'Post', draftPost)).toBe(false)
  })

  it('should handle cannot rules', () => {
    const ability = createAbility()

    ability.can('manage', 'Post')
    ability.cannot('delete', 'Post')

    expect(ability.isAllowed(['create', 'read', 'update'], 'Post')).toBe(true)
    expect(ability.isAllowed('delete', 'Post')).toBe(false)
  })

  it('should handle role-based permissions', () => {
    const adminAbility = createAbility()

    adminAbility.can('manage', 'all')

    expect(adminAbility.isAllowed('create', 'Post')).toBe(true)
    expect(adminAbility.isAllowed('delete', 'Comment')).toBe(true)

    const userAbility = createAbility()

    userAbility.can('read', 'Post')
    userAbility.can(['create', 'update', 'delete'], 'Post', { authorId: 123 })
    userAbility.can(['create', 'read'], 'Comment')

    expect(userAbility.isAllowed('read', 'Post')).toBe(true)
    expect(userAbility.isAllowed(['create', 'delete'], 'Post', { authorId: 123 })).toBe(true)
    expect(userAbility.isAllowed(['create', 'delete'], 'Post', { authorId: 456 })).toBe(false)

    const visitorAbility = createAbility()

    visitorAbility.can('read', 'Post', { published: true })
    visitorAbility.can('read', 'Comment')

    expect(visitorAbility.isAllowed('read', 'Post', { published: true })).toBe(true)
    expect(visitorAbility.isAllowed('read', 'Post', { published: false })).toBe(false)
    expect(visitorAbility.isAllowed('create', 'Post')).toBe(false)
  })

  it('should handle chained ability definitions', () => {
    const ability = createAbility().can('read', 'Post').can(['read', 'create'], 'Comment')

    expect(ability.isAllowed('read', 'Post')).toBe(true)
    expect(ability.isAllowed('delete', 'Post')).toBe(false)
    expect(ability.isAllowed('read', 'Comment')).toBe(true)
    expect(ability.isAllowed('create', 'Comment')).toBe(true)
    expect(ability.isAllowed('delete', 'Comment')).toBe(false)
  })
})
