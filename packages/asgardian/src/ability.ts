export type Action = 'manage' | 'create' | 'read' | 'update' | 'delete'

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type Resource = 'all' | string | Function

export type Condition = Record<PropertyKey, unknown>

export type Rule = {
  action: Action | Action[]
  resource: Resource
  inverted?: boolean
  conditions?: Condition
}

type CreateAbility = {
  can: (action: Action | Action[], resource: Resource, conditions?: Condition) => CreateAbility
  cannot: (action: Action, resource: Resource, conditions?: Condition) => CreateAbility
  isAllowed: (action: Action | Action[], resource: Resource, conditions?: Condition) => boolean
  notAllowed: (action: Action | Action[], resource: Resource, conditions?: Condition) => boolean
  rules: Rule[]
}

export const createAbility = (): CreateAbility => {
  const rules: Rule[] = []
  const self = {} as CreateAbility

  self.can = (action, resource, conditions) => {
    if (Array.isArray(action)) {
      action.forEach((act) => {
        rules.push({
          action: act,
          resource: resource,
          conditions,
        })
      })
    } else {
      rules.push({
        action: action,
        resource: resource,
        conditions,
      })
    }

    return self
  }

  self.cannot = (action, resource, conditions) => {
    if (Array.isArray(action)) {
      action.forEach((act) => {
        rules.push({
          action: act,
          resource: resource,
          inverted: true,
          conditions,
        })
      })
    } else {
      rules.push({
        action: action,
        resource: resource,
        inverted: true,
        conditions,
      })
    }

    return self
  }

  self.isAllowed = (action, resource, conditions) => {
    const actionsToCheck = Array.isArray(action) ? action : [action]

    // Function to check if a rule matches the action and resource
    const ruleMatches = (rule: Rule, actionsToCheck: Action[]) => {
      const ruleActions = Array.isArray(rule.action) ? rule.action : [rule.action]
      let resourceMatches = false

      if (typeof rule.resource === 'string') {
        resourceMatches = rule.resource === resource
      } else if (typeof rule.resource === 'function') {
        resourceMatches = resource instanceof rule.resource || resource === rule.resource
      }

      if (rule.resource === 'all') {
        resourceMatches = true
      }

      return (
        resourceMatches &&
        actionsToCheck.some((act) => ruleActions.includes(act) || ruleActions.includes('manage'))
      )
    }

    let result = { isAllowed: false, rule: {} }

    for (const rule of rules) {
      if (ruleMatches(rule, actionsToCheck)) {
        if (
          !rule.inverted &&
          (!rule.conditions ||
            Object.entries(rule.conditions).every(([key, value]) => conditions?.[key] === value))
        ) {
          result = { isAllowed: true, rule }
        } else {
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
