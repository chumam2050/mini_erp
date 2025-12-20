import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import request from 'supertest'
import app from '../src/server.js'
import sequelize from '../src/config/database.js'
import User from '../src/models/User.js'
import Settings from '../src/models/Settings.js'
import AuthToken from '../src/models/AuthToken.js'

describe('Settings API', () => {
    let authToken = ''
    let adminUser = null

    beforeAll(async () => {
        // Sync database untuk test
        await sequelize.sync({ force: true })
        
        // Create admin user untuk authenticated tests
        adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@test.com',
            password: 'password123',
            role: 'Administrator'
        })

        // Login to get token
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@test.com',
                password: 'password123'
            })

        authToken = loginResponse.body.token
    })

    afterAll(async () => {
        await sequelize.close()
    })

    beforeEach(async () => {
        // Clear settings before each test
        await Settings.destroy({ where: {} })
    })

    describe('GET /api/settings', () => {
        test('should get all settings', async () => {
            // Create test settings
            await Settings.create({
                key: 'app.name',
                value: 'MiniERP',
                type: 'string',
                category: 'general',
                description: 'Application name'
            })
            await Settings.create({
                key: 'app.version',
                value: '1.0.0',
                type: 'string',
                category: 'general',
                description: 'Application version'
            })

            const response = await request(app)
                .get('/api/settings')

            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty(['app.name'])
            expect(response.body).toHaveProperty(['app.version'])
            expect(response.body['app.name'].value).toBe('MiniERP')
            expect(response.body['app.version'].value).toBe('1.0.0')
        })

        test('should filter settings by category', async () => {
            // Create test settings with different categories
            await Settings.create({
                key: 'general.setting',
                value: 'value1',
                type: 'string',
                category: 'general'
            })
            await Settings.create({
                key: 'feature.setting',
                value: 'value2',
                type: 'string',
                category: 'feature'
            })

            const response = await request(app)
                .get('/api/settings?category=general')

            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty(['general.setting'])
            expect(response.body).not.toHaveProperty(['feature.setting'])
        })

        test('should return empty object when no settings exist', async () => {
            const response = await request(app)
                .get('/api/settings')

            expect(response.status).toBe(200)
            expect(response.body).toEqual({})
        })

        test('should return typed values correctly', async () => {
            // Create settings with different types
            await Settings.create({
                key: 'test.string',
                value: 'hello',
                type: 'string'
            })
            await Settings.create({
                key: 'test.number',
                value: '42',
                type: 'number'
            })
            await Settings.create({
                key: 'test.boolean',
                value: 'true',
                type: 'boolean'
            })
            await Settings.create({
                key: 'test.json',
                value: JSON.stringify({ foo: 'bar' }),
                type: 'json'
            })

            const response = await request(app)
                .get('/api/settings')

            expect(response.status).toBe(200)
            expect(response.body['test.string'].value).toBe('hello')
            expect(response.body['test.number'].value).toBe(42)
            expect(response.body['test.boolean'].value).toBe(true)
            expect(response.body['test.json'].value).toEqual({ foo: 'bar' })
        })
    })

    describe('GET /api/settings/:key', () => {
        test('should get a specific setting by key', async () => {
            await Settings.create({
                key: 'app.name',
                value: 'MiniERP',
                type: 'string',
                category: 'general',
                description: 'Application name'
            })

            const response = await request(app)
                .get('/api/settings/app.name')

            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('key', 'app.name')
            expect(response.body).toHaveProperty('value', 'MiniERP')
            expect(response.body).toHaveProperty('type', 'string')
            expect(response.body).toHaveProperty('category', 'general')
            expect(response.body).toHaveProperty('description', 'Application name')
        })

        test('should return 404 when setting not found', async () => {
            const response = await request(app)
                .get('/api/settings/nonexistent.key')

            expect(response.status).toBe(404)
            expect(response.body).toHaveProperty('message', 'Setting not found')
        })

        test('should return typed value for number', async () => {
            await Settings.create({
                key: 'max.items',
                value: '100',
                type: 'number'
            })

            const response = await request(app)
                .get('/api/settings/max.items')

            expect(response.status).toBe(200)
            expect(response.body.value).toBe(100)
            expect(typeof response.body.value).toBe('number')
        })

        test('should return typed value for boolean', async () => {
            await Settings.create({
                key: 'feature.enabled',
                value: 'true',
                type: 'boolean'
            })

            const response = await request(app)
                .get('/api/settings/feature.enabled')

            expect(response.status).toBe(200)
            expect(response.body.value).toBe(true)
            expect(typeof response.body.value).toBe('boolean')
        })

        test('should return typed value for json', async () => {
            const jsonData = { items: [1, 2, 3], enabled: true }
            await Settings.create({
                key: 'config.data',
                value: JSON.stringify(jsonData),
                type: 'json'
            })

            const response = await request(app)
                .get('/api/settings/config.data')

            expect(response.status).toBe(200)
            expect(response.body.value).toEqual(jsonData)
        })
    })

    describe('POST /api/settings', () => {
        test('should create a new setting', async () => {
            const response = await request(app)
                .post('/api/settings')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    key: 'new.setting',
                    value: 'test value',
                    type: 'string',
                    description: 'Test setting',
                    category: 'test'
                })

            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('key', 'new.setting')
            expect(response.body).toHaveProperty('value', 'test value')
            expect(response.body).toHaveProperty('type', 'string')
            expect(response.body).toHaveProperty('description', 'Test setting')
            expect(response.body).toHaveProperty('category', 'test')

            // Verify setting was created in database
            const setting = await Settings.findOne({ where: { key: 'new.setting' } })
            expect(setting).not.toBeNull()
            expect(setting.value).toBe('test value')
        })

        test('should update an existing setting', async () => {
            // Create initial setting
            await Settings.create({
                key: 'update.test',
                value: 'old value',
                type: 'string',
                category: 'test'
            })

            const response = await request(app)
                .post('/api/settings')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    key: 'update.test',
                    value: 'new value',
                    type: 'string',
                    description: 'Updated description',
                    category: 'test'
                })

            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('value', 'new value')
            expect(response.body).toHaveProperty('description', 'Updated description')

            // Verify setting was updated in database
            const setting = await Settings.findOne({ where: { key: 'update.test' } })
            expect(setting.value).toBe('new value')
        })

        test('should fail without key', async () => {
            const response = await request(app)
                .post('/api/settings')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    value: 'test value'
                })

            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty('message', 'Key and value are required')
        })

        test('should fail without value', async () => {
            const response = await request(app)
                .post('/api/settings')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    key: 'test.key'
                })

            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty('message', 'Key and value are required')
        })

        test('should create setting with number type', async () => {
            const response = await request(app)
                .post('/api/settings')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    key: 'number.test',
                    value: '123',
                    type: 'number'
                })

            expect(response.status).toBe(200)
            expect(response.body.value).toBe(123)
            expect(response.body.type).toBe('number')
        })

        test('should create setting with boolean type', async () => {
            const response = await request(app)
                .post('/api/settings')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    key: 'boolean.test',
                    value: 'true',
                    type: 'boolean'
                })

            expect(response.status).toBe(200)
            expect(response.body.value).toBe(true)
            expect(response.body.type).toBe('boolean')
        })

        test('should create setting with json type', async () => {
            const jsonData = { foo: 'bar', items: [1, 2, 3] }
            const response = await request(app)
                .post('/api/settings')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    key: 'json.test',
                    value: JSON.stringify(jsonData),
                    type: 'json'
                })

            expect(response.status).toBe(200)
            expect(response.body.value).toEqual(jsonData)
            expect(response.body.type).toBe('json')
        })
    })

    describe('POST /api/settings/bulk', () => {
        test('should update multiple settings at once', async () => {
            const response = await request(app)
                .post('/api/settings/bulk')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    'app.name': {
                        value: 'MiniERP',
                        type: 'string',
                        category: 'general',
                        description: 'App name'
                    },
                    'app.version': {
                        value: '1.0.0',
                        type: 'string',
                        category: 'general',
                        description: 'App version'
                    },
                    'max.items': {
                        value: '50',
                        type: 'number',
                        category: 'config',
                        description: 'Max items'
                    }
                })

            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('message', 'Settings saved successfully')
            expect(response.body).toHaveProperty('settings')
            expect(response.body.settings).toHaveLength(3)

            // Verify settings were created in database
            const appName = await Settings.findOne({ where: { key: 'app.name' } })
            const appVersion = await Settings.findOne({ where: { key: 'app.version' } })
            const maxItems = await Settings.findOne({ where: { key: 'max.items' } })

            expect(appName.value).toBe('MiniERP')
            expect(appVersion.value).toBe('1.0.0')
            expect(maxItems.value).toBe('50')
            expect(maxItems.type).toBe('number')
        })

        test('should update existing settings in bulk', async () => {
            // Create initial settings
            await Settings.create({
                key: 'setting1',
                value: 'old1',
                type: 'string'
            })
            await Settings.create({
                key: 'setting2',
                value: 'old2',
                type: 'string'
            })

            const response = await request(app)
                .post('/api/settings/bulk')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    'setting1': {
                        value: 'new1',
                        type: 'string'
                    },
                    'setting2': {
                        value: 'new2',
                        type: 'string'
                    }
                })

            expect(response.status).toBe(200)

            // Verify updates
            const setting1 = await Settings.findOne({ where: { key: 'setting1' } })
            const setting2 = await Settings.findOne({ where: { key: 'setting2' } })

            expect(setting1.value).toBe('new1')
            expect(setting2.value).toBe('new2')
        })

        test('should handle mixed types in bulk update', async () => {
            const response = await request(app)
                .post('/api/settings/bulk')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    'string.setting': {
                        value: 'text',
                        type: 'string'
                    },
                    'number.setting': {
                        value: '42',
                        type: 'number'
                    },
                    'boolean.setting': {
                        value: 'true',
                        type: 'boolean'
                    },
                    'json.setting': {
                        value: JSON.stringify({ key: 'value' }),
                        type: 'json'
                    }
                })

            expect(response.status).toBe(200)
            expect(response.body.settings).toHaveLength(4)

            // Verify typed values
            const settings = response.body.settings
            const stringSet = settings.find(s => s.key === 'string.setting')
            const numberSet = settings.find(s => s.key === 'number.setting')
            const booleanSet = settings.find(s => s.key === 'boolean.setting')
            const jsonSet = settings.find(s => s.key === 'json.setting')

            expect(stringSet.value).toBe('text')
            expect(numberSet.value).toBe(42)
            expect(booleanSet.value).toBe(true)
            expect(jsonSet.value).toEqual({ key: 'value' })
        })

        test('should return empty array when no settings provided', async () => {
            const response = await request(app)
                .post('/api/settings/bulk')
                .set('Authorization', `Bearer ${authToken}`)
                .send({})

            expect(response.status).toBe(200)
            expect(response.body.settings).toHaveLength(0)
        })
    })

    describe('DELETE /api/settings/:key', () => {
        test('should delete a setting', async () => {
            // Create a setting
            await Settings.create({
                key: 'delete.test',
                value: 'to be deleted',
                type: 'string'
            })

            const response = await request(app)
                .delete('/api/settings/delete.test')
                .set('Authorization', `Bearer ${authToken}`)

            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('message', 'Setting deleted successfully')

            // Verify setting was deleted
            const setting = await Settings.findOne({ where: { key: 'delete.test' } })
            expect(setting).toBeNull()
        })

        test('should return 404 when deleting non-existent setting', async () => {
            const response = await request(app)
                .delete('/api/settings/nonexistent.key')
                .set('Authorization', `Bearer ${authToken}`)

            expect(response.status).toBe(404)
            expect(response.body).toHaveProperty('message', 'Setting not found')
        })

        test('should not affect other settings when deleting one', async () => {
            // Create multiple settings
            await Settings.create({
                key: 'keep.this',
                value: 'keep',
                type: 'string'
            })
            await Settings.create({
                key: 'delete.this',
                value: 'delete',
                type: 'string'
            })

            await request(app)
                .delete('/api/settings/delete.this')
                .set('Authorization', `Bearer ${authToken}`)

            // Verify only the correct one was deleted
            const kept = await Settings.findOne({ where: { key: 'keep.this' } })
            const deleted = await Settings.findOne({ where: { key: 'delete.this' } })

            expect(kept).not.toBeNull()
            expect(deleted).toBeNull()
        })
    })

    describe('Authorization', () => {
        test('POST /api/settings should require authentication', async () => {
            const response = await request(app)
                .post('/api/settings')
                .send({
                    key: 'test.key',
                    value: 'test value'
                })

            expect(response.status).toBe(401)
        })

        test('POST /api/settings/bulk should require authentication', async () => {
            const response = await request(app)
                .post('/api/settings/bulk')
                .send({
                    'test.key': {
                        value: 'test value',
                        type: 'string'
                    }
                })

            expect(response.status).toBe(401)
        })

        test('DELETE /api/settings/:key should require authentication', async () => {
            const response = await request(app)
                .delete('/api/settings/test.key')

            expect(response.status).toBe(401)
        })
    })
})
