import Product from '../models/Product.js'
import { generateBarcodePDF, generateBatchBarcodePDF, generateBarcodeLabelsPDF } from '../utils/barcodeGenerator.js'
import { generateSimpleProductLabel, generateThermalLabels, generateLargeBarcodeForScanning } from '../utils/thermalLabelGenerator.js'

/**
 * Get all products
 */
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            order: [['createdAt', 'DESC']]
        })
        res.json(products)
    } catch (error) {
        console.error('Fetch products error:', error)
        res.status(500).json({
            error: 'Failed to fetch products',
            message: error.message
        })
    }
}

/**
 * Get product by ID
 */
export const getProductById = async (req, res) => {
    try {
        const productId = parseInt(req.params.id)
        const product = await Product.findByPk(productId)

        if (!product) {
            return res.status(404).json({
                error: 'Product not found',
                message: `Product with ID ${productId} does not exist`
            })
        }

        res.json(product)
    } catch (error) {
        console.error('Fetch product error:', error)
        res.status(500).json({
            error: 'Failed to fetch product',
            message: error.message
        })
    }
}

/**
 * Create new product
 */
export const createProduct = async (req, res) => {
    try {
        const { sku, name, description, category, price, stock, minStock } = req.body

        if (!sku || !name || !category || price === undefined) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'SKU, name, category, and price are required'
            })
        }

        const product = await Product.create({
            sku,
            name,
            description,
            category,
            price,
            stock: stock || 0,
            minStock: minStock || 10
        })

        res.status(201).json({
            message: 'Product created successfully',
            product: product.toJSON()
        })
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                error: 'Validation error',
                message: error.errors.map(e => e.message).join(', ')
            })
        }
        
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                error: 'Validation error',
                message: 'SKU already exists'
            })
        }

        res.status(500).json({
            error: 'Failed to create product',
            message: error.message
        })
    }
}

/**
 * Update product
 */
export const updateProduct = async (req, res) => {
    try {
        const productId = parseInt(req.params.id)
        const product = await Product.findByPk(productId)

        if (!product) {
            return res.status(404).json({
                error: 'Product not found',
                message: `Product with ID ${productId} does not exist`
            })
        }

        const { sku, name, description, category, price, stock, minStock } = req.body

        if (sku) product.sku = sku
        if (name) product.name = name
        if (description !== undefined) product.description = description
        if (category) product.category = category
        if (price !== undefined) product.price = price
        if (stock !== undefined) product.stock = stock
        if (minStock !== undefined) product.minStock = minStock

        await product.save()

        res.json({
            message: 'Product updated successfully',
            product: product.toJSON()
        })
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                error: 'Validation error',
                message: error.errors.map(e => e.message).join(', ')
            })
        }

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                error: 'Validation error',
                message: 'SKU already exists'
            })
        }

        res.status(500).json({
            error: 'Failed to update product',
            message: error.message
        })
    }
}

/**
 * Delete product
 */
export const deleteProduct = async (req, res) => {
    try {
        const productId = parseInt(req.params.id)
        const product = await Product.findByPk(productId)

        if (!product) {
            return res.status(404).json({
                error: 'Product not found',
                message: `Product with ID ${productId} does not exist`
            })
        }

        const deletedProduct = product.toJSON()
        await product.destroy()

        res.json({
            message: 'Product deleted successfully',
            product: deletedProduct
        })
    } catch (error) {
        res.status(500).json({
            error: 'Failed to delete product',
            message: error.message
        })
    }
}

/**
 * Generate barcode PDF for a single product
 */
export const generateProductBarcode = async (req, res) => {
    try {
        const productId = parseInt(req.params.id)
        const product = await Product.findByPk(productId)

        if (!product) {
            return res.status(404).json({
                error: 'Product not found',
                message: `Product with ID ${productId} does not exist`
            })
        }

        // Generate PDF
        const doc = await generateBarcodePDF(product)

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename=barcode_${product.sku}.pdf`)

        // Pipe PDF to response
        doc.pipe(res)
        doc.end()
    } catch (error) {
        console.error('Generate barcode error:', error)
        res.status(500).json({
            error: 'Failed to generate barcode',
            message: error.message
        })
    }
}

/**
 * Generate barcode PDF for multiple products
 */
export const generateBatchBarcodes = async (req, res) => {
    try {
        const { productIds } = req.body

        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'productIds array is required and must not be empty'
            })
        }

        // Fetch products
        const products = await Product.findAll({
            where: {
                id: productIds
            }
        })

        if (products.length === 0) {
            return res.status(404).json({
                error: 'Products not found',
                message: 'No products found with the provided IDs'
            })
        }

        // Generate PDF
        const doc = await generateBatchBarcodePDF(products)

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename=barcodes_batch.pdf`)

        // Pipe PDF to response
        doc.pipe(res)
        doc.end()
    } catch (error) {
        console.error('Generate batch barcodes error:', error)
        res.status(500).json({
            error: 'Failed to generate batch barcodes',
            message: error.message
        })
    }
}

/**
 * Generate barcode labels PDF for all products or filtered by category
 */
export const generateBarcodeLabels = async (req, res) => {
    try {
        const { category, limit } = req.query
        const labelsPerRow = parseInt(req.query.labelsPerRow) || 3
        const showBorder = req.query.showBorder === 'true'

        // Build query
        const whereClause = {}
        if (category) {
            whereClause.category = category
        }

        const queryOptions = {
            where: whereClause,
            order: [['name', 'ASC']]
        }

        if (limit) {
            queryOptions.limit = parseInt(limit)
        }

        // Fetch products
        const products = await Product.findAll(queryOptions)

        if (products.length === 0) {
            return res.status(404).json({
                error: 'Products not found',
                message: 'No products found'
            })
        }

        // Generate PDF
        const doc = await generateBarcodeLabelsPDF(products, {
            labelsPerRow,
            showBorder
        })

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename=barcode_labels.pdf`)

        // Pipe PDF to response
        doc.pipe(res)
        doc.end()
    } catch (error) {
        console.error('Generate barcode labels error:', error)
        res.status(500).json({
            error: 'Failed to generate barcode labels',
            message: error.message
        })
    }
}

/**
 * Generate thermal-style simple label for a product (optimized for scanning)
 */
export const generateSimpleLabel = async (req, res) => {
    try {
        const productId = parseInt(req.params.id)
        const product = await Product.findByPk(productId)

        if (!product) {
            return res.status(404).json({
                error: 'Product not found',
                message: `Product with ID ${productId} does not exist`
            })
        }

        // Generate simple label PDF
        const doc = await generateSimpleProductLabel(product)

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename=label_${product.sku}.pdf`)

        // Pipe PDF to response
        doc.pipe(res)
        doc.end()
    } catch (error) {
        console.error('Generate simple label error:', error)
        res.status(500).json({
            error: 'Failed to generate simple label',
            message: error.message
        })
    }
}

/**
 * Generate thermal-style labels for multiple products
 */
export const generateThermalBarcodeLabels = async (req, res) => {
    try {
        const { category, limit } = req.query
        const labelsPerRow = parseInt(req.query.labelsPerRow) || 3
        const showBorder = req.query.showBorder === 'true'

        // Build query
        const whereClause = {}
        if (category) {
            whereClause.category = category
        }

        const queryOptions = {
            where: whereClause,
            order: [['name', 'ASC']]
        }

        if (limit) {
            queryOptions.limit = parseInt(limit)
        }

        // Fetch products
        const products = await Product.findAll(queryOptions)

        if (products.length === 0) {
            return res.status(404).json({
                error: 'Products not found',
                message: 'No products found'
            })
        }

        // Generate thermal labels PDF
        const doc = await generateThermalLabels(products, {
            labelsPerRow,
            showBorder
        })

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename=thermal_labels.pdf`)

        // Pipe PDF to response
        doc.pipe(res)
        doc.end()
    } catch (error) {
        console.error('Generate thermal labels error:', error)
        res.status(500).json({
            error: 'Failed to generate thermal labels',
            message: error.message
        })
    }
}

/**
 * Generate large scannable barcode for a product
 */
export const generateLargeScanBarcode = async (req, res) => {
    try {
        const productId = parseInt(req.params.id)
        const product = await Product.findByPk(productId)

        if (!product) {
            return res.status(404).json({
                error: 'Product not found',
                message: `Product with ID ${productId} does not exist`
            })
        }

        // Generate large barcode PDF
        const doc = await generateLargeBarcodeForScanning(product)

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename=large_barcode_${product.sku}.pdf`)

        // Pipe PDF to response
        doc.pipe(res)
        doc.end()
    } catch (error) {
        console.error('Generate large barcode error:', error)
        res.status(500).json({
            error: 'Failed to generate large barcode',
            message: error.message
        })
    }
}

