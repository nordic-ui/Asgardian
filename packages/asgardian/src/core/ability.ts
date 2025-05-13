import type { Action, CreateAbility, Resource, Rule } from '../types'
import { checkConditionValue } from './checkConditionValue'

/**
 * Creates a new ability instance with customizable actions and resources
 * @template ExtendedActions - Extended action types
 * @template ExtendedResources - Extended resource types
 * @returns A new ability instance
 *
 * @example
 * const ability = createAbility<'publish', 'Post'>()
 * ability.can('read', 'Post')
 * ability.cannot('publish', 'Post')
 */
export const createAbility = <
  ExtendedActions extends string = 'manage' | 'create' | 'read' | 'update' | 'delete',
  ExtendedResources extends string = 'all',
>(): CreateAbility<ExtendedActions, ExtendedResources> => {
  const rules: Rule<ExtendedActions, ExtendedResources>[] = []
  const self = {} as CreateAbility<ExtendedActions, ExtendedResources>

  self.can = (action, resource, conditions) => {
    const actions = Array.isArray(action) ? action : [action]
    const resources = Array.isArray(resource) ? resource : [resource]

    // Create a rule for each combination of action and resource
    for (const act of actions) {
      for (const res of resources) {
        rules.push({
          action: act,
          resource: res,
          conditions,
        })
      }
    }

    return self
  }

  self.cannot = (action, resource, conditions) => {
    const actions = Array.isArray(action) ? action : [action]
    const resources = Array.isArray(resource) ? resource : [resource]

    // Create a rule for each combination of action and resource
    for (const act of actions) {
      for (const res of resources) {
        rules.push({
          action: act,
          resource: res,
          inverted: true,
          conditions,
        })
      }
    }

    return self
  }

  self.isAllowed = (action, resource, conditions) => {
    const actionsToCheck = Array.isArray(action) ? action : [action]
    const resourcesToCheck = Array.isArray(resource) ? resource : [resource]

    // Function to check if a rule matches the action and resource
    const ruleMatches = (
      rule: Rule<ExtendedActions, ExtendedResources>,
      actions: Action<ExtendedActions>[],
      resources: Resource<ExtendedResources>[],
    ) => {
      const ruleActions = Array.isArray(rule.action) ? rule.action : [rule.action]
      let resourceMatches = false

      resourceMatches = rule.resource === resource

      if (rule.resource === 'all' || resources?.some((res) => rule.resource === res)) {
        resourceMatches = true
      }

      return (
        resourceMatches &&
        actions.some((act) => ruleActions.includes(act) || ruleActions.includes('manage'))
      )
    }

    let result = { isAllowed: false, rule: {} }

    for (const rule of rules) {
      if (ruleMatches(rule, actionsToCheck, resourcesToCheck)) {
        // Check if conditions match
        const conditionsMatch = !rule.conditions || checkConditionValue(rule.conditions, conditions)

        if (!rule.inverted && conditionsMatch) {
          result = { isAllowed: true, rule }
        } else if (rule.inverted && conditionsMatch) {
          result = { isAllowed: false, rule }
        }
      }
    }

    return result.isAllowed
  }

  self.notAllowed = (action, resource, conditions) => !self.isAllowed(action, resource, conditions)

  self.rules = rules

  return self
}
