import { describe, test, expect, beforeAll, afterAll } from '@jest/globals'
import request from 'supertest'
import app from '../src/server.js'
import sequelize from '../src/config/database.js'
import User from '../src/models/User.js'

describe('Users API', () => {
    let adminToken = ''
    let managerToken = ''
    let staffToken = ''
    let testUserId = null

    beforeAll(async () => {
        // Sync database
        await sequelize.sync({ force: true })

        // Create test users dengan berbagai roles
        const admin = await User.create({
            name: 'Test Admin',
            email: 'admin@test.com',
            password: 'password123',
            role: 'Administrator'
        })

        const manager = await User.create({
            name: 'Test Manager',
            email: 'manager@test.com',
            password: 'password123',
            role: 'Manager'
        })

        const staff = await User.create({
            name: 'Test Staff',
            email: 'staff@test.com',
            password: 'password123',
            role: 'Staff'
        })

        testUserId = staff.id

        // Login untuk mendapatkan tokens
        const adminLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@test.com', password: 'password123' })
        adminToken = adminLogin.body.token

        const managerLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'manager@test.com', password: 'password123' })
        managerToken = managerLogin.body.token

        const staffLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'staff@test.com', password: 'password123' })
        staffToken = staffLogin.body.token
    })

    afterAll(async () => {
        await sequelize.close()
    })

    describe('GET /api/users', () => {
        test('should get all users with admin token', async () => {
            const response = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${adminToken}`)

            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
            expect(response.body.length).toBeGreaterThan(0)
            expect(response.body[0]).not.toHaveProperty('password')
        })

        test('should get all users with manager token', async () => {
            const response = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${managerToken}`)

            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
        })

        test('should get all users with staff token', async () => {
            const response = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${staffToken}`)

            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
        })

        test('should fail without authentication', async () => {
            const response = await request(app)
                .get('/api/users')

            expect(response.status).toBe(401)
            expect(response.body).toHaveProperty('error')
        })
    })

    describe('GET /api/users/:id', () => {
        test('should get user by id with valid token', async () => {
            const response = await request(app)
                .get(`/api/users/${testUserId}`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('id', testUserId)
            expect(response.body).toHaveProperty('email')
            expect(response.body).not.toHaveProperty('password')
        })

        test('should return 404 for non-existent user', async () => {
            const response = await request(app)
                .get('/api/users/99999')
                .set('Authorization', `Bearer ${adminToken}`)

            expect(response.status).toBe(404)
            expect(response.body).toHaveProperty('error')
        })

        test('should fail without authentication', async () => {
            const response = await request(app)
                .get(`/api/users/${testUserId}`)

            expect(response.status).toBe(401)
        })
    })

    describe('POST /api/users', () => {
        test('should create user as Administrator', async () => {
            const response = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'New Employee',
                    email: 'employee@test.com',
                    password: 'password123',
                    role: 'Staff'
                })

            expect(response.status).toBe(201)
            expect(response.body).toHaveProperty('message')
            expect(response.body).toHaveProperty('user')
            expect(response.body.user).toHaveProperty('email', 'employee@test.com')
        })

        test('should fail to create user as Manager', async () => {
            const response = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${managerToken}`)
                .send({
                    name: 'Another User',
                    email: 'another@test.com',
                    password: 'password123',
                    role: 'Staff'
                })

            expect(response.status).toBe(403)
            expect(response.body).toHaveProperty('error')
        })

        test('should fail to create user as Staff', async () => {
            const response = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${staffToken}`)
                .send({
                    name: 'Unauthorized User',
                    email: 'unauthorized@test.com',
                    password: 'password123',
                    role: 'Staff'
                })

            expect(response.status).toBe(403)
        })

        test('should fail with missing required fields', async () => {
            const response = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Incomplete User'
                })

            expect(response.status).toBe(400)
        })

        test('should fail with duplicate email', async () => {
            const response = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Duplicate User',
                    email: 'admin@test.com',
                    password: 'password123',
                    role: 'Staff'
                })

            expect(response.status).toBe(400)
        })
    })

    describe('PUT /api/users/:id', () => {
        test('should update user as Administrator', async () => {
            const response = await request(app)
                .put(`/api/users/${testUserId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Updated Staff Name'
                })

            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('message')
            expect(response.body.user).toHaveProperty('name', 'Updated Staff Name')
        })

        test('should update user as Manager', async () => {
            const response = await request(app)
                .put(`/api/users/${testUserId}`)
                .set('Authorization', `Bearer ${managerToken}`)
                .send({
                    name: 'Manager Updated Name'
                })

            expect(response.status).toBe(200)
        })

        test('should fail to update user as Staff', async () => {
            const response = await request(app)
                .put(`/api/users/${testUserId}`)
                .set('Authorization', `Bearer ${staffToken}`)
                .send({
                    name: 'Staff Attempted Update'
                })

            expect(response.status).toBe(403)
        })

        test('should return 404 for non-existent user', async () => {
            const response = await request(app)
                .put('/api/users/99999')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Non-existent User'
                })

            expect(response.status).toBe(404)
        })
    })

    describe('DELETE /api/users/:id', () => {
        test('should delete user as Administrator', async () => {
            // Create user to delete
            const userToDelete = await User.create({
                name: 'To Delete',
                email: 'todelete@test.com',
                password: 'password123',
                role: 'Staff'
            })

            const response = await request(app)
                .delete(`/api/users/${userToDelete.id}`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('message')
            expect(response.body.message).toContain('deleted')
        })

        test('should fail to delete user as Manager', async () => {
            const response = await request(app)
                .delete(`/api/users/${testUserId}`)
                .set('Authorization', `Bearer ${managerToken}`)

            expect(response.status).toBe(403)
        })

        test('should fail to delete user as Staff', async () => {
            const response = await request(app)
                .delete(`/api/users/${testUserId}`)
                .set('Authorization', `Bearer ${staffToken}`)

            expect(response.status).toBe(403)
        })

        test('should fail to delete own account', async () => {
            // Get admin user ID
            const admin = await User.findOne({ where: { email: 'admin@test.com' } })

            const response = await request(app)
                .delete(`/api/users/${admin.id}`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(response.status).toBe(400)
            expect(response.body.message).toContain('cannot delete your own account')
        })

        test('should return 404 for non-existent user', async () => {
            const response = await request(app)
                .delete('/api/users/99999')
                .set('Authorization', `Bearer ${adminToken}`)

            expect(response.status).toBe(404)
        })
    })
})
