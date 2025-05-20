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
  describe('Attribute comparison between subject and resource', () => {
    const definePermissions = (user: User) => {
      const ability = createAbility<never, 'Post' | 'User'>()

      // Users can manage their own profile
      ability.can('manage', 'User', { id: user.id })

      // Users can read posts from their department
      ability.can('read', 'Post', { departmentId: user.department })
      ability.can(['update', 'delete'], 'Post', { authorId: user.id })

      // Managers can manage posts of employees they manage
      if (user.roles.includes('manager')) {
        ability.can('manage', 'Post', { authorId: { $in: [3] } })
      }

      return ability
    }

    describe('Manager permissions', () => {
      it("should allow managers to manage their employees' posts", () => {
        const managerAbility = definePermissions({
          id: 2,
          roles: ['manager'],
          department: 'HR',
          isActive: true,
        })

        // Manager can manage employee's posts
        expect(managerAbility.isAllowed('update', 'Post', { authorId: 3 })).toBe(true)

        // Manager can't manage posts from other departments
        expect(managerAbility.isAllowed('update', 'Post', { authorId: 999 })).toBe(false)
      })
    })

    describe('Employee permissions', () => {
      it('should only allow employees to manage their own posts', () => {
        const employeeAbility = definePermissions({
          id: 3,
          roles: ['employee'],
          department: 'HR',
          managerId: 2,
          isActive: true,
        })
        expect(employeeAbility.isAllowed('update', 'Post', { authorId: 3 })).toBe(true)
        expect(employeeAbility.isAllowed('update', 'Post', { authorId: 2 })).toBe(false)
      })
    })
  })

  describe('Combined RBAC and ABAC', () => {
    const definePermissions = (user: User) => {
      const ability = createAbility<never, 'Post' | 'Comment' | 'UserProfile'>()

      // Role-based permissions (RBAC)
      if (user.roles.includes('admin')) {
        ability.can('manage', 'all')
        return ability
      }

      if (user.roles.includes('manager')) {
        ability.can('manage', ['Post', 'Comment'])
        // But limit to their department (ABAC)
        ability.cannot('manage', 'Post', { departmentId: { $ne: user.department } })
      }

      if (user.roles.includes('employee')) {
        // Basic RBAC permissions
        ability.can('read', ['Post', 'Comment'])

        // Enhanced with ABAC conditions
        ability.can(['update', 'delete'], 'Post', { authorId: user.id })
        ability.can(['update', 'delete'], 'Comment', { authorId: user.id })

        // Can only create when active
        if (user.isActive) {
          ability.can('create', ['Post', 'Comment'])
        }
      }

      // Everyone (RBAC) can manage their own profile (ABAC)
      ability.can('manage', 'UserProfile', { id: user.id })

      return ability
    }

    describe('Admin permissions', () => {
      it('should allow admin to manage everything', () => {
        const adminAbility = definePermissions({
          id: 1,
          roles: ['admin'],
          department: 'IT',
          isActive: true,
        })

        expect(adminAbility.isAllowed('manage', 'Post')).toBe(true) // role-based
      })
    })

    describe('Manager permissions', () => {
      it('should allow manager to manage posts in their department', () => {
        const managerAbility = definePermissions({
          id: 2,
          roles: ['manager'],
          department: 'HR',
          isActive: true,
        })

        expect(managerAbility.isAllowed('manage', 'Post', { departmentId: 'HR' })).toBe(true) // attribute-based
        expect(managerAbility.isAllowed('manage', 'Post', { departmentId: 'IT' })).toBe(false) // attribute-based
      })
    })

    describe('Employee permissions', () => {
      it('should allow employee to manage their own posts', () => {
        const employeeAbility = definePermissions({
          id: 3,
          roles: ['employee'],
          department: 'HR',
          managerId: 2,
          isActive: true,
        })

        expect(employeeAbility.isAllowed('read', 'Post')).toBe(true) // role-based
        expect(employeeAbility.isAllowed('update', 'Post', { authorId: 3 })).toBe(true) // attribute-based
        expect(employeeAbility.isAllowed('update', 'Post', { authorId: 2 })).toBe(false) // attribute-based
        expect(employeeAbility.isAllowed('create', 'Post')).toBe(true) // conditional on user attribute
      })

      it('should not allow ex-employee to manage posts', () => {
        const exEmployeeAbility = definePermissions({
          id: 4,
          roles: ['employee'],
          department: 'HR',
          managerId: 2,
          isActive: false,
        })

        expect(exEmployeeAbility.isAllowed('read', 'Post')).toBe(true) // role-based
        expect(exEmployeeAbility.isAllowed('create', 'Post')).toBe(false) // conditional on user attribute
      })
    })
  })
})
