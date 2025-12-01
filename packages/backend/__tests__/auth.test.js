import { describe, test, expect, beforeAll, afterAll } from '@jest/globals'
import request from 'supertest'
import app from '../src/server.js'
import sequelize from '../src/config/database.js'
import User from '../src/models/User.js'

describe('Authentication API', () => {
    let authToken = ''
    let testUserId = null

    beforeAll(async () => {
        // Sync database untuk test
        await sequelize.sync({ force: true })
        
        // Create test user
        const testUser = await User.create({
            name: 'Test Admin',
            email: 'admin@test.com',
            password: 'password123',
            role: 'Administrator'
        })
        testUserId = testUser.id
    })

    afterAll(async () => {
        await sequelize.close()
    })

    describe('POST /api/auth/register', () => {
        test('should register a new user successfully', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'New User',
                    email: 'newuser@test.com',
                    password: 'password123',
                    role: 'Staff'
                })

            expect(response.status).toBe(201)
            expect(response.body).toHaveProperty('message', 'User registered successfully')
            expect(response.body).toHaveProperty('user')
            expect(response.body).toHaveProperty('token')
            expect(response.body.user).toHaveProperty('email', 'newuser@test.com')
            expect(response.body.user).not.toHaveProperty('password')
        })

        test('should fail with missing required fields', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Incomplete User'
                })

            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty('error')
        })

        test('should fail with duplicate email', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Duplicate User',
                    email: 'admin@test.com',
                    password: 'password123'
                })

            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty('error')
            expect(response.body.message).toContain('already')
        })

        test('should fail with invalid email format', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Invalid Email',
                    email: 'not-an-email',
                    password: 'password123'
                })

            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty('error')
        })

        test('should fail with password less than 6 characters', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Short Password',
                    email: 'short@test.com',
                    password: '12345'
                })

            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty('error')
        })
    })

    describe('POST /api/auth/login', () => {
        test('should login successfully with correct credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin@test.com',
                    password: 'password123'
                })

            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('message', 'Login successful')
            expect(response.body).toHaveProperty('user')
            expect(response.body).toHaveProperty('token')
            expect(response.body.user).not.toHaveProperty('password')

            // Save token untuk test selanjutnya
            authToken = response.body.token
        })

        test('should fail with incorrect password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin@test.com',
                    password: 'wrongpassword'
                })

            expect(response.status).toBe(401)
            expect(response.body).toHaveProperty('error')
            expect(response.body.message).toContain('Invalid')
        })

        test('should fail with non-existent email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@test.com',
                    password: 'password123'
                })

            expect(response.status).toBe(401)
            expect(response.body).toHaveProperty('error')
        })

        test('should fail with missing credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({})

            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty('error')
        })
    })

    describe('GET /api/auth/me', () => {
        test('should get current user profile with valid token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${authToken}`)

            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('user')
            expect(response.body.user).toHaveProperty('email', 'admin@test.com')
            expect(response.body.user).not.toHaveProperty('password')
        })

        test('should fail without token', async () => {
            const response = await request(app)
                .get('/api/auth/me')

            expect(response.status).toBe(401)
            expect(response.body).toHaveProperty('error')
        })

        test('should fail with invalid token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token')

            expect(response.status).toBe(403)
            expect(response.body).toHaveProperty('error')
        })
    })

    describe('PUT /api/auth/me', () => {
        test('should update user profile successfully', async () => {
            const response = await request(app)
                .put('/api/auth/me')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Updated Admin Name'
                })

            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('message')
            expect(response.body.user).toHaveProperty('name', 'Updated Admin Name')
        })

        test('should fail to update with duplicate email', async () => {
            // Create another user first
            await User.create({
                name: 'Another User',
                email: 'another@test.com',
                password: 'password123',
                role: 'Staff'
            })

            const response = await request(app)
                .put('/api/auth/me')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    email: 'another@test.com'
                })

            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty('error')
        })

        test('should fail without authentication', async () => {
            const response = await request(app)
                .put('/api/auth/me')
                .send({
                    name: 'Unauthorized Update'
                })

            expect(response.status).toBe(401)
        })
    })

    describe('PUT /api/auth/change-password', () => {
        test('should change password successfully', async () => {
            const response = await request(app)
                .put('/api/auth/change-password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    currentPassword: 'password123',
                    newPassword: 'newpassword123'
                })

            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('message')
            expect(response.body.message).toContain('changed')
        })

        test('should fail with incorrect current password', async () => {
            const response = await request(app)
                .put('/api/auth/change-password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    currentPassword: 'wrongpassword',
                    newPassword: 'newpassword123'
                })

            expect(response.status).toBe(401)
            expect(response.body).toHaveProperty('error')
        })

        test('should fail with missing fields', async () => {
            const response = await request(app)
                .put('/api/auth/change-password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    currentPassword: 'password123'
                })

            expect(response.status).toBe(400)
        })

        test('should fail with password less than 6 characters', async () => {
            const response = await request(app)
                .put('/api/auth/change-password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    currentPassword: 'newpassword123',
                    newPassword: '12345'
                })

            expect(response.status).toBe(400)
        })
    })
})
