import { describe, it, expect } from 'vitest'
import { createAbility } from '../ability'

describe('Ability', () => {
  it('should handle all actions with exceptions', () => {
    const ability = createAbility()

    ability.can('manage', 'Post')
    ability.cannot('delete', 'Post')
    ability.can('delete', 'all') // this should take precedence over the previous rules since `all` includes `Post`

    expect(ability.isAllowed(['create', 'update', 'delete'], 'Post')).toBe(true)
  })

  it('should handle all actions with exceptions', () => {
    const ability = createAbility()

    ability.can('manage', 'Post')
    ability.cannot('delete', 'Post')

    expect(ability.isAllowed(['create', 'update'], 'Post')).toBe(true)
    expect(ability.isAllowed('delete', 'Post')).toBe(false)
  })

  it('should handle multiple conditions', () => {
    const ability = createAbility()

    ability.can('manage', 'Post', { authorId: 123, published: true })

    expect(ability.isAllowed('manage', 'Post', { authorId: 123, published: true })).toBe(true)
    expect(ability.isAllowed('manage', 'Post', { authorId: 123, published: false })).toBe(false)
    expect(ability.isAllowed('manage', 'Post', { authorId: 456 })).toBe(false)
  })
})
