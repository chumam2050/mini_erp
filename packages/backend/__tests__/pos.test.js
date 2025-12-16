import request from 'supertest'
import app from '../src/server.js'
import { User, Product, Sale, SaleItem } from '../src/models/index.js'
import sequelize from '../src/config/database.js'
import jwt from 'jsonwebtoken'

describe('POS API', () => {
  let authToken
  let testUser
  let testProducts = []

  beforeAll(async () => {
    // Sync database
    await sequelize.sync({ force: true })

    // Create test user
    testUser = await User.create({
      name: 'Test Cashier',
      email: 'cashier@test.com',
      password: 'hashedpassword',
      role: 'Staff'
    })

    // Generate auth token
    authToken = jwt.sign(
      { id: testUser.id, email: testUser.email, role: testUser.role },
      process.env.JWT_SECRET || 'test-secret'
    )

    // Create test products
    const products = [
      {
        sku: 'TEST-001',
        name: 'Test Product 1',
        category: 'Electronics',
        price: 100000,
        stock: 50,
        minStock: 10,
        description: 'Test product 1'
      },
      {
        sku: 'TEST-002',
        name: 'Test Product 2',
        category: 'Electronics',
        price: 250000,
        stock: 30,
        minStock: 5,
        description: 'Test product 2'
      },
      {
        sku: 'TEST-003',
        name: 'Test Product 3',
        category: 'Furniture',
        price: 500000,
        stock: 0,
        minStock: 2,
        description: 'Test product 3 - out of stock'
      }
    ]

    for (const productData of products) {
      const product = await Product.create(productData)
      testProducts.push(product)
    }
  })

  afterAll(async () => {
    // Skip database close for now due to jest timeout issues
    // The --forceExit flag will handle cleanup
  })

  describe('GET /api/pos/products', () => {
    it('should get products for POS with authentication', async () => {
      const response = await request(app)
        .get('/api/pos/products')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.products).toBeDefined()
      expect(response.body.data.products.length).toBeGreaterThan(0)
      expect(response.body.data.products[0]).toHaveProperty('id')
      expect(response.body.data.products[0]).toHaveProperty('sku')
      expect(response.body.data.products[0]).toHaveProperty('name')
      expect(response.body.data.products[0]).toHaveProperty('price')
      expect(response.body.data.products[0]).toHaveProperty('stock')
    })

    it('should filter out products with zero stock', async () => {
      const response = await request(app)
        .get('/api/pos/products')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      const products = response.body.data.products
      const outOfStockProducts = products.filter(p => p.stock <= 0)
      expect(outOfStockProducts.length).toBe(0)
    })

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/pos/products')
        .expect(401)
    })

    it('should support search functionality', async () => {
      const response = await request(app)
        .get('/api/pos/products?search=Test Product 1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.products.length).toBe(1)
      expect(response.body.data.products[0].name).toBe('Test Product 1')
    })

    it('should support category filtering', async () => {
      const response = await request(app)
        .get('/api/pos/products?category=Electronics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      const products = response.body.data.products
      products.forEach(product => {
        expect(product.category).toBe('Electronics')
      })
    })

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/pos/products?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.products.length).toBe(1)
      expect(response.body.data.pagination).toBeDefined()
      expect(response.body.data.pagination.page).toBe(1)
      expect(response.body.data.pagination.limit).toBe(1)
    })
  })

  describe('POST /api/pos/sales', () => {
    const validSaleData = {
      customerName: 'John Doe',
      customerPhone: '081234567890',
      customerEmail: 'john@example.com',
      items: [
        {
          productId: null, // Will be set dynamically
          quantity: 2,
          unitPrice: 100000
        },
        {
          productId: null, // Will be set dynamically
          quantity: 1,
          unitPrice: 250000
        }
      ],
      discount: 10000,
      discountType: 'fixed',
      taxRate: 10,
      paymentMethod: 'cash',
      amountPaid: 500000,
      notes: 'Test sale'
    }

    beforeEach(() => {
      // Set product IDs dynamically
      validSaleData.items[0].productId = testProducts[0].id
      validSaleData.items[1].productId = testProducts[1].id
    })

    it('should create a sale successfully', async () => {
      const response = await request(app)
        .post('/api/pos/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validSaleData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Sale created successfully')
      expect(response.body.data).toHaveProperty('id')
      expect(response.body.data).toHaveProperty('saleNumber')
      expect(response.body.data.saleNumber).toMatch(/^SALE-\d{8}-\d{4}$/)
      expect(response.body.data.customerName).toBe('John Doe')
      expect(response.body.data.total).toBeDefined()
      expect(response.body.data.items).toBeDefined()
      expect(response.body.data.items.length).toBe(2)

      // Verify stock was updated
      const updatedProduct1 = await Product.findByPk(testProducts[0].id)
      const updatedProduct2 = await Product.findByPk(testProducts[1].id)
      expect(updatedProduct1.stock).toBe(testProducts[0].stock - 2)
      expect(updatedProduct2.stock).toBe(testProducts[1].stock - 1)
    })

    it('should generate unique sale numbers', async () => {
      const response1 = await request(app)
        .post('/api/pos/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validSaleData)
        .expect(201)

      const response2 = await request(app)
        .post('/api/pos/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validSaleData)
        .expect(201)

      expect(response1.body.data.saleNumber).not.toBe(response2.body.data.saleNumber)
    })

    it('should calculate totals correctly with discount and tax', async () => {
      const saleData = {
        ...validSaleData,
        discount: 20,
        discountType: 'percentage',
        taxRate: 10
      }

      const response = await request(app)
        .post('/api/pos/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send(saleData)
        .expect(201)

      const subtotal = (2 * 100000) + (1 * 250000) // 450000
      const discountAmount = subtotal * 0.2 // 90000
      const afterDiscount = subtotal - discountAmount // 360000
      const tax = afterDiscount * 0.1 // 36000
      const expectedTotal = afterDiscount + tax // 396000

      expect(response.body.data.subtotal).toBe('450000.00')
      expect(response.body.data.discount).toBe('90000.00')
      expect(response.body.data.tax).toBe('36000.00')
      expect(response.body.data.total).toBe('396000.00')
    })

    it('should return 401 without authentication', async () => {
      await request(app)
        .post('/api/pos/sales')
        .send(validSaleData)
        .expect(401)
    })

    it('should return 400 if amount paid is insufficient', async () => {
      const insufficientSaleData = {
        ...validSaleData,
        amountPaid: 100000 // Less than total
      }

      const response = await request(app)
        .post('/api/pos/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send(insufficientSaleData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('insufficient')
    })

    it('should return 400 if no items provided', async () => {
      const noItemsSaleData = {
        ...validSaleData,
        items: []
      }

      const response = await request(app)
        .post('/api/pos/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send(noItemsSaleData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('At least one item is required')
    })

    it('should return 400 if product not found', async () => {
      const invalidProductSaleData = {
        ...validSaleData,
        items: [{
          productId: 99999, // Non-existent product
          quantity: 1,
          unitPrice: 100000
        }]
      }

      const response = await request(app)
        .post('/api/pos/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidProductSaleData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Error creating sale')
      expect(response.body.error).toContain('Product with ID 99999 not found')
    }, 10000)

    it('should return 400 if insufficient stock', async () => {
      const insufficientStockSaleData = {
        ...validSaleData,
        items: [{
          productId: testProducts[0].id,
          quantity: 1000, // More than available stock
          unitPrice: 100000
        }]
      }

      const response = await request(app)
        .post('/api/pos/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send(insufficientStockSaleData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Insufficient stock')
    })

    it('should handle missing required fields', async () => {
      const invalidSaleData = {
        items: validSaleData.items
        // Missing amountPaid
      }

      const response = await request(app)
        .post('/api/pos/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidSaleData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Amount paid is required')
    })

    it('should handle invalid item data', async () => {
      const invalidItemSaleData = {
        ...validSaleData,
        items: [{
          productId: testProducts[0].id,
          // Missing quantity and unitPrice
        }]
      }

      const response = await request(app)
        .post('/api/pos/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidItemSaleData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Invalid item data')
    })
  })

  describe('GET /api/pos/sales', () => {
    let testSale

    beforeAll(async () => {
      // Create a test sale
      testSale = await Sale.create({
        saleNumber: 'SALE-20251211-0001',
        customerName: 'Test Customer',
        customerPhone: '081234567890',
        cashierId: testUser.id,
        subtotal: 100000,
        discount: 0,
        discountType: 'fixed',
        tax: 10000,
        taxRate: 10,
        total: 110000,
        amountPaid: 150000,
        change: 40000,
        paymentMethod: 'cash',
        status: 'completed'
      })

      await SaleItem.create({
        saleId: testSale.id,
        productId: testProducts[0].id,
        productName: testProducts[0].name,
        productSku: testProducts[0].sku,
        quantity: 1,
        unitPrice: 100000,
        discount: 0,
        discountType: 'fixed',
        subtotal: 100000
      })
    })

    it('should get all sales with authentication', async () => {
      const response = await request(app)
        .get('/api/pos/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.sales).toBeDefined()
      expect(Array.isArray(response.body.data.sales)).toBe(true)
      expect(response.body.data.pagination).toBeDefined()
    })

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/pos/sales')
        .expect(401)
    })

    it('should support search functionality', async () => {
      const response = await request(app)
        .get('/api/pos/sales?search=Test Customer')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      const sales = response.body.data.sales
      expect(sales.some(sale => sale.customerName.includes('Test Customer'))).toBe(true)
    })

    it('should support status filtering', async () => {
      const response = await request(app)
        .get('/api/pos/sales?status=completed')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      const sales = response.body.data.sales
      sales.forEach(sale => {
        expect(sale.status).toBe('completed')
      })
    })

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/pos/sales?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.pagination.page).toBe(1)
      expect(response.body.data.pagination.limit).toBe(5)
    })
  })

  describe('GET /api/pos/sales/:id', () => {
    let testSale

    beforeAll(async () => {
      testSale = await Sale.create({
        saleNumber: 'SALE-20251211-0002',
        customerName: 'Detail Test Customer',
        cashierId: testUser.id,
        subtotal: 200000,
        discount: 0,
        tax: 20000,
        taxRate: 10,
        total: 220000,
        amountPaid: 250000,
        change: 30000,
        paymentMethod: 'cash',
        status: 'completed'
      })
    })

    it('should get sale details with authentication', async () => {
      const response = await request(app)
        .get(`/api/pos/sales/${testSale.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('id', testSale.id)
      expect(response.body.data).toHaveProperty('saleNumber')
      expect(response.body.data).toHaveProperty('customerName', 'Detail Test Customer')
      expect(response.body.data).toHaveProperty('total', '220000.00')
    })

    it('should return 404 for non-existent sale', async () => {
      await request(app)
        .get('/api/pos/sales/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })

    it('should return 401 without authentication', async () => {
      await request(app)
        .get(`/api/pos/sales/${testSale.id}`)
        .expect(401)
    })
  })

  describe('GET /api/pos/sales/summary', () => {
    it('should get sales summary with authentication', async () => {
      const response = await request(app)
        .get('/api/pos/sales/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('summary')
      expect(response.body.data.summary).toHaveProperty('totalSales')
      expect(response.body.data.summary).toHaveProperty('totalRevenue')
      expect(response.body.data).toHaveProperty('paymentMethods')
      expect(typeof response.body.data.summary.totalSales).toBe('string')
      expect(typeof response.body.data.summary.totalRevenue).toBe('string')
    })

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/pos/sales/summary')
        .expect(401)
    })

    it('should support date range filtering', async () => {
      const startDate = '2025-12-01'
      const endDate = '2025-12-31'
      
      const response = await request(app)
        .get(`/api/pos/sales/summary?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('summary')
      expect(response.body.data.summary).toHaveProperty('totalSales')
      expect(response.body.data.summary).toHaveProperty('totalRevenue')
    })
  })
})