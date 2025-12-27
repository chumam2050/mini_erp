import Product from '../models/Product.js'
import path from 'path'
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

/**
 * Import products from CSV file (bulk stock/price updates)
 */
export const importProductsCSV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded', message: 'Please upload a CSV file' })
        }

        const fs = await import('fs')

        const ext = path.extname(req.file.originalname).toLowerCase()

        let records = []

        if (ext === '.csv') {
            const { parse } = await import('csv-parse/sync')
            const content = await fs.promises.readFile(req.file.path, 'utf8')
            records = parse(content, { columns: true, skip_empty_lines: true, trim: true })
        } else if (ext === '.xls' || ext === '.xlsx') {
            // Use xlsx to parse Excel files
            const xlsx = await import('xlsx')
            const buffer = await fs.promises.readFile(req.file.path)
            const workbook = xlsx.read(buffer, { type: 'buffer' })
            const sheetName = workbook.SheetNames[0]
            const sheet = workbook.Sheets[sheetName]
            records = xlsx.utils.sheet_to_json(sheet, { defval: '' })
        } else {
            return res.status(400).json({ error: 'Unsupported file type', message: 'Please upload CSV, XLS or XLSX file' })
        }

        const results = { processed: 0, created: 0, updated: 0, errors: [] }

        for (let i = 0; i < records.length; i++) {
            const row = records[i]
            const rowNum = i + 2 // account for header row

            const sku = (row['kode_barang_update'] || row['sku'] || '').toString().trim()
            const name = (row['nama_barang_update'] || row['name'] || '').toString().trim()
            const stokTambahan = row['stok_tambahan_update'] ?? row['stock_delta'] ?? ''
            const stokSekarang = row['stok_sekarang'] ?? row['stock_now'] ?? ''
            const minStock = row['minimum_stok'] ?? row['minStock'] ?? ''
            const harga = row['harga_beli_update'] ?? row['price'] ?? ''

            if (!sku) {
                results.errors.push({ row: rowNum, message: 'Missing sku (kode_barang_update)' })
                continue
            }

            const product = await Product.findOne({ where: { sku } })

            if (product) {
                // Update
                if (stokTambahan !== undefined && stokTambahan !== '') {
                    const delta = parseInt(String(stokTambahan).replace(/[^-0-9]/g, ''), 10)
                    if (Number.isNaN(delta)) {
                        results.errors.push({ row: rowNum, message: 'Invalid stok_tambahan_update' })
                        continue
                    }
                    product.stock = (product.stock || 0) + delta
                }

                if (minStock !== undefined && minStock !== '') {
                    const n = parseInt(String(minStock).replace(/[^0-9]/g, ''), 10)
                    if (Number.isNaN(n)) {
                        results.errors.push({ row: rowNum, message: 'Invalid minimum_stok' })
                        continue
                    }
                    product.minStock = n
                }

                if (harga !== undefined && harga !== '') {
                    const p = parseFloat(String(harga).replace(/[^0-9.\-]/g, ''))
                    if (Number.isNaN(p)) {
                        results.errors.push({ row: rowNum, message: 'Invalid harga_beli_update' })
                        continue
                    }
                    product.price = p
                }

                await product.save()
                results.updated++
            } else {
                // Create (best-effort)
                let stock = 0
                if (stokTambahan !== undefined && stokTambahan !== '') {
                    const s = parseInt(String(stokTambahan).replace(/[^-0-9]/g, ''), 10)
                    stock = Number.isNaN(s) ? 0 : s
                } else if (stokSekarang !== undefined && stokSekarang !== '') {
                    const s2 = parseInt(String(stokSekarang).replace(/[^0-9]/g, ''), 10)
                    stock = Number.isNaN(s2) ? 0 : s2
                }

                let min = 0
                if (minStock !== undefined && minStock !== '') {
                    const m = parseInt(String(minStock).replace(/[^0-9]/g, ''), 10)
                    min = Number.isNaN(m) ? 0 : m
                }

                let pr = 0
                if (harga !== undefined && harga !== '') {
                    const p2 = parseFloat(String(harga).replace(/[^0-9.\-]/g, ''))
                    pr = Number.isNaN(p2) ? 0 : p2
                }

                await Product.create({
                    sku,
                    name: name || sku,
                    category: 'Uncategorized',
                    price: pr,
                    stock,
                    minStock: min
                })

                results.created++
            }

            results.processed++
        }

        res.json(results)
    } catch (error) {
        console.error('Import CSV error:', error)
        res.status(500).json({ error: 'Failed to import CSV', message: error.message })
    } finally {
        // Cleanup uploaded file
        try {
            if (req.file && req.file.path) {
                const fs2 = await import('fs')
                fs2.unlink(req.file.path, () => {})
            }
        } catch (e) {
            // ignore
        }
    }
}

