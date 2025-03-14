import { describe, it, expect } from 'vitest'
import { createAbility } from '../ability'

type User = { roles: string[] }

const admin: User = { roles: ['admin', 'editor', 'viewer'] }
const editor: User = { roles: ['editor', 'viewer'] }
const viewer: User = { roles: ['viewer'] }
const unknown: User = { roles: [] }

describe('Ability', () => {
  it('should grant abilities based on user role', () => {
    const permissions = (user: User) => {
      const ability = createAbility()

      if (user.roles.includes('viewer')) {
        ability.can('read', 'Post', { published: true })
        ability.can(['read', 'create'], 'Comment')
      }

      if (user.roles.includes('editor')) {
        ability.can('manage', 'Post')
        ability.can('manage', 'Comment')
      }

      if (user.roles.includes('admin')) {
        ability.can('manage', 'all')
      }

      return ability
    }

    expect(permissions(admin).isAllowed(['read', 'create', 'delete'], 'Post')).toBe(true)
    expect(permissions(admin).isAllowed(['read', 'create', 'delete'], 'Comment')).toBe(true)

    expect(permissions(editor).isAllowed(['read', 'create', 'delete'], 'Post')).toBe(true)
    expect(permissions(editor).isAllowed(['read', 'create', 'delete'], 'Comment')).toBe(true)

    expect(permissions(viewer).isAllowed('read', 'Post', { published: true })).toBe(true)
    expect(permissions(viewer).isAllowed('read', 'Post', { published: false })).toBe(false)
    expect(permissions(viewer).isAllowed(['create', 'delete'], 'Post')).toBe(false)
    expect(permissions(viewer).isAllowed(['read', 'create'], 'Comment')).toBe(true)
    expect(permissions(viewer).isAllowed('delete', 'Comment')).toBe(false)

    expect(permissions(unknown).isAllowed('manage', 'Post')).toBe(false)
    expect(permissions(unknown).isAllowed('manage', 'Comment')).toBe(false)
  })
})
