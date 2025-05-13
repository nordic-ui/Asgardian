// Potential helper type for data objects being checked against conditions
// Define JsonObject as a record of string keys to any values
type Primitive = string | number | boolean | Date | null | undefined
export type JsonObject =
  | {
      [key: PropertyKey]: Primitive | Primitive[] | JsonObject | JsonObject[]
    }
  | JsonObject[]

/**
 * Represents a condition for filtering resources.
 * It can be a simple key-value pair, a field with operators, or a logical combination of conditions.
 * It's a recursive type to allow for nested logical operators.
 */
export type ConditionObject =
  | Record<
      string | Operator,
      string | number | boolean | Date | null | undefined | BaseOperator | ConditionObject[]
    >
  | LogicalOperator

/**
 * Represents the base comparison operators that can be applied to a field.
 */
type BaseOperator = {
  $eq?: unknown
  $ne?: unknown
  $in?: unknown[]
  $nin?: unknown[]
  $gt?: number | Date
  $gte?: number | Date
  $lt?: number | Date
  $lte?: number | Date
  $between?: [start: number, end: number] | [startDate: Date, endDate: Date]
  $regex?: RegExp
  $contains?: string
  $startsWith?: string
  $endsWith?: string
}

/**
 * Represents logical operators for combining conditions.
 * These operators ($and, $or, etc.) take an array of ConditionObject.
 * $not takes a single ConditionObject.
 */
type LogicalOperator = {
  $or?: ConditionObject[]
  $and?: ConditionObject[]
  $not?: ConditionObject // $not takes a single condition object
  // Consider if these are necessary or if $not combined with others is sufficient.
  // $nand?: ConditionObject // Could be represented as { $not: { $and: [...] } }
  // $nor?: ConditionObject[] // Could be represented as { $not: { $or: [...] } }
  // $xor?: ConditionObject[] // More complex, might need custom logic or representation
  // $xnor?: ConditionObject[] // More complex, might need custom logic or representation
}

export type Operators = BaseOperator & LogicalOperator
export type Operator = keyof Operators

// Export the new condition type
export type NewCondition = ConditionObject

// === Existing Guard Types (kept and potentially adapted later) ===
// Base types
export type RuleValue = unknown
export type ConditionValue = unknown

// Operator types
export type OperatorValue = unknown
export type TypedOperatorValue<T = OperatorValue> = T[] & { __type: symbol }
export type OperatorFunction<T = OperatorValue> = (...values: T[]) => TypedOperatorValue<T>

// Logical operator types (these will likely need to be adapted)
export type LogicalOperatorValue = TypedOperatorValue<ConditionValue>
export type ArrayOperatorValue = TypedOperatorValue<ConditionValue[]>
export type ComparisonOperatorValue = TypedOperatorValue<number>
export type StringOperatorValue = TypedOperatorValue<string>
export type RegexOperatorValue = TypedOperatorValue<RegExp>
export type DateOperatorValue = TypedOperatorValue<Date | string>
export type DaysOperatorValue = TypedOperatorValue<number>
export type DateRangeOperatorValue = TypedOperatorValue<[Date | string, Date | string]>

// Action and Resource types
export type Action<ExtendedActions extends string = never> =
  | 'manage'
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | ExtendedActions
export type Resource<ExtendedResources = never> = 'all' | ExtendedResources

// Rule type - updated to use NewCondition
export type Rule<ExtendedActions extends string, ExtendedResources extends string> = {
  action: Action<ExtendedActions> | Action<ExtendedActions>[]
  resource: Resource<ExtendedResources>
  inverted?: boolean
  conditions?: NewCondition // Use the new condition type
}

// CreateAbility type - updated to use NewCondition
export type CreateAbility<ExtendedActions extends string, ExtendedResources extends string> = {
  can: (
    action: Action<ExtendedActions> | Action<ExtendedActions>[],
    resource: Resource<ExtendedResources>,
    conditions?: NewCondition, // Use the new condition type
  ) => CreateAbility<ExtendedActions, ExtendedResources>
  cannot: (
    action: Action<ExtendedActions>,
    resource: Resource<ExtendedResources>,
    conditions?: NewCondition, // Use the new condition type
  ) => CreateAbility<ExtendedActions, ExtendedResources>
  isAllowed: (
    action: Action<ExtendedActions> | Action<ExtendedActions>[],
    resource: Resource<ExtendedResources>,
    conditions?: NewCondition, // Use the new condition type
  ) => boolean
  notAllowed: (
    action: Action<ExtendedActions> | Action<ExtendedActions>[],
    resource: Resource<ExtendedResources>,
    conditions?: NewCondition, // Use the new condition type
  ) => boolean
  rules: Rule<ExtendedActions, ExtendedResources>[]
}

// TODO: Figure out if needed
export type DataObject = JsonObject | null | undefined
