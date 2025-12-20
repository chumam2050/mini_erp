import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import sequelize from '../../src/config/database.js'
import User from '../../src/models/User.js'
import {
    createUser,
    createAdmin,
    createManager,
    createStaff,
    buildUser,
    createUsers,
    resetCounter,
    generateEmail
} from '../factories/userFactory.js'

describe('User Factory', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true })
    })

    afterAll(async () => {
        await sequelize.close()
    })

    beforeEach(async () => {
        await User.destroy({ where: {}, truncate: true })
        resetCounter()
    })

    describe('createUser', () => {
        test('should create a user with default attributes', async () => {
            const user = await createUser()

            expect(user).toBeInstanceOf(User)
            expect(user.id).toBeDefined()
            expect(user.name).toContain('Test User')
            expect(user.email).toContain('@test.com')
            expect(user.role).toBe('Staff')
            expect(user.password).toBeDefined()
            expect(user.password).not.toBe('password123') // Should be hashed
        })

        test('should create a user with custom attributes', async () => {
            const user = await createUser({
                name: 'John Doe',
                email: 'john@example.com',
                role: 'Manager'
            })

            expect(user.name).toBe('John Doe')
            expect(user.email).toBe('john@example.com')
            expect(user.role).toBe('Manager')
        })

        test('should create users with unique emails', async () => {
            const user1 = await createUser()
            const user2 = await createUser()

            expect(user1.email).not.toBe(user2.email)
        })

        test('should hash password automatically', async () => {
            const user = await createUser({ password: 'mypassword' })

            expect(user.password).not.toBe('mypassword')
            expect(user.password.length).toBeGreaterThan(20) // Hashed passwords are longer

            // Verify password works with comparePassword
            const isValid = await user.comparePassword('mypassword')
            expect(isValid).toBe(true)
        })
    })

    describe('createAdmin', () => {
        test('should create an Administrator user', async () => {
            const admin = await createAdmin()

            expect(admin.role).toBe('Administrator')
            expect(admin.name).toContain('Admin User')
            expect(admin.email).toContain('admin')
        })

        test('should accept custom attributes', async () => {
            const admin = await createAdmin({
                name: 'Super Admin',
                email: 'superadmin@test.com'
            })

            expect(admin.name).toBe('Super Admin')
            expect(admin.email).toBe('superadmin@test.com')
            expect(admin.role).toBe('Administrator')
        })
    })

    describe('createManager', () => {
        test('should create a Manager user', async () => {
            const manager = await createManager()

            expect(manager.role).toBe('Manager')
            expect(manager.name).toContain('Manager User')
            expect(manager.email).toContain('manager')
        })
    })

    describe('createStaff', () => {
        test('should create a Staff user', async () => {
            const staff = await createStaff()

            expect(staff.role).toBe('Staff')
            expect(staff.name).toContain('Staff User')
            expect(staff.email).toContain('staff')
        })
    })

    describe('buildUser', () => {
        test('should build a user without saving to database', async () => {
            const user = buildUser()

            expect(user).toBeInstanceOf(User)
            expect(user.id).toBeFalsy() // Not saved yet (null or undefined)
            expect(user.name).toContain('Test User')
            expect(user.email).toContain('@test.com')

            // Verify it's not in database
            const count = await User.count()
            expect(count).toBe(0)
        })

        test('should build a user with custom attributes', () => {
            const user = buildUser({
                name: 'Jane Doe',
                email: 'jane@example.com',
                role: 'Manager'
            })

            expect(user.name).toBe('Jane Doe')
            expect(user.email).toBe('jane@example.com')
            expect(user.role).toBe('Manager')
        })
    })

    describe('createUsers', () => {
        test('should create multiple users', async () => {
            const users = await createUsers(5)

            expect(users).toHaveLength(5)
            expect(users[0]).toBeInstanceOf(User)

            // Verify all have unique emails
            const emails = users.map(u => u.email)
            const uniqueEmails = new Set(emails)
            expect(uniqueEmails.size).toBe(5)

            // Verify count in database
            const count = await User.count()
            expect(count).toBe(5)
        })

        test('should create multiple users with shared attributes', async () => {
            const users = await createUsers(3, { role: 'Manager' })

            expect(users).toHaveLength(3)
            users.forEach(user => {
                expect(user.role).toBe('Manager')
            })
        })

        test('should handle creating zero users', async () => {
            const users = await createUsers(0)

            expect(users).toHaveLength(0)
        })
    })

    describe('generateEmail', () => {
        test('should generate unique emails', () => {
            const email1 = generateEmail()
            const email2 = generateEmail()

            expect(email1).toContain('@test.com')
            expect(email2).toContain('@test.com')
            expect(email1).not.toBe(email2)
        })

        test('should accept custom prefix', () => {
            const email = generateEmail('custom')

            expect(email).toContain('custom')
            expect(email).toContain('@test.com')
        })
    })

    describe('resetCounter', () => {
        test('should reset the counter', async () => {
            // Create some users to increment counter
            await createUser()
            await createUser()
            await createUser()

            // Reset counter
            resetCounter()

            // Next user should start from 1 again
            const user = await createUser()
            expect(user.name).toContain('Test User 1')
        })
    })

    describe('Integration with User model hooks', () => {
        test('should work with User password hashing hook', async () => {
            const user = await createUser({ password: 'testpass123' })

            // Password should be hashed
            expect(user.password).not.toBe('testpass123')

            // Should be able to compare password
            const isValid = await user.comparePassword('testpass123')
            expect(isValid).toBe(true)

            const isInvalid = await user.comparePassword('wrongpass')
            expect(isInvalid).toBe(false)
        })

        test('should exclude password from JSON', async () => {
            const user = await createUser()
            const json = user.toJSON()

            expect(json.password).toBeUndefined()
            expect(json.name).toBeDefined()
            expect(json.email).toBeDefined()
        })
    })

    describe('Real-world usage examples', () => {
        test('should easily create test users for different scenarios', async () => {
            // Create an admin for authorization tests
            const admin = await createAdmin({ name: 'Test Admin' })

            // Create regular users for normal operations
            const users = await createUsers(3)

            // Create a manager with specific email
            const manager = await createManager({ 
                email: 'manager@company.com',
                name: 'Department Manager'
            })

            expect(admin.role).toBe('Administrator')
            expect(users).toHaveLength(3)
            expect(manager.email).toBe('manager@company.com')

            // Verify total count
            const totalUsers = await User.count()
            expect(totalUsers).toBe(5) // 1 admin + 3 users + 1 manager
        })

        test('should easily create users for permission tests', async () => {
            const admin = await createAdmin()
            const manager = await createManager()
            const staff = await createStaff()

            expect(admin.role).toBe('Administrator')
            expect(manager.role).toBe('Manager')
            expect(staff.role).toBe('Staff')
        })
    })
})
