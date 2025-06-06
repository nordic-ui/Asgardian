import { describe, it, expectTypeOf, expect } from 'vitest'

import { createAbility } from '../'
import type { Action, Resource } from '../types'

describe('Ability Types', () => {
  it('should have default action and resource types', () => {
    const ability = createAbility()

    expect(
      expectTypeOf(ability.can).parameter(0).toExtend<Action<never> | Action<never>[]>(),
    ).toBeTruthy()
    expect(
      expectTypeOf(ability.can).parameter(1).toExtend<Resource<never> | Resource<never>[]>(),
    ).toBeTruthy()
  })

  it('should allow extending actions and resource types', () => {
    const ability = createAbility<'publish', 'Post'>()

    ability.can('publish', 'Post')

    expect(
      expectTypeOf(ability.can).parameter(0).toExtend<Action<'publish'> | Action<'publish'>[]>(),
    ).toBeTruthy()
    expect(
      expectTypeOf(ability.can).parameter(1).toExtend<Resource<'Post'> | Resource<'Post'>[]>(),
    ).toBeTruthy()
  })

  it('should allow extending just action type', () => {
    const ability = createAbility<'publish'>()

    ability.can('publish', 'all')

    expect(
      expectTypeOf(ability.can).parameter(0).toExtend<Action<'publish'> | Action<'publish'>[]>(),
    ).toBeTruthy()
    expect(
      expectTypeOf(ability.can).parameter(1).toExtend<Resource<never> | Resource<never>[]>(),
    ).toBeTruthy()
  })

  it('should allow extending just resource type', () => {
    const ability = createAbility<never, 'Post'>()

    ability.can('read', 'Post')

    expect(
      expectTypeOf(ability.can).parameter(0).toExtend<Action<never> | Action<never>[]>(),
    ).toBeTruthy()
    expect(
      expectTypeOf(ability.can).parameter(1).toExtend<Resource<'Post'> | Resource<'Post'>[]>(),
    ).toBeTruthy()
  })
})
