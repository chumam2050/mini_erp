import { describe, test, expect } from '@jest/globals'
import request from 'supertest'
import app from '../src/server.js'

describe('Health Check API', () => {
    describe('GET /api/health', () => {
        test('should return health status', async () => {
            const response = await request(app)
                .get('/api/health')

            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('status', 'OK')
            expect(response.body).toHaveProperty('message')
            expect(response.body).toHaveProperty('timestamp')
            expect(response.body).toHaveProperty('uptime')
            expect(response.body).toHaveProperty('environment')
        })

        test('should return valid timestamp', async () => {
            const response = await request(app)
                .get('/api/health')

            const timestamp = new Date(response.body.timestamp)
            expect(timestamp).toBeInstanceOf(Date)
            expect(timestamp.toString()).not.toBe('Invalid Date')
        })

        test('should return positive uptime', async () => {
            const response = await request(app)
                .get('/api/health')

            expect(typeof response.body.uptime).toBe('number')
            expect(response.body.uptime).toBeGreaterThan(0)
        })
    })

    describe('GET /', () => {
        test('should return API information', async () => {
            const response = await request(app)
                .get('/')

            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('message')
            expect(response.body).toHaveProperty('version')
            expect(response.body).toHaveProperty('status', 'running')
            expect(response.body).toHaveProperty('documentation')
            expect(response.body).toHaveProperty('endpoints')
        })

        test('should include Swagger documentation links', async () => {
            const response = await request(app)
                .get('/')

            expect(response.body.documentation).toHaveProperty('swagger', '/api-docs')
            expect(response.body.documentation).toHaveProperty('json', '/api-docs.json')
        })
    })

    describe('GET /api-docs.json', () => {
        test('should return Swagger JSON specification', async () => {
            const response = await request(app)
                .get('/api-docs.json')

            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('openapi')
            expect(response.body).toHaveProperty('info')
            expect(response.body).toHaveProperty('paths')
            expect(response.body).toHaveProperty('components')
        })

        test('should have correct OpenAPI version', async () => {
            const response = await request(app)
                .get('/api-docs.json')

            expect(response.body.openapi).toBe('3.0.0')
        })
    })

    describe('404 Handler', () => {
        test('should return 404 for non-existent route', async () => {
            const response = await request(app)
                .get('/api/nonexistent')

            expect(response.status).toBe(404)
            expect(response.body).toHaveProperty('error', 'Not Found')
            expect(response.body).toHaveProperty('message')
        })

        test('should handle POST to non-existent route', async () => {
            const response = await request(app)
                .post('/api/nonexistent')

            expect(response.status).toBe(404)
        })
    })
})
