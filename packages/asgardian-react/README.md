<div align="center">
  <h1>Asgardian React <span role="presentation">⚛️</span></h1>
  <p>React hooks and components for the Asgardian authorization library.</p>
</div>

<div align="center">
  <a href="https://asgardian.oesterkilde.dk/?utm_campaign=asgardian-react&utm_source=github&utm_medium=readme">Documentation</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://www.npmjs.com/package/@nordic-ui/asgardian-react">npm</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://github.com/nordic-ui/Asgardian/issues">Issues</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://twitter.com/Kosai106">@Kosai106</a>
  <br>
  <br>
</div>

## Overview

Asgardian React provides React-specific hooks and components to seamlessly integrate the Asgardian authorization library into your React applications. It offers a declarative way to handle permissions and access control in your React components.

## Installation

```sh
npm install @nordic-ui/asgardian-react
yarn add @nordic-ui/asgardian-react
pnpm add @nordic-ui/asgardian-react
```

> Note: `@nordic-ui/asgardian` is a peer dependency and must be installed alongside this package.

## Quick Start

1. **Setup the Ability Provider**
    Wrap your application with the `AbilityProvider` to make permissions available throughout your component tree:

    ```tsx
    import { createAbility } from '@nordic-ui/asgardian';
    import { AbilityProvider } from '@nordic-ui/asgardian-react';

    const ability = createAbility();
    // Configure your ability with rules...

    const App = () => {
      return (
        <AbilityProvider ability={ability}>
          <YourAppComponents />
        </AbilityProvider>
      );
    }
    ```
2. **Use Hooks in Components**
    - `useAbility` - **Full Access to Ability Instance**
      ```tsx
      import { useAbility } from '@nordic-ui/asgardian-react';

      const UserProfile = () => {
        const { can, cannot } = useAbility();

        if (cannot('read', 'user')) {
          return <div>Access denied</div>;
        }

        return (
          <div>
            <h1>User Profile</h1>
            {can('edit', 'user') && (
              <button>Edit Profile</button>
            )}
          </div>
        );
      }
      ```
    - `useCan` - **Check Single Permission**
      ```tsx
      import { useCan } from '@nordic-ui/asgardian-react';

      const EditButton = () => {
        const canEdit = useCan('edit', 'post');

        return canEdit ? <button>Edit Post</button> : null;
      }
      ```
    - `useCannot` - **Check Denied Permission**
      ```tsx
      import { useCannot } from '@nordic-ui/asgardian-react';

      const AdminPanel = () => {
        const cannotAccess = useCannot('access', 'admin');

        if (cannotAccess) {
          return <div>Insufficient permissions</div>;
        }

        return <div>Admin Panel Content</div>;
      }
      ```

## API Reference

### Hooks

#### `useAbility<TActions, TResources>()`

Returns an object with permission checking methods that are memoized for performance.

##### Returns:

- `isAllowed(action, resource, conditions?)` - Check if action is allowed
- `notAllowed(action, resource, conditions?)` - Check if action is not allowed
- `can(action, resource, conditions?)` - Alias for `isAllowed`
- `cannot(action, resource, conditions?)` - Alias for `notAllowed`

#### `useCan<TActions, TResources>(action, resource, conditions?)`

##### Parameters:

- `action: TActions` - The action to check
- `resource: TResources` - The resource to check against
- `conditions?: Condition` - Optional conditions

##### Returns:

`boolean` - Whether the action is allowed

#### `useCannot<TActions, TResources>(action, resource, conditions?)`

##### Parameters:

- `action: TActions` - The action to check
- `resource: TResources` - The resource to check against
- `conditions?: Condition` - Optional conditions

##### Returns:

`boolean` - Whether the action is not allowed

## TypeScript Support

All hooks support generic types for actions and resources:

```ts
type Actions = 'create' | 'read' | 'update' | 'delete';
type Resources = 'post' | 'user' | 'comment';

const { can } = useAbility<Actions, Resources>();
const canEdit = useCan<Actions, Resources>('update', 'post');
```

> NOTE: If no custom actions are needed, either leave the generics empty or use the `never` type.

## Examples

### Conditional Rendering

```tsx
const PostActions = ({ post }) => {
  const { can } = useAbility();

  return (
    <div>
      {can('edit', 'post', { userId: post.authorId }) && (
        <button>Edit</button>
      )}
      {can('delete', 'post', { userId: post.authorId }) && (
        <button>Delete</button>
      )}
    </div>
  );
}
```

### Route Protection

```tsx
import { useCannot } from '@nordic-ui/asgardian-react';

const ProtectedRoute = ({ children }) => {
  const cannotAccess = useCannot('access', 'admin');

  if (cannotAccess) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}
```

---

#### License

**Asgardian React** is licensed under the MIT license.

#### Author

Made by [Kevin Østerkilde](https://oesterkilde.dk/?utm_campaign=asgardian&utm_source=github&utm_medium=readme)
