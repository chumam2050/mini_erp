import Sale from '../models/Sale.js'
import SaleItem from '../models/SaleItem.js'
import Product from '../models/Product.js'
import User from '../models/User.js'
import sequelize, { Op } from '../config/database.js'
import { generateSaleNumber } from '../utils/saleUtils.js'

// Get all sales with pagination and filters
export const getAllSales = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const offset = (page - 1) * limit
        const { startDate, endDate, cashier, status, search } = req.query

        let whereClause = {}
        
        // Date range filter
        if (startDate && endDate) {
            whereClause.saleDate = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            }
        }
        
        // Cashier filter
        if (cashier) {
            whereClause.cashierId = cashier
        }
        
        // Status filter
        if (status) {
            whereClause.status = status
        }
        
        // Search filter
        if (search) {
            whereClause[Op.or] = [
                { saleNumber: { [Op.iLike]: `%${search}%` } },
                { customerName: { [Op.iLike]: `%${search}%` } },
                { customerPhone: { [Op.iLike]: `%${search}%` } }
            ]
        }

        const { count, rows: sales } = await Sale.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'cashier',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: SaleItem,
                    as: 'items',
                    include: [
                        {
                            model: Product,
                            attributes: ['id', 'name', 'sku']
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        })

        res.json({
            success: true,
            data: {
                sales,
                pagination: {
                    page,
                    limit,
                    total: count,
                    pages: Math.ceil(count / limit)
                }
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching sales',
            error: error.message
        })
    }
}

// Get sale by ID
export const getSaleById = async (req, res) => {
    console.log('[posController] getSaleById called with id:', req.params.id)
    try {
        const { id } = req.params

        const sale = await Sale.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'cashier',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: User,
                    as: 'customer',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: SaleItem,
                    as: 'items',
                    include: [
                        {
                            model: Product,
                            attributes: ['id', 'name', 'sku', 'price']
                        }
                    ]
                }
            ]
        })

        if (!sale) {
            return res.status(404).json({
                success: false,
                message: 'Sale not found'
            })
        }

        res.json({
            success: true,
            data: sale
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching sale',
            error: error.message
        })
    }
}

// Create new sale
export const createSale = async (req, res) => {
    const transaction = await sequelize.transaction()
    
    try {
        const {
            customerId,
            customerName,
            customerPhone,
            customerEmail,
            items,
            discount = 0,
            discountType = 'fixed',
            taxRate = 0,
            paymentMethod = 'cash',
            amountPaid,
            notes
        } = req.body

        const cashierId = req.user.id

        // Validate required fields
        if (!amountPaid || amountPaid <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount paid is required and must be greater than 0'
            })
        }

        // Validate items
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one item is required'
            })
        }

        // Calculate totals
        let subtotal = 0
        const validatedItems = []

        for (const item of items) {
            // Validate item structure
            // Allow items that reference an existing product (productId) OR generic items with a name (e.g., plastic bags)
            if (!item.quantity || !item.unitPrice || (!item.productId && !item.productName && !item.name)) {
                throw new Error('Invalid item data: productId or productName (name), quantity, and unitPrice are required')
            }

            let product = null
            let productName = item.productName || item.name || null
            let productSku = item.productSku || null

            if (item.productId) {
                product = await Product.findByPk(item.productId, { transaction })
                if (!product) {
                    throw new Error(`Product with ID ${item.productId} not found`)
                }

                if (product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`)
                }

                productName = product.name
                productSku = product.sku
            }

            const itemDiscount = item.discount || 0
            const itemDiscountType = item.discountType || 'fixed'
            let itemSubtotal = item.quantity * parseFloat(item.unitPrice)
            
            // Apply item-level discount
            if (itemDiscount > 0) {
                if (itemDiscountType === 'percentage') {
                    itemSubtotal = itemSubtotal * (1 - itemDiscount / 100)
                } else {
                    itemSubtotal = itemSubtotal - itemDiscount
                }
            }
            
            itemSubtotal = Math.max(0, itemSubtotal)
            subtotal += itemSubtotal

            validatedItems.push({
                productId: item.productId || null,
                productName: productName,
                productSku: productSku,
                quantity: parseInt(item.quantity),
                unitPrice: parseFloat(item.unitPrice),
                discount: parseFloat(itemDiscount),
                discountType: itemDiscountType,
                subtotal: itemSubtotal
            })
        }

        // Apply sale-level discount
        let discountAmount = 0
        if (discount && discount > 0) {
            if (discountType === 'percentage') {
                discountAmount = subtotal * (parseFloat(discount) / 100)
            } else {
                discountAmount = parseFloat(discount)
            }
        }

        const afterDiscount = Math.max(0, subtotal - discountAmount)
        const tax = afterDiscount * (parseFloat(taxRate) / 100)
        const total = afterDiscount + tax
        const change = parseFloat(amountPaid) - total

        if (change < 0) {
            return res.status(400).json({
                success: false,
                message: `Amount paid (${amountPaid}) is insufficient. Total amount: ${total.toFixed(2)}`
            })
        }

        // Generate sale number
        const saleNumber = generateSaleNumber()

        // Create sale
        const sale = await Sale.create({
            saleNumber,
            customerId: customerId || null,
            customerName: customerName || null,
            customerPhone: customerPhone || null,
            customerEmail: customerEmail || null,
            cashierId,
            subtotal: parseFloat(subtotal.toFixed(2)),
            discount: parseFloat(discountAmount.toFixed(2)),
            discountType: discountType || 'fixed',
            tax: parseFloat(tax.toFixed(2)),
            taxRate: parseFloat(taxRate),
            total: parseFloat(total.toFixed(2)),
            amountPaid: parseFloat(amountPaid),
            change: parseFloat(change.toFixed(2)),
            paymentMethod,
            notes: notes || null,
            status: 'completed'
        }, { transaction })

        // Create sale items and update stock
        for (const item of validatedItems) {
            await SaleItem.create({
                saleId: sale.id,
                ...item
            }, { transaction })

            // Update product stock only for items tied to a real product
            if (item.productId) {
                await Product.decrement('stock', {
                    by: item.quantity,
                    where: { id: item.productId },
                    transaction
                })
            }
        }

        await transaction.commit()

        // Fetch the complete sale with associations
        const completeSale = await Sale.findByPk(sale.id, {
            include: [
                {
                    model: User,
                    as: 'cashier',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: SaleItem,
                    as: 'items',
                    include: [
                        {
                            model: Product,
                            attributes: ['id', 'name', 'sku']
                        }
                    ]
                }
            ]
        })

        res.status(201).json({
            success: true,
            message: 'Sale created successfully',
            data: completeSale
        })
    } catch (error) {
        await transaction.rollback()
        res.status(400).json({
            success: false,
            message: 'Error creating sale',
            error: error.message
        })
    }
}

// Cancel sale
export const cancelSale = async (req, res) => {
    const transaction = await sequelize.transaction()
    
    try {
        const { id } = req.params
        const { reason } = req.body

        const sale = await Sale.findByPk(id, {
            include: [{ model: SaleItem, as: 'items' }]
        }, { transaction })

        if (!sale) {
            return res.status(404).json({
                success: false,
                message: 'Sale not found'
            })
        }

        if (sale.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Sale is already cancelled'
            })
        }

        // Restore product stock
        for (const item of sale.items) {
            await Product.increment('stock', {
                by: item.quantity,
                where: { id: item.productId },
                transaction
            })
        }

        // Update sale status
        await sale.update({
            status: 'cancelled',
            notes: reason ? `${sale.notes ? sale.notes + '\n' : ''}Cancelled: ${reason}` : sale.notes
        }, { transaction })

        await transaction.commit()

        res.json({
            success: true,
            message: 'Sale cancelled successfully',
            data: sale
        })
    } catch (error) {
        await transaction.rollback()
        res.status(400).json({
            success: false,
            message: 'Error cancelling sale',
            error: error.message
        })
    }
}

// Get sales summary/statistics
export const getSalesSummary = async (req, res) => {
    try {
        const { period = 'today' } = req.query
        
        let dateFilter = {}
        const now = new Date()
        
        switch (period) {
            case 'today':
                const startOfDay = new Date(now)
                startOfDay.setHours(0, 0, 0, 0)
                const endOfDay = new Date(now)
                endOfDay.setHours(23, 59, 59, 999)
                dateFilter = {
                    saleDate: {
                        [Op.between]: [startOfDay, endOfDay]
                    }
                }
                break
            case 'week':
                const startOfWeek = new Date(now)
                startOfWeek.setDate(now.getDate() - now.getDay())
                startOfWeek.setHours(0, 0, 0, 0)
                dateFilter = {
                    saleDate: {
                        [Op.gte]: startOfWeek
                    }
                }
                break
            case 'month':
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
                dateFilter = {
                    saleDate: {
                        [Op.gte]: startOfMonth
                    }
                }
                break
            case 'all':
                // no date filter - include all time
                dateFilter = {}
                break
        }

        const summary = await Sale.findAll({
            where: {
                ...dateFilter,
                status: 'completed'
            },
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalSales'],
                [sequelize.fn('SUM', sequelize.col('total')), 'totalRevenue'],
                [sequelize.fn('SUM', sequelize.col('subtotal')), 'totalSubtotal'],
                [sequelize.fn('SUM', sequelize.col('tax')), 'totalTax'],
                [sequelize.fn('AVG', sequelize.col('total')), 'averageSale']
            ],
            raw: true
        })

        const paymentMethodsRaw = await Sale.findAll({
            where: {
                ...dateFilter,
                status: 'completed'
            },
            attributes: [
                'paymentMethod',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                [sequelize.fn('SUM', sequelize.col('total')), 'total']
            ],
            group: ['paymentMethod'],
            raw: true
        })

        const paymentMethods = paymentMethodsRaw.map(pm => ({
            paymentMethod: pm.paymentMethod,
            count: Number(pm.count) || 0,
            total: Number(pm.total) || 0
        }))

        const s = summary[0] || {}
        const sanitized = {
            totalSales: Number(s.totalSales) || 0,
            totalRevenue: Number(s.totalRevenue) || 0,
            totalSubtotal: Number(s.totalSubtotal) || 0,
            totalTax: Number(s.totalTax) || 0,
            averageSale: Number(s.averageSale) || 0
        }

        res.json({
            success: true,
            data: {
                period,
                summary: sanitized,
                paymentMethods
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching sales summary',
            error: error.message
        })
    }
}

// Get revenue/time series for a period
export const getSalesRevenue = async (req, res) => {
    console.log('[posController] getSalesRevenue called with query:', req.query)
    try {
        const { period = 'today' } = req.query
        const now = new Date()
        let dateFilter = {}

        switch (period) {
            case 'today':
                const startOfDay = new Date(now)
                startOfDay.setHours(0, 0, 0, 0)
                const endOfDay = new Date(now)
                endOfDay.setHours(23, 59, 59, 999)
                dateFilter = {
                    saleDate: {
                        [Op.between]: [startOfDay, endOfDay]
                    }
                }
                break
            case 'week':
                const startOfWeek = new Date(now)
                startOfWeek.setDate(now.getDate() - now.getDay())
                startOfWeek.setHours(0, 0, 0, 0)
                dateFilter = {
                    saleDate: {
                        [Op.gte]: startOfWeek
                    }
                }
                break
            case 'month':
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
                dateFilter = {
                    saleDate: {
                        [Op.gte]: startOfMonth
                    }
                }
                break
            case 'all':
                dateFilter = {}
                break
        }

        const rows = await Sale.findAll({
            where: {
                ...dateFilter,
                status: 'completed'
            },
            attributes: [
                [sequelize.fn('DATE', sequelize.col('saleDate')), 'date'],
                [sequelize.fn('SUM', sequelize.col('total')), 'total']
            ],
            group: [sequelize.fn('DATE', sequelize.col('saleDate'))],
            order: [[sequelize.fn('DATE', sequelize.col('saleDate')), 'ASC']],
            raw: true
        })

        const revenue = rows.map(r => ({
            date: r.date,
            total: Number(r.total) || 0
        }))

        res.json({ success: true, data: { period, revenue } })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching revenue', error: error.message })
    }
}

// Get top selling products in a period
export const getTopProducts = async (req, res) => {
    try {
        const { period = 'month', limit = 5 } = req.query
        const now = new Date()
        let dateFilter = {}

        switch (period) {
            case 'today':
                const startOfDay = new Date(now)
                startOfDay.setHours(0, 0, 0, 0)
                const endOfDay = new Date(now)
                endOfDay.setHours(23, 59, 59, 999)
                dateFilter = {
                    saleDate: {
                        [Op.between]: [startOfDay, endOfDay]
                    }
                }
                break
            case 'week':
                const startOfWeek = new Date(now)
                startOfWeek.setDate(now.getDate() - now.getDay())
                startOfWeek.setHours(0, 0, 0, 0)
                dateFilter = {
                    saleDate: {
                        [Op.gte]: startOfWeek
                    }
                }
                break
            case 'month':
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
                dateFilter = {
                    saleDate: {
                        [Op.gte]: startOfMonth
                    }
                }
                break
            case 'all':
                dateFilter = {}
                break
        }

        // Use raw SQL aggregation to avoid ORM grouping issues
        const replacements = { limit: parseInt(limit, 10) }
        let dateSql = ''
        if (period === 'today') {
            const startOfDay = new Date(now)
            startOfDay.setHours(0, 0, 0, 0)
            const endOfDay = new Date(now)
            endOfDay.setHours(23, 59, 59, 999)
            replacements.start = startOfDay.toISOString()
            replacements.end = endOfDay.toISOString()
            dateSql = `AND s."saleDate" BETWEEN :start AND :end`
        } else if (period === 'week') {
            const startOfWeek = new Date(now)
            startOfWeek.setDate(now.getDate() - now.getDay())
            startOfWeek.setHours(0, 0, 0, 0)
            replacements.start = startOfWeek.toISOString()
            dateSql = `AND s."saleDate" >= :start`
        } else if (period === 'month') {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
            replacements.start = startOfMonth.toISOString()
            dateSql = `AND s."saleDate" >= :start`
        } // 'all' -> no date filter

        const sql = `SELECT si."productId", p.name, p.sku, SUM(si.quantity) as "totalSold"
            FROM sale_items si
            JOIN sales s ON s.id = si."saleId"
            JOIN products p ON p.id = si."productId"
            WHERE s.status = 'completed' ${dateSql}
            GROUP BY si."productId", p.name, p.sku
            ORDER BY "totalSold" DESC
            LIMIT :limit`

        const [rows] = await sequelize.query(sql, { replacements })

        const top = rows.map(r => ({
            productId: r.productId,
            name: r.name,
            sku: r.sku,
            totalSold: Number(r.totalSold)
        }))

        res.json({ success: true, data: { period, top } })
    } catch (error) {
        console.error('Error fetching top products:', error)
        res.status(500).json({ success: false, message: 'Error fetching top products', error: error.message })
    }
}

// Get products for POS (with stock info)
export const getProductsForPOS = async (req, res) => {
    try {
        const { search, category, page = 1, limit = 20 } = req.query
        const offset = (page - 1) * limit

        let whereClause = {
            stock: {
                [Op.gt]: 0
            }
        }

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { sku: { [Op.iLike]: `%${search}%` } }
            ]
        }

        if (category) {
            whereClause.category = category
        }

        const { count, rows: products } = await Product.findAndCountAll({
            where: whereClause,
            attributes: ['id', 'sku', 'name', 'category', 'price', 'stock', 'primaryImage'],
            order: [['name', 'ASC']],
            limit: parseInt(limit),
            offset
        })

        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: count,
                    pages: Math.ceil(count / limit)
                }
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        })
    }
}