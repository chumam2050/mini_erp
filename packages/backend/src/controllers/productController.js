import Product from '../models/Product.js'

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
