# User Factory

Factory untuk membuat User instances dengan mudah dalam testing.

## Installation

Factory sudah tersedia di `__tests__/factories/userFactory.js`

## Usage

### Basic Usage

```javascript
import { createUser, createAdmin, createManager, createStaff } from '../factories/userFactory.js'

// Create a default user (Staff role)
const user = await createUser()

// Create with custom attributes
const customUser = await createUser({
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Manager'
})

// Create specific role users
const admin = await createAdmin()
const manager = await createManager()
const staff = await createStaff()
```

### Creating Multiple Users

```javascript
import { createUsers } from '../factories/userFactory.js'

// Create 5 users with default attributes
const users = await createUsers(5)

// Create 3 managers
const managers = await createUsers(3, { role: 'Manager' })
```

### Building Without Saving

```javascript
import { buildUser } from '../factories/userFactory.js'

// Build a user instance without saving to database
const user = buildUser({ name: 'Test User' })

// Manually save later if needed
await user.save()
```

### Test Example

```javascript
import { describe, test, expect, beforeEach } from '@jest/globals'
import { createAdmin, createUsers, resetCounter } from '../factories/userFactory.js'
import User from '../../src/models/User.js'

describe('User Authorization', () => {
    beforeEach(async () => {
        await User.destroy({ where: {}, truncate: true })
        resetCounter() // Reset counter for predictable test data
    })

    test('admin can view all users', async () => {
        // Arrange
        const admin = await createAdmin()
        const regularUsers = await createUsers(3)

        // Act
        const allUsers = await User.findAll()

        // Assert
        expect(allUsers).toHaveLength(4) // 1 admin + 3 users
    })

    test('users have unique emails', async () => {
        const user1 = await createUser()
        const user2 = await createUser()

        expect(user1.email).not.toBe(user2.email)
    })
})
```

## API Reference

### `createUser(attributes?)`
Creates a User with default or custom attributes.
- **attributes**: Optional object with user properties
- **Returns**: Promise<User>

### `createAdmin(attributes?)`
Creates an Administrator user.
- **attributes**: Optional object with user properties
- **Returns**: Promise<User>

### `createManager(attributes?)`
Creates a Manager user.
- **attributes**: Optional object with user properties
- **Returns**: Promise<User>

### `createStaff(attributes?)`
Creates a Staff user.
- **attributes**: Optional object with user properties
- **Returns**: Promise<User>

### `buildUser(attributes?)`
Builds a User instance without saving to database.
- **attributes**: Optional object with user properties
- **Returns**: User (not saved)

### `createUsers(count, attributes?)`
Creates multiple users.
- **count**: Number of users to create
- **attributes**: Optional shared attributes for all users
- **Returns**: Promise<Array<User>>

### `generateEmail(prefix?)`
Generates a unique email address.
- **prefix**: Optional prefix for email (default: 'user')
- **Returns**: String (email address)

### `resetCounter()`
Resets the internal counter (useful for test isolation).

## Features

- ✅ Automatic unique email generation
- ✅ Password hashing via User model hooks
- ✅ Sensible defaults for all fields
- ✅ Role-specific factory methods
- ✅ Bulk user creation
- ✅ Build without save option
- ✅ Test isolation with counter reset

## Default Values

- **name**: `Test User {counter}`
- **email**: `user{counter}_{timestamp}@test.com`
- **password**: `password123` (automatically hashed)
- **role**: `Staff`

## Tips

1. Use `resetCounter()` in `beforeEach` for predictable test data
2. Use `buildUser()` when you need to test model validation without saving
3. Use role-specific factories (`createAdmin`, etc.) for clearer test intent
4. Always clean up database in `afterEach` or `beforeEach` for test isolation
