import { describe, test, expect } from '@jest/globals'
import bcrypt from 'bcryptjs'
import User from '../src/models/User.js'
import sequelize from '../src/config/database.js'

describe('User Model', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true })
    })

    afterAll(async () => {
        await sequelize.close()
    })

    describe('User Creation', () => {
        test('should create a user with hashed password', async () => {
            const user = await User.create({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'Staff'
            })

            expect(user.id).toBeDefined()
            expect(user.name).toBe('Test User')
            expect(user.email).toBe('test@example.com')
            expect(user.role).toBe('Staff')
            expect(user.password).not.toBe('password123')
            expect(user.password.length).toBeGreaterThan(20) // Hashed password
        })

        test('should set default role to Staff', async () => {
            const user = await User.create({
                name: 'Default Role User',
                email: 'default@example.com',
                password: 'password123'
            })

            expect(user.role).toBe('Staff')
        })

        test('should fail with invalid email format', async () => {
            await expect(
                User.create({
                    name: 'Invalid Email',
                    email: 'not-an-email',
                    password: 'password123'
                })
            ).rejects.toThrow()
        })

        test('should fail with duplicate email', async () => {
            await User.create({
                name: 'First User',
                email: 'duplicate@example.com',
                password: 'password123'
            })

            await expect(
                User.create({
                    name: 'Second User',
                    email: 'duplicate@example.com',
                    password: 'password123'
                })
            ).rejects.toThrow()
        })

        test('should fail with password less than 6 characters', async () => {
            await expect(
                User.create({
                    name: 'Short Password',
                    email: 'short@example.com',
                    password: '12345'
                })
            ).rejects.toThrow()
        })

        test('should fail without required name', async () => {
            await expect(
                User.create({
                    email: 'noname@example.com',
                    password: 'password123'
                })
            ).rejects.toThrow()
        })

        test('should fail without required email', async () => {
            await expect(
                User.create({
                    name: 'No Email',
                    password: 'password123'
                })
            ).rejects.toThrow()
        })

        test('should fail without required password', async () => {
            await expect(
                User.create({
                    name: 'No Password',
                    email: 'nopassword@example.com'
                })
            ).rejects.toThrow()
        })
    })

    describe('Password Hashing', () => {
        test('should hash password on create', async () => {
            const plainPassword = 'mySecretPassword'
            const user = await User.create({
                name: 'Hash Test',
                email: 'hash@example.com',
                password: plainPassword,
                role: 'Staff'
            })

            expect(user.password).not.toBe(plainPassword)
            const isValid = await bcrypt.compare(plainPassword, user.password)
            expect(isValid).toBe(true)
        })

        test('should hash password on update', async () => {
            const user = await User.create({
                name: 'Update Test',
                email: 'update@example.com',
                password: 'oldpassword',
                role: 'Staff'
            })

            const oldPassword = user.password
            user.password = 'newpassword'
            await user.save()

            expect(user.password).not.toBe('newpassword')
            expect(user.password).not.toBe(oldPassword)
            const isValid = await bcrypt.compare('newpassword', user.password)
            expect(isValid).toBe(true)
        })
    })

    describe('Password Comparison', () => {
        test('should compare password correctly', async () => {
            const user = await User.create({
                name: 'Compare Test',
                email: 'compare@example.com',
                password: 'testpassword',
                role: 'Staff'
            })

            const isCorrect = await user.comparePassword('testpassword')
            expect(isCorrect).toBe(true)

            const isWrong = await user.comparePassword('wrongpassword')
            expect(isWrong).toBe(false)
        })
    })

    describe('toJSON Method', () => {
        test('should not include password in JSON output', async () => {
            const user = await User.create({
                name: 'JSON Test',
                email: 'json@example.com',
                password: 'password123',
                role: 'Manager'
            })

            const json = user.toJSON()
            expect(json).not.toHaveProperty('password')
            expect(json).toHaveProperty('id')
            expect(json).toHaveProperty('name')
            expect(json).toHaveProperty('email')
            expect(json).toHaveProperty('role')
        })
    })

    describe('Role Validation', () => {
        test('should accept Administrator role', async () => {
            const user = await User.create({
                name: 'Admin',
                email: 'admin@example.com',
                password: 'password123',
                role: 'Administrator'
            })

            expect(user.role).toBe('Administrator')
        })

        test('should accept Manager role', async () => {
            const user = await User.create({
                name: 'Manager',
                email: 'manager@example.com',
                password: 'password123',
                role: 'Manager'
            })

            expect(user.role).toBe('Manager')
        })

        test('should accept Staff role', async () => {
            const user = await User.create({
                name: 'Staff',
                email: 'staff@example.com',
                password: 'password123',
                role: 'Staff'
            })

            expect(user.role).toBe('Staff')
        })
    })

    describe('Timestamps', () => {
        test('should have createdAt and updatedAt', async () => {
            const user = await User.create({
                name: 'Timestamp Test',
                email: 'timestamp@example.com',
                password: 'password123'
            })

            expect(user.createdAt).toBeInstanceOf(Date)
            expect(user.updatedAt).toBeInstanceOf(Date)
        })

        test('should update updatedAt on modification', async () => {
            const user = await User.create({
                name: 'Update Timestamp',
                email: 'updatetime@example.com',
                password: 'password123'
            })

            const originalUpdatedAt = user.updatedAt

            // Wait a bit
            await new Promise(resolve => setTimeout(resolve, 100))

            user.name = 'Modified Name'
            await user.save()

            expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime())
        })
    })
})
