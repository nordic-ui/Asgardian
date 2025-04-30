// Base types
export type RuleValue = unknown
export type ConditionValue = unknown

// Operator types
export interface OperatorValue<T = unknown> extends Array<T> {
  __type: symbol
}

// Logical operator types
export type LogicalOperatorValue = OperatorValue<ConditionValue>
export type ArrayOperatorValue = OperatorValue<ConditionValue[]>
export type ComparisonOperatorValue = OperatorValue<number>
export type StringOperatorValue = OperatorValue<string>
export type RegexOperatorValue = OperatorValue<RegExp>
export type DateOperatorValue = OperatorValue<Date | string>
export type DaysOperatorValue = OperatorValue<number>
export type DateRangeOperatorValue = OperatorValue<[Date | string, Date | string]>

export type Action = 'manage' | 'create' | 'read' | 'update' | 'delete'
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type Resource = 'all' | string | Function
export type Condition = Record<PropertyKey, ConditionValue>

export type Rule = {
  action: Action | Action[]
  resource: Resource
  inverted?: boolean
  conditions?: Condition
}

export type CreateAbility = {
  can: (action: Action | Action[], resource: Resource, conditions?: Condition) => CreateAbility
  cannot: (action: Action, resource: Resource, conditions?: Condition) => CreateAbility
  isAllowed: (action: Action | Action[], resource: Resource, conditions?: Condition) => boolean
  notAllowed: (action: Action | Action[], resource: Resource, conditions?: Condition) => boolean
  rules: Rule[]
}
