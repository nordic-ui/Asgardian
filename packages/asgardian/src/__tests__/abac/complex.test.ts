import { describe, it, expect } from 'vitest'

import { createAbility } from '../../'

describe('Attribute-Based Access Control (ABAC)', () => {
  describe('Complex ABAC Conditions', () => {
    it('should support complex attribute-based conditions', () => {
      const ability = createAbility<never, 'Post' | 'Document'>()

      // A user can read a post if:
      // 1. They are the author, OR
      // 2. The post is published AND (it's not confidential OR they are in the same department)
      ability.can('read', 'Post', {
        $or: [
          { authorId: 3 },
          {
            $and: [
              { published: true },
              {
                $or: [{ confidential: false }, { departmentId: 'HR' }],
              },
            ],
          },
        ],
      })

      describe('When user is the author', () => {
        it('should allow access to own posts regardless of status', () => {
          expect(
            ability.isAllowed('read', 'Post', {
              id: 102,
              authorId: 3,
              published: false,
              departmentId: 'HR',
            }),
          ).toBe(true) // user is author
        })
      })

      describe('When user is not the author', () => {
        it('should allow reading published, non-confidential posts', () => {
          expect(
            ability.isAllowed('read', 'Post', {
              id: 105,
              authorId: 999,
              published: true,
              departmentId: 'Finance',
              confidential: false,
            }),
          ).toBe(true) // published, not confidential
        })

        it('should allow reading confidential posts in same department', () => {
          expect(
            ability.isAllowed('read', 'Post', {
              id: 103,
              authorId: 2,
              published: true,
              departmentId: 'HR',
              confidential: true,
            }),
          ).toBe(true) // confidential but same department
        })

        it('should deny reading confidential posts from different departments', () => {
          expect(
            ability.isAllowed('read', 'Post', {
              id: 106,
              authorId: 999,
              published: true,
              departmentId: 'Finance',
              confidential: true,
            }),
          ).toBe(false) // different department, confidential
        })

        it('should deny reading posts from different departments', () => {
          expect(
            ability.isAllowed('read', 'Post', {
              id: 104,
              authorId: 1,
              published: true,
              departmentId: 'IT',
            }),
          ).toBe(false) // published but different department
        })
      })
    })
  })
})
