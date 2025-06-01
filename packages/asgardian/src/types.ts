// Potential helper type for data objects being checked against conditions
// Define `JsonObject` as a record of string keys to any values
type Primitive = string | number | boolean | Date | null | undefined
export type JsonObject =
  | {
      [key: PropertyKey]: Primitive | Primitive[] | JsonObject
    }
  | JsonObject[]

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
  $between?: [from: number, to: number] | [from: Date, to: Date]
  $regex?: RegExp
  $contains?: string
  $startsWith?: string
  $endsWith?: string
}

/**
 * Represents logical operators for combining conditions.
 * These operators (`$and`, `$or`, etc.) take an array of `Condition`.
 * `$not` takes a single `Condition`.
 */
type LogicalOperator = {
  $or?: Condition[]
  $and?: Condition[]
  $not?: Condition // $not takes a single condition object
  // Consider if these are necessary or if `$not` combined with others is sufficient.
  // $nand?: Condition // Could be represented as `{ $not: { $and: [...] } }`
  // $nor?: Condition[] // Could be represented as `{ $not: { $or: [...] } }`
  // $xor?: Condition[] // More complex, might need custom logic or representation
  // $xnor?: Condition[] // More complex, might need custom logic or representation
}

export type Operator = BaseOperator & LogicalOperator
export type ValidOperator = keyof Operator

/**
 * Represents a condition for filtering resources.
 * It can be a simple key-value pair, a field with operators, or a logical combination of conditions.
 * This type is recursive, allowing for nested logical operators like `$and`, `$or`, and `$not`.
 *
 * ### Usage examples:
 *
 * ```typescript
  // Simple condition: Match a field with a specific value
  const condition1: Condition = { fieldName: "value" };

  // Using comparison operators
  const condition2: Condition = { fieldName: { $gt: 10, $lt: 20 } };

  // Logical combination of conditions
  const condition3: Condition = {
    $and: [
      { fieldName1: { $eq: "value1" } },
      { fieldName2: { $in: ["value2", "value3"] } }
    ]
  };

  // Nested logical operators
  const condition4: Condition = {
    $or: [
      { $and: [{ fieldName: { $gte: 5 } }, { fieldName: { $lte: 15 } }] },
      { fieldName: { $eq: 20 } }
    ]
  };

  // Negating a condition
  const condition5: Condition = { $not: { fieldName: { $eq: "value" } } };
 * ```
 *
 * These examples demonstrate how to construct conditions using the `Condition` type.
 */
export type Condition =
  | Operator
  | ({
      [key: string]: Primitive | Primitive[] | Operator | Condition | Condition[]
    } & {
      [K in `$${string}` as Exclude<K, ValidOperator>]: never
    })
export type ConditionValue = unknown

export type Action<ExtendedActions extends string = never> =
  | 'manage'
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | ExtendedActions
export type Resource<ExtendedResources extends string = never> = 'all' | ExtendedResources

export type Rule<ExtendedActions extends string, ExtendedResources extends string> = {
  action: Action<ExtendedActions> | Action<ExtendedActions>[]
  resource: Resource<ExtendedResources> | Resource<ExtendedResources>[]
  inverted?: boolean
  conditions?: Condition
  reason?: string
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
  ) => CreateAbility<ExtendedActions, ExtendedResources> & {
    reason: (message: string) => CreateAbility<ExtendedActions, ExtendedResources>
  }

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

  getReason: (
    action: Action<ExtendedActions> | Action<ExtendedActions>[],
    resource: Resource<ExtendedResources> | Resource<ExtendedResources>[],
    conditions?: Condition,
  ) => string | undefined

  throwIfNotAllowed: (
    action: Action<ExtendedActions> | Action<ExtendedActions>[],
    resource: Resource<ExtendedResources> | Resource<ExtendedResources>[],
    conditions?: Condition,
  ) => void

  rules: Rule<ExtendedActions, ExtendedResources>[]
}
