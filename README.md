<p align="center">
  <img src="apps/docs/public/logo.svg" alt="Asgardian Logo" width="400"/>
</p>

<p align="center">
  A powerful and flexible TypeScript permission system
</p>

<p align="center">
  <a href="https://asgardian.oesterkilde.dk/">Documentation</a> |
  <a href="#installation">Installation</a> |
  <a href="#quick-start">Quick Start</a> |
  <a href="#packages">Packages</a>
</p>

## Overview

Asgardian is a powerful permission management system for TypeScript applications. It provides a simple yet flexible API for defining and checking permissions, with support for:

- Type-safe permission rules
- Complex conditions using logical operators
- Resource-based access control
- Role-based access control
- Time-based permissions
- React integration (Coming soon)

## Packages

This monorepo contains the following packages:

- [@nordic-ui/asgardian](packages/asgardian) - The core permission system
- [@nordic-ui/asgardian-react](packages/asgardian-react) - React hooks library
- [Docs](apps/docs) - Documentation site built with Next.js

## Installation

```bash
# Using npm
npm install @nordic-ui/asgardian

# Using yarn
yarn add @nordic-ui/asgardian

# Using pnpm
pnpm add @nordic-ui/asgardian
```

## Quick Start

```ts
import { createAbility } from '@nordic-ui/asgardian'

// Create a type-safe ability instance
const ability = createAbility<'publish', 'Post'>()

// Define permissions
ability
  .can('read', 'Post', { published: true })
  .can('update', 'Post', { authorId: 123 })
  .can('publish', 'Post', { draft: true, authorId: 123 })
  .cannot('delete', 'Post')

// Check permissions
ability.isAllowed('read', 'Post', { published: true }) // true
ability.isAllowed('publish', 'Post', { draft: false }) // false
ability.isAllowed('delete', 'Post') // false
```

## Features

### Type-Safe Permissions

Extend default actions and resources with your own types:

```ts
type CustomActions = 'publish' | 'archive' | 'feature'
type Resources = 'Post' | 'Comment' | 'User'

const ability = createAbility<CustomActions, Resources>()
```

### Powerful Operators

Use built-in operators for complex conditions:

```ts
ability.can('read', 'Post', {
  $or: [{ status: 'published' }, { status: 'draft' }],
  rating: { $gte: 4 },
  publishDate: { $lt: new Date() },
  tags: { $in: ['featured', 'trending'] }
})
```

### Role-Based Access

Define permissions based on roles:

```ts
const defineAbilities = (user: User) => {
  const ability = createAbility()

  if (user.role === 'admin') {
    ability.can('manage', 'all')
    return ability; // Early return because admin has all permissions already
  }

  if (user.role === 'editor') {
    ability.can(['read', 'update'], 'Post')
    ability.can('publish', 'Post', { draft: true })
  }

  return ability
}
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](https://asgardian.oesterkilde.dk/contributing) for details.