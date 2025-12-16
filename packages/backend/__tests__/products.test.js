import request from 'supertest'
import app from '../src/server.js'
import sequelize from '../src/config/database.js'
import User from '../src/models/User.js'
import Product from '../src/models/Product.js'

describe('Products API', () => {
    let adminToken

    beforeAll(async () => {
        // Sync database dengan options yang lebih cepat untuk test
        await sequelize.sync({ 
            force: true,
            logging: false // Disable logging untuk lebih cepat
        })

        // Create test admin user
        await User.create({
            name: 'Test Admin',
            email: 'admin@test.com',
            password: 'password123',
            role: 'Administrator'
        })

        // Login as admin to get token
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@test.com',
                password: 'password123'
            })
        
        adminToken = response.body.token
    }, 15000)

    afterAll(async () => {
        await sequelize.close()
    })

    describe('GET /api/products', () => {
        it('should get all products', async () => {
            const response = await request(app)
                .get('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)

            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
        })

        it('should fail without authentication', async () => {
            const response = await request(app)
                .get('/api/products')

            expect(response.status).toBe(401)
        })
    })

    describe('GET /api/products/:id', () => {
        it('should get product by id', async () => {
            // First create a product
            const createRes = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    sku: 'TEST-GET-' + Date.now(),
                    name: 'Test Product Get',
                    category: 'Electronics',
                    price: 100000,
                    stock: 10,
                    minStock: 5
                })

            const productId = createRes.body.product.id

            const response = await request(app)
                .get(`/api/products/${productId}`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(response.status).toBe(200)
            expect(response.body.id).toBe(productId)
        })

        it('should return 404 for non-existent product', async () => {
            const response = await request(app)
                .get('/api/products/99999')
                .set('Authorization', `Bearer ${adminToken}`)

            expect(response.status).toBe(404)
        })
    })

    describe('POST /api/products', () => {
        it('should create a new product', async () => {
            const response = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    sku: 'TEST-CREATE-' + Date.now(),
                    name: 'Test Product Create',
                    description: 'Test description',
                    category: 'Electronics',
                    price: 150000,
                    stock: 20,
                    minStock: 5
                })

            expect(response.status).toBe(201)
            expect(response.body.product).toHaveProperty('id')
            expect(response.body.product.name).toBe('Test Product Create')
        })

        it('should fail with missing required fields', async () => {
            const response = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Incomplete Product'
                })

            expect(response.status).toBe(400)
        })

        it('should fail with duplicate SKU', async () => {
            const sku = 'DUPLICATE-SKU-' + Date.now()

            // Create first product
            await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    sku,
                    name: 'First Product',
                    category: 'Test',
                    price: 100000,
                    stock: 10
                })

            // Try to create duplicate
            const response = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    sku,
                    name: 'Duplicate Product',
                    category: 'Test',
                    price: 100000,
                    stock: 10
                })

            expect(response.status).toBe(400)
        })
    })

    describe('PUT /api/products/:id', () => {
        it('should update a product', async () => {
            // Create product first
            const createRes = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    sku: 'TEST-UPDATE-' + Date.now(),
                    name: 'Original Name',
                    category: 'Electronics',
                    price: 100000,
                    stock: 10
                })

            const productId = createRes.body.product.id

            const response = await request(app)
                .put(`/api/products/${productId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Updated Name',
                    price: 200000
                })

            expect(response.status).toBe(200)
            expect(response.body.product.name).toBe('Updated Name')
            expect(parseFloat(response.body.product.price)).toBe(200000)
        })

        it('should return 404 for non-existent product', async () => {
            const response = await request(app)
                .put('/api/products/99999')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'Updated' })

            expect(response.status).toBe(404)
        })
    })

    describe('DELETE /api/products/:id', () => {
        it('should delete a product', async () => {
            // Create product first
            const createRes = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    sku: 'TEST-DELETE-' + Date.now(),
                    name: 'Product to Delete',
                    category: 'Test',
                    price: 50000,
                    stock: 5
                })

            const productId = createRes.body.product.id

            const response = await request(app)
                .delete(`/api/products/${productId}`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('message')

            // Verify deletion
            const getRes = await request(app)
                .get(`/api/products/${productId}`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(getRes.status).toBe(404)
        })

        it('should return 404 for non-existent product', async () => {
            const response = await request(app)
                .delete('/api/products/99999')
                .set('Authorization', `Bearer ${adminToken}`)

            expect(response.status).toBe(404)
        })
    })
})
