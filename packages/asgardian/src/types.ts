// Base types
export type RuleValue = unknown
export type ConditionValue = unknown

// Operator types
export type OperatorValue = unknown
export type TypedOperatorValue<T = OperatorValue> = T[] & { __type: symbol }
export type OperatorFunction<T = OperatorValue> = (...values: T[]) => TypedOperatorValue<T>

// Logical operator types
export type LogicalOperatorValue = TypedOperatorValue<ConditionValue>
export type ArrayOperatorValue = TypedOperatorValue<ConditionValue[]>
export type ComparisonOperatorValue = TypedOperatorValue<number>
export type StringOperatorValue = TypedOperatorValue<string>
export type RegexOperatorValue = TypedOperatorValue<RegExp>
export type DateOperatorValue = TypedOperatorValue<Date | string>
export type DaysOperatorValue = TypedOperatorValue<number>
export type DateRangeOperatorValue = TypedOperatorValue<[Date | string, Date | string]>

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
