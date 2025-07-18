import { describe, it, expect } from 'vitest'

import { createAbility } from '../../'

type User = { roles: string[]; id?: number }

const admin: User = { roles: ['admin', 'editor', 'viewer'], id: 1 }
const editor: User = { roles: ['editor', 'viewer'], id: 2 }
const viewer: User = { roles: ['viewer'], id: 3 }
const unknown: User = { roles: [] }

describe('Role-Based Access Control (RBAC)', () => {
  it('should grant abilities based on user role', () => {
    const permissions = (user: User) => {
      const ability = createAbility<'publish', 'Post' | 'Comment'>()

      if (user.roles.includes('admin')) {
        ability.can('manage', 'all')
        // Early return because admin has all permissions already
        return ability
      }

      if (user.roles.includes('viewer')) {
        ability.can('read', 'Post', { published: true })
        ability.can(['read', 'create'], 'Comment')
        ability.can(['update', 'delete'], 'Comment', { authorId: user.id })
      }

      if (user.roles.includes('editor')) {
        ability.can(['read', 'create'], 'Post')
        ability.can(['update', 'delete', 'publish'], 'Post', { authorId: user.id })
        ability.can(['read', 'create'], 'Comment')
        ability.can(['update', 'delete'], 'Comment', { authorId: user.id, postId: 1 })
      }

      return ability
    }

    // Admin
    expect(permissions(admin).isAllowed('manage', 'all')).toBeTruthy()
    expect(permissions(admin).isAllowed('manage', 'Post')).toBeTruthy()
    expect(permissions(admin).isAllowed('manage', 'Comment')).toBeTruthy()

    // Editor
    expect(permissions(editor).isAllowed(['read', 'create'], 'Post')).toBeTruthy()
    expect(
      permissions(editor).isAllowed(['update', 'delete', 'publish'], 'Post', { authorId: 2 }),
    ).toBeTruthy()
    expect(
      permissions(editor).isAllowed(['update', 'delete', 'publish'], 'Post', { authorId: 1 }),
    ).toBeFalsy()
    expect(permissions(editor).isAllowed(['read', 'create'], 'Comment')).toBeTruthy()
    expect(
      permissions(editor).isAllowed(['update', 'delete'], 'Comment', { authorId: 2, postId: 1 }),
    ).toBeTruthy()
    expect(
      permissions(editor).isAllowed(['update', 'delete'], 'Comment', { authorId: 1, postId: 2 }),
    ).toBeFalsy()

    // Viewer
    expect(permissions(viewer).isAllowed('read', 'Post', { published: true })).toBeTruthy()
    expect(permissions(viewer).isAllowed('read', 'Post', { published: false })).toBeFalsy()
    expect(permissions(viewer).isAllowed(['create', 'delete', 'publish'], 'Post')).toBeFalsy()
    expect(permissions(viewer).isAllowed(['read', 'create'], 'Comment')).toBeTruthy()
    expect(permissions(viewer).isAllowed('delete', 'Comment')).toBeFalsy()

    // No role
    expect(permissions(unknown).isAllowed('manage', 'Post')).toBeFalsy()
    expect(permissions(unknown).isAllowed('manage', 'Comment')).toBeFalsy()
  })
})
