import { describe, it, expect } from 'vitest'

import { createAbility } from '../core/ability'
import * as operators from '../operators'

describe('Ability operators', () => {
  describe('Logical operators', () => {
    it('should handle or operator', () => {
      const ability = createAbility()

      ability.can('read', 'Post', { status: operators.or('published', 'archived') })
      ability.can('update', 'Post', { tags: operators.or('important', 'urgent') })

      expect(ability.isAllowed('read', 'Post', { status: 'published' })).toBe(true)
      expect(ability.isAllowed('read', 'Post', { status: 'draft' })).toBe(false)

      expect(ability.isAllowed('update', 'Post', { tags: ['urgent', 'normal'] })).toBe(true)
      expect(ability.isAllowed('update', 'Post', { tags: ['normal'] })).toBe(false)
    })

    it('should handle logical operators', () => {
      const ability = createAbility()

      ability.can('update', 'Post', { tags: operators.and('important', 'urgent') })

      expect(ability.isAllowed('update', 'Post', { tags: ['important', 'urgent'] })).toBe(true)
    })

    it('should handle and operator', () => {
      const ability = createAbility()

      ability.can('update', 'Post', { tags: operators.and('important', 'urgent') })

      expect(ability.isAllowed('update', 'Post', { tags: ['important', 'urgent'] })).toBe(true)
      expect(ability.isAllowed('update', 'Post', { tags: ['important'] })).toBe(false)
      expect(ability.isAllowed('update', 'Post', { tags: ['urgent'] })).toBe(false)
    })

    it('should handle not operator', () => {
      const ability = createAbility()

      ability.can('delete', 'Post', { category: operators.not('protected') })

      expect(ability.isAllowed('delete', 'Post', { category: 'general' })).toBe(true)
      expect(ability.isAllowed('delete', 'Post', { category: 'protected' })).toBe(false)
    })
  })

  describe('Advanced logical operators', () => {
    it('should handle NAND operator', () => {
      const ability = createAbility()
      ability.can('update', 'Post', { tags: operators.nand('draft', 'archived') })

      // True if NOT both draft AND archived are present
      expect(ability.isAllowed('update', 'Post', { tags: ['draft'] })).toBe(true)
      expect(ability.isAllowed('update', 'Post', { tags: ['archived'] })).toBe(true)
      expect(ability.isAllowed('update', 'Post', { tags: ['draft', 'archived'] })).toBe(false)
      expect(ability.isAllowed('update', 'Post', { tags: ['published'] })).toBe(true)
    })

    it('should handle NOR operator', () => {
      const ability = createAbility()
      ability.can('delete', 'Post', { status: operators.nor('protected', 'archived') })

      // True only if NEITHER protected NOR archived are present
      expect(ability.isAllowed('delete', 'Post', { status: ['draft'] })).toBe(true)
      expect(ability.isAllowed('delete', 'Post', { status: ['protected'] })).toBe(false)
      expect(ability.isAllowed('delete', 'Post', { status: ['archived'] })).toBe(false)
      expect(ability.isAllowed('delete', 'Post', { status: ['protected', 'archived'] })).toBe(false)
    })

    it('should handle XOR operator', () => {
      const ability = createAbility()
      ability.can('create', 'Post', { flags: operators.xor('featured', 'sponsored') })

      // True only if EXACTLY ONE of featured OR sponsored is present
      expect(ability.isAllowed('create', 'Post', { flags: ['featured'] })).toBe(true)
      expect(ability.isAllowed('create', 'Post', { flags: ['sponsored'] })).toBe(true)
      expect(ability.isAllowed('create', 'Post', { flags: ['featured', 'sponsored'] })).toBe(false)
      expect(ability.isAllowed('create', 'Post', { flags: ['regular'] })).toBe(false)
    })

    it('should handle XNOR operator', () => {
      const ability = createAbility()
      ability.can('create', 'Post', { roles: operators.xnor('editor', 'reviewer') })

      // True if user has BOTH roles or NEITHER role
      expect(ability.isAllowed('create', 'Post', { roles: ['editor', 'reviewer'] })).toBe(true)
      expect(ability.isAllowed('create', 'Post', { roles: ['author'] })).toBe(true)
      expect(ability.isAllowed('create', 'Post', { roles: ['editor'] })).toBe(false)
      expect(ability.isAllowed('create', 'Post', { roles: ['reviewer'] })).toBe(false)
    })
  })

  describe('Comparison operators', () => {
    it('should handle greater than', () => {
      const ability = createAbility()

      ability.can('read', 'Post', { views: operators.gt(1000) })

      expect(ability.isAllowed('read', 'Post', { views: 1500 })).toBe(true)
      expect(ability.isAllowed('read', 'Post', { views: 1000 })).toBe(false)
    })

    it('should handle greater than or equal', () => {
      const ability = createAbility()

      ability.can('read', 'Post', { views: operators.gte(1000) })

      expect(ability.isAllowed('read', 'Post', { views: 1500 })).toBe(true)
      expect(ability.isAllowed('read', 'Post', { views: 1000 })).toBe(true)
      expect(ability.isAllowed('read', 'Post', { views: 500 })).toBe(false)
    })

    it('should handle less than', () => {
      const ability = createAbility()

      ability.can('read', 'Post', { views: operators.lt(1000) })

      expect(ability.isAllowed('read', 'Post', { views: 500 })).toBe(true)
      expect(ability.isAllowed('read', 'Post', { views: 1000 })).toBe(false)
    })

    it('should handle less than or equal', () => {
      const ability = createAbility()

      ability.can('read', 'Post', { views: operators.lte(1000) })

      expect(ability.isAllowed('read', 'Post', { views: 500 })).toBe(true)
      expect(ability.isAllowed('read', 'Post', { views: 1000 })).toBe(true)
      expect(ability.isAllowed('read', 'Post', { views: 1500 })).toBe(false)
    })

    it('should handle between operator', () => {
      const ability = createAbility()

      ability.can('update', 'Post', { rating: operators.between(4, 5) })

      expect(ability.isAllowed('update', 'Post', { rating: 4 })).toBe(true)
      expect(ability.isAllowed('update', 'Post', { rating: 4.5 })).toBe(true)
      expect(ability.isAllowed('update', 'Post', { rating: 5 })).toBe(true)
      expect(ability.isAllowed('update', 'Post', { rating: 3.9999 })).toBe(false)
      expect(ability.isAllowed('update', 'Post', { rating: 5.0001 })).toBe(false)
    })
  })

  describe('String operators', () => {
    it('should handle contains operator', () => {
      const ability = createAbility()

      ability.can('read', 'Post', { title: operators.contains('important') })

      expect(ability.isAllowed('read', 'Post', { title: 'This is an important notice' })).toBe(true)
      expect(ability.isAllowed('read', 'Post', { title: 'This is a regular notice' })).toBe(false)
    })

    it('should handle startsWith operator', () => {
      const ability = createAbility()

      ability.can('read', 'Post', { title: operators.startsWith('important') })

      expect(ability.isAllowed('read', 'Post', { title: 'important notice' })).toBe(true)
      expect(ability.isAllowed('read', 'Post', { title: 'some important notice' })).toBe(false)
      expect(ability.isAllowed('read', 'Post', { title: 'regular notice' })).toBe(false)
    })

    it('should handle endsWith operator', () => {
      const ability = createAbility()

      ability.can('read', 'Post', { title: operators.endsWith('important') })

      expect(ability.isAllowed('read', 'Post', { title: 'this notice is important' })).toBe(true)
      expect(ability.isAllowed('read', 'Post', { title: 'regular notice' })).toBe(false)
    })

    it('should handle matches operator', () => {
      const ability = createAbility()

      ability.can('update', 'Post', { slug: operators.matches(/^draft-/i) })

      expect(ability.isAllowed('update', 'Post', { slug: 'draft-post-123' })).toBe(true)
      expect(ability.isAllowed('update', 'Post', { slug: 'DRAFT-POST-123' })).toBe(true)
      expect(ability.isAllowed('update', 'Post', { slug: 'some-draft-123' })).toBe(false)
    })
  })

  describe('Array operators', () => {
    it('should handle includesAll operator', () => {
      const ability = createAbility()

      ability.can('manage', 'Post', { tags: operators.includesAll(['important', 'urgent']) })

      expect(ability.isAllowed('manage', 'Post', { tags: ['important', 'urgent', 'notice'] })).toBe(
        true,
      )
      expect(ability.isAllowed('manage', 'Post', { tags: ['important'] })).toBe(false)
    })

    it('should handle includesAny operator', () => {
      const ability = createAbility()

      ability.can('manage', 'Post', { tags: operators.includesAny(['important', 'urgent']) })

      expect(ability.isAllowed('manage', 'Post', { tags: ['important'] })).toBe(true)
      expect(ability.isAllowed('manage', 'Post', { tags: ['notice'] })).toBe(false)
    })
  })

  describe('Date operators', () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    it('should handle before operator', () => {
      const ability = createAbility()

      ability.can('read', 'Post', { publishDate: operators.before(tomorrow) })

      expect(ability.isAllowed('read', 'Post', { publishDate: today })).toBe(true)
      expect(ability.isAllowed('read', 'Post', { publishDate: yesterday })).toBe(true)
      expect(ability.isAllowed('read', 'Post', { publishDate: tomorrow })).toBe(false)

      // Should work with string dates
      ability.can('read', 'Post', { publishDate: operators.before('2023-12-31') })
      expect(ability.isAllowed('read', 'Post', { publishDate: '2023-01-01' })).toBe(true)
    })

    it('should handle after operator', () => {
      const ability = createAbility()

      ability.can('read', 'Post', { publishDate: operators.after(yesterday) })

      expect(ability.isAllowed('read', 'Post', { publishDate: today })).toBe(true)
      expect(ability.isAllowed('read', 'Post', { publishDate: tomorrow })).toBe(true)
      expect(ability.isAllowed('read', 'Post', { publishDate: yesterday })).toBe(false)
    })

    it('should handle within operator', () => {
      const ability = createAbility()

      ability.can('read', 'Post', { publishDate: operators.within([yesterday, tomorrow]) })

      expect(ability.isAllowed('read', 'Post', { publishDate: today })).toBe(true)
      expect(
        ability.isAllowed('read', 'Post', {
          publishDate: new Date(yesterday.getTime() - 24 * 60 * 60 * 1000),
        }),
      ).toBe(false)
    })

    it('should handle pastDays operator', () => {
      const ability = createAbility()

      ability.can('read', 'Post', { publishDate: operators.pastDays(7) })

      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)

      expect(ability.isAllowed('read', 'Post', { publishDate: today })).toBe(true)
      expect(ability.isAllowed('read', 'Post', { publishDate: yesterday })).toBe(true)
      expect(ability.isAllowed('read', 'Post', { publishDate: weekAgo })).toBe(true)
      expect(
        ability.isAllowed('read', 'Post', {
          publishDate: new Date(weekAgo.getTime() - 24 * 60 * 60 * 1000),
        }),
      ).toBe(false)
    })

    it('should handle futureDays operator', () => {
      const ability = createAbility()

      ability.can('read', 'Post', { publishDate: operators.futureDays(7) })

      const weekFromNow = new Date(today)
      weekFromNow.setDate(weekFromNow.getDate() + 7)

      expect(ability.isAllowed('read', 'Post', { publishDate: today })).toBe(true)
      expect(ability.isAllowed('read', 'Post', { publishDate: weekFromNow })).toBe(true)
      expect(
        ability.isAllowed('read', 'Post', {
          publishDate: new Date(weekFromNow.getTime() + 24 * 60 * 60 * 1000),
        }),
      ).toBe(false)
    })

    it('should handle invalid dates', () => {
      const ability = createAbility()

      ability.can('read', 'Post', { publishDate: operators.before(tomorrow) })

      expect(ability.isAllowed('read', 'Post', { publishDate: 'invalid-date' })).toBe(false)
      expect(ability.isAllowed('read', 'Post', { publishDate: null })).toBe(false)
      expect(ability.isAllowed('read', 'Post', { publishDate: undefined })).toBe(false)
    })
  })
})
