import express from 'express'
import { authenticateToken, authorize } from '../middleware/auth.js'
import { healthCheck } from '../controllers/healthController.js'
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} from '../controllers/userController.js'
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    generateProductBarcode,
    generateBatchBarcodes,
    generateBarcodeLabels,
    generateSimpleLabel,
    generateThermalBarcodeLabels,
    generateLargeScanBarcode,
    importProductsCSV
} from '../controllers/productController.js' 
import {
    uploadProductMedia,
    setPrimaryImage,
    deleteProductMedia
} from '../controllers/mediaController.js'
import {
    getAllSettings,
    getSetting,
    upsertSetting,
    bulkUpsertSettings,
    deleteSetting
} from '../controllers/settingsController.js'
import { upload } from '../config/multer.js'
import posRoutes from './pos.js'

const router = express.Router()

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 */
router.get('/health', healthCheck)

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/users', authenticateToken, getAllUsers)

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.get('/users/:id', authenticateToken, getUserById)

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create new user (Administrator only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Administrator role required
 */
router.post('/users', authenticateToken, authorize('Administrator'), createUser)

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user (Administrator or Manager only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [Administrator, Manager, Staff]
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Administrator or Manager role required
 *       404:
 *         description: User not found
 */
router.put('/users/:id', authenticateToken, authorize('Administrator', 'Manager'), updateUser)

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user (Administrator only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Cannot delete own account
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Administrator role required
 *       404:
 *         description: User not found
 */
router.delete('/users/:id', authenticateToken, authorize('Administrator'), deleteUser)

// ==================== Product Routes ====================

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all products
 *       401:
 *         description: Unauthorized
 */
router.get('/products', authenticateToken, getAllProducts)

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
router.get('/products/:id', authenticateToken, getProductById)

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sku
 *               - name
 *               - category
 *               - price
 *             properties:
 *               sku:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               minStock:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation error
 */
router.post('/products', authenticateToken, authorize('Administrator', 'Manager'), createProduct)

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 */
router.put('/products/:id', authenticateToken, authorize('Administrator', 'Manager'), updateProduct)

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
router.delete('/products/:id', authenticateToken, authorize('Administrator', 'Manager'), deleteProduct)

// ==================== Product Media Routes ====================

/**
 * @swagger
 * /api/products/{id}/media:
 *   post:
 *     summary: Upload product images/videos
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *       404:
 *         description: Product not found
 */
router.post('/products/:id/media', authenticateToken, authorize('Administrator', 'Manager'), upload.array('files', 10), uploadProductMedia)

/**
 * @swagger
 * /api/products/import:
 *   post:
 *     summary: Import products via CSV (stock/price updates)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Import result
 */
router.post('/products/import', authenticateToken, authorize('Administrator', 'Manager'), upload.single('file'), importProductsCSV)

/**
 * @swagger
 * /api/products/{id}/barcode:
 *   get:
 *     summary: Generate barcode PDF for a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: PDF file with barcode
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Product not found
 */
router.get('/products/:id/barcode', authenticateToken, generateProductBarcode)

/**
 * @swagger
 * /api/products/barcodes/batch:
 *   post:
 *     summary: Generate barcodes PDF for multiple products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productIds
 *             properties:
 *               productIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: PDF file with multiple barcodes
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid request
 */
router.post('/products/barcodes/batch', authenticateToken, generateBatchBarcodes)

/**
 * @swagger
 * /api/products/barcodes/labels:
 *   get:
 *     summary: Generate barcode labels PDF for products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limit number of products
 *       - in: query
 *         name: labelsPerRow
 *         schema:
 *           type: integer
 *           default: 3
 *         description: Number of labels per row
 *       - in: query
 *         name: showBorder
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Show border around labels
 *     responses:
 *       200:
 *         description: PDF file with barcode labels
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: No products found
 */
router.get('/products/barcodes/labels', authenticateToken, generateBarcodeLabels)

/**
 * @swagger
 * /api/products/{id}/label:
 *   get:
 *     summary: Generate simple thermal-style label (optimized for scanning)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: PDF file with simple label (thermal printer style)
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Product not found
 */
router.get('/products/:id/label', authenticateToken, generateSimpleLabel)

/**
 * @swagger
 * /api/products/{id}/barcode/large:
 *   get:
 *     summary: Generate large scannable barcode
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: PDF file with large scannable barcode
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Product not found
 */
router.get('/products/:id/barcode/large', authenticateToken, generateLargeScanBarcode)

/**
 * @swagger
 * /api/products/barcodes/thermal:
 *   get:
 *     summary: Generate thermal-style barcode labels (compact, high-quality)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limit number of products
 *       - in: query
 *         name: labelsPerRow
 *         schema:
 *           type: integer
 *           default: 3
 *         description: Number of labels per row
 *       - in: query
 *         name: showBorder
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Show border around labels
 *     responses:
 *       200:
 *         description: PDF file with thermal-style barcode labels
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: No products found
 */
router.get('/products/barcodes/thermal', authenticateToken, generateThermalBarcodeLabels)

/**
 * @swagger
 * /api/products/{id}/primary-image:
 *   put:
 *     summary: Set primary image for product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Primary image updated successfully
 */
router.put('/products/:id/primary-image', authenticateToken, authorize('Administrator', 'Manager'), setPrimaryImage)

/**
 * @swagger
 * /api/products/{id}/media:
 *   delete:
 *     summary: Delete product media file
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: File deleted successfully
 */
router.delete('/products/:id/media', authenticateToken, authorize('Administrator', 'Manager'), deleteProductMedia)

// Settings Routes
/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get all settings
 *     tags: [Settings]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 */
router.get('/settings', getAllSettings)

/**
 * @swagger
 * /api/settings/{key}:
 *   get:
 *     summary: Get setting by key
 *     tags: [Settings]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Setting retrieved successfully
 *       404:
 *         description: Setting not found
 */
router.get('/settings/:key', getSetting)

/**
 * @swagger
 * /api/settings:
 *   post:
 *     summary: Create or update setting
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Setting saved successfully
 */
router.post('/settings', authenticateToken, authorize('Administrator'), upsertSetting)

/**
 * @swagger
 * /api/settings/bulk:
 *   post:
 *     summary: Update multiple settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings saved successfully
 */
router.post('/settings/bulk', authenticateToken, authorize('Administrator'), bulkUpsertSettings)

/**
 * @swagger
 * /api/settings/{key}:
 *   delete:
 *     summary: Delete setting
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Setting deleted successfully
 */
router.delete('/settings/:key', authenticateToken, authorize('Administrator'), deleteSetting)

// POS Routes
router.use('/pos', posRoutes)

export default router
