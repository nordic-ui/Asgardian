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

export type Action<ExtendedActions extends string = never> =
  | 'manage'
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | ExtendedActions
export type Resource<ExtendedResources extends string = never> = 'all' | ExtendedResources
export type Condition = Record<PropertyKey, ConditionValue>

export type Rule<ExtendedActions extends string, ExtendedResources extends string> = {
  action: Action<ExtendedActions> | Action<ExtendedActions>[]
  resource: Resource<ExtendedResources> | Resource<ExtendedResources>[]
  inverted?: boolean
  conditions?: Condition
}

export type CreateAbility<ExtendedActions extends string, ExtendedResources extends string> = {
  can: (
    action: Action<ExtendedActions> | Action<ExtendedActions>[],
    resource: Resource<ExtendedResources> | Resource<ExtendedResources>[],
    conditions?: Condition,
  ) => CreateAbility<ExtendedActions, ExtendedResources>
  cannot: (
    action: Action<ExtendedActions> | Action<ExtendedActions>[],
    resource: Resource<ExtendedResources> | Resource<ExtendedResources>[],
    conditions?: Condition,
  ) => CreateAbility<ExtendedActions, ExtendedResources>
  isAllowed: (
    action: Action<ExtendedActions> | Action<ExtendedActions>[],
    resource: Resource<ExtendedResources> | Resource<ExtendedResources>[],
    conditions?: Condition,
  ) => boolean
  notAllowed: (
    action: Action<ExtendedActions> | Action<ExtendedActions>[],
    resource: Resource<ExtendedResources> | Resource<ExtendedResources>[],
    conditions?: Condition,
  ) => boolean
  rules: Rule<ExtendedActions, ExtendedResources>[]
}
