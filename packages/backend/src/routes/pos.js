import express from 'express'
import {
    getAllSales,
    getSaleById,
    createSale,
    cancelSale,
    getSalesSummary,
    getProductsForPOS
} from '../controllers/posController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// All POS routes require authentication
router.use(authenticateToken)

// Sales routes
router.get('/sales', getAllSales)
router.get('/sales/summary', getSalesSummary)
router.get('/sales/:id', getSaleById)
router.post('/sales', createSale)
router.put('/sales/:id/cancel', cancelSale)

// Products for POS
router.get('/products', getProductsForPOS)

export default router