import { describe, it, expect } from 'vitest'

import { createAbility } from '../../'

type User = {
  id: number
  roles: string[]
  department?: string
  managerId?: number
  isActive?: boolean
}

describe('Attribute-Based Access Control (ABAC)', () => {
  describe('Basic ABAC', () => {
    const definePermissions = (user: User) => {
      const ability = createAbility<never, 'Post'>()

      // Admin can do anything
      if (user.roles.includes('admin')) {
        ability.can('manage', 'all')
        return ability
      }

      // All active users can read public posts
      if (user.isActive) {
        ability.can('read', 'Post', { published: true, departmentId: user.department })
      }

      // Users can manage their own draft posts
      ability.can(['create', 'update', 'delete'], 'Post', {
        authorId: user.id,
        published: false,
      })

      // Department managers can see all department posts
      if (user.roles.includes('manager')) {
        ability.can('read', 'Post', { departmentId: user.department })
      }

      return ability
    }

    describe('Role-based permissions', () => {
      it('should allow admin to manage everything', () => {
        const adminAbility = definePermissions({
          id: 1,
          roles: ['admin'],
          department: 'IT',
          isActive: true,
        })

        expect(adminAbility.isAllowed('manage', 'Post')).toBe(true)
        expect(adminAbility.isAllowed('delete', 'Post')).toBe(true)
      })

      describe('Manager permissions', () => {
        it('should allow manager to read posts in their department', () => {
          const managerAbility = definePermissions({
            id: 2,
            roles: ['manager'],
            department: 'HR',
            isActive: true,
          })

          expect(
            managerAbility.isAllowed('read', 'Post', {
              id: 101,
              authorId: 3,
              published: true,
              departmentId: 'HR',
            }), // same department and published
          ).toBe(true)
          expect(
            managerAbility.isAllowed('read', 'Post', {
              id: 101,
              authorId: 3,
              published: true,
              confidential: true,
              departmentId: 'HR',
            }), // same department but confidential
          ).toBe(true)
          expect(
            managerAbility.isAllowed('read', 'Post', {
              id: 101,
              authorId: 3,
              published: false,
              departmentId: 'HR',
            }), // same department but not published
          ).toBe(true)
          expect(
            managerAbility.isAllowed('read', 'Post', {
              id: 101,
              authorId: 3,
              published: true,
              departmentId: 'IT',
            }),
          ).toBe(false) // different department
        })
      })

      describe('Employee permissions', () => {
        it('should allow employee to read their own posts', () => {
          const employeeAbility = definePermissions({
            id: 3,
            roles: ['employee'],
            department: 'HR',
            managerId: 2,
            isActive: true,
          })

          expect(
            employeeAbility.isAllowed('read', 'Post', {
              id: 101,
              authorId: 3,
              published: true,
              departmentId: 'HR',
            }),
          ).toBe(true)
          expect(
            employeeAbility.isAllowed('read', 'Post', {
              id: 103,
              authorId: 2,
              published: true,
              departmentId: 'HR',
              confidential: true,
            }),
          ).toBe(true) // it's published
          expect(
            employeeAbility.isAllowed('read', 'Post', {
              id: 102,
              authorId: 3,
              published: false,
              departmentId: 'HR',
            }),
          ).toBe(false) // not published
          expect(
            employeeAbility.isAllowed('delete', 'Post', {
              id: 101,
              authorId: 3,
              published: true,
              departmentId: 'HR',
            }),
          ).toBe(false) // can't delete others' posts
          expect(
            employeeAbility.isAllowed('update', 'Post', {
              id: 102,
              authorId: 3,
              published: false,
              departmentId: 'HR',
            }),
          ).toBe(true) // can update own draft
        })

        it('should allow ex-employee to read their own posts', () => {
          const exEmployeeAbility = definePermissions({
            id: 4,
            roles: ['employee'],
            department: 'HR',
            managerId: 2,
            isActive: false,
          })

          expect(
            exEmployeeAbility.isAllowed('read', 'Post', {
              id: 101,
              authorId: 3,
              published: true,
              departmentId: 'HR',
            }),
          ).toBe(false) // inactive user
        })
      })
    })
  })
})
