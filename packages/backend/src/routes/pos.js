import express from 'express'
import {
    getAllSales,
    getSaleById,
    createSale,
    cancelSale,
    getSalesSummary,
    getProductsForPOS,
    getTopProducts
} from '../controllers/posController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// All POS routes require authentication
router.use(authenticateToken)

/**
 * @swagger
 * /api/pos/products:
 *   get:
 *     summary: Get products for POS
 *     description: Retrieve products available for Point of Sale with stock filtering
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by product name or SKU
 *         example: "laptop"
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by product category
 *         example: "Electronics"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of products per page
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductsResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/POSErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/POSErrorResponse'
 */
router.get('/products', getProductsForPOS)

/**
 * @swagger
 * /api/pos/sales:
 *   get:
 *     summary: Get all sales
 *     description: Retrieve sales with pagination and filtering options
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of sales per page
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering (YYYY-MM-DD)
 *         example: "2025-12-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering (YYYY-MM-DD)
 *         example: "2025-12-11"
 *       - in: query
 *         name: cashier
 *         schema:
 *           type: integer
 *         description: Filter by cashier ID
 *         example: 1
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [completed, cancelled]
 *         description: Filter by sale status
 *         example: "completed"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by sale number, customer name, or phone
 *         example: "SL-20251211"
 *     responses:
 *       200:
 *         description: Sales retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SalesResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/POSErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/POSErrorResponse'
 */
router.get('/sales', getAllSales)

/**
 * @swagger
 * /api/pos/sales/summary:
 *   get:
 *     summary: Get sales summary/statistics
 *     description: Retrieve sales statistics for a specific period
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month]
 *           default: today
 *         description: Time period for summary
 *         example: "today"
 *     responses:
 *       200:
 *         description: Sales summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SalesSummaryResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/POSErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/POSErrorResponse'
 */
router.get('/sales/summary', getSalesSummary)

/**
 * @swagger
 * /api/pos/sales/top-products:
 *   get:
 *     summary: Get top selling products
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month]
 *           default: month
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: Top products retrieved successfully
 */
router.get('/sales/top-products', getTopProducts)

/**
 * @swagger
 * /api/pos/sales/{id}:
 *   get:
 *     summary: Get sale by ID
 *     description: Retrieve detailed information about a specific sale
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sale ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Sale retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Sale'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/POSErrorResponse'
 *       404:
 *         description: Sale not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/POSErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/POSErrorResponse'
 */
router.get('/sales/:id', getSaleById)

/**
 * @swagger
 * /api/pos/sales:
 *   post:
 *     summary: Create new sale
 *     description: Process a new sale transaction with items, discounts, and payment
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SaleInput'
 *           example:
 *             customerName: "John Doe"
 *             customerPhone: "+6281234567890"
 *             customerEmail: "john.doe@example.com"
 *             items:
 *               - productId: 1
 *                 quantity: 2
 *                 unitPrice: 15000000
 *                 discount: 500000
 *                 discountType: "fixed"
 *               - productId: 2
 *                 quantity: 1
 *                 unitPrice: 5000000
 *             discount: 1000000
 *             discountType: "fixed"
 *             taxRate: 10
 *             paymentMethod: "cash"
 *             amountPaid: 32000000
 *             notes: "Customer requested gift wrapping"
 *     responses:
 *       201:
 *         description: Sale created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/POSSuccessResponse'
 *       400:
 *         description: Bad request - Invalid data or insufficient stock/payment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/POSErrorResponse'
 *             examples:
 *               insufficientPayment:
 *                 summary: Insufficient payment amount
 *                 value:
 *                   success: false
 *                   message: "Amount paid (30000000) is insufficient. Total amount: 31900000"
 *               productNotFound:
 *                 summary: Product not found
 *                 value:
 *                   success: false
 *                   message: "Error creating sale"
 *                   error: "Product with ID 999 not found"
 *               insufficientStock:
 *                 summary: Insufficient stock
 *                 value:
 *                   success: false
 *                   message: "Error creating sale"
 *                   error: "Insufficient stock for product Laptop Gaming. Available: 5, Requested: 10"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/POSErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/POSErrorResponse'
 */
router.post('/sales', createSale)

/**
 * @swagger
 * /api/pos/sales/{id}/cancel:
 *   put:
 *     summary: Cancel sale
 *     description: Cancel a sale and restore product stock
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sale ID to cancel
 *         example: 1
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for cancellation
 *                 example: "Customer changed their mind"
 *     responses:
 *       200:
 *         description: Sale cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Sale cancelled successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Sale'
 *       400:
 *         description: Bad request - Sale already cancelled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/POSErrorResponse'
 *             example:
 *               success: false
 *               message: "Sale is already cancelled"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/POSErrorResponse'
 *       404:
 *         description: Sale not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/POSErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/POSErrorResponse'
 */
router.put('/sales/:id/cancel', cancelSale)

export default router