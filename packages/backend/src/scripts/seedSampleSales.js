#!/usr/bin/env node
import sequelize from '../config/database.js'
import { Product, Sale, SaleItem, User } from '../models/index.js'

const run = async () => {
  try {
    await sequelize.authenticate()
    console.log('Connected')

    // find admin user
    const admin = await User.findOne({ where: { role: 'Administrator' } })
    if (!admin) {
      console.log('No administrator user found. Please create a user first.')
      process.exit(1)
    }

    const products = await Product.findAll({ limit: 5 })
    if (products.length === 0) {
      console.log('No products found to create sample sales. Please seed products first.')
      process.exit(1)
    }

    // create 5 sample sales
    for (let i = 0; i < 5; i++) {
      const p = products[i % products.length]
      const quantity = Math.max(1, Math.floor(Math.random() * 5))
      const subtotal = parseFloat(p.price) * quantity

      const sale = await Sale.create({
        saleNumber: `SAMPLE-${Date.now()}-${i}`,
        cashierId: admin.id,
        subtotal,
        discount: 0,
        tax: 0,
        taxRate: 0,
        total: subtotal,
        amountPaid: subtotal,
        change: 0,
        paymentMethod: 'cash',
        status: 'completed'
      })

      await SaleItem.create({
        saleId: sale.id,
        productId: p.id,
        productName: p.name,
        productSku: p.sku,
        quantity,
        unitPrice: p.price,
        discount: 0,
        discountType: 'fixed',
        subtotal
      })

      // decrement stock
      p.stock = Math.max(0, (p.stock || 0) - quantity)
      await p.save()

      console.log(`Created sample sale ${sale.saleNumber} - ${p.name} x${quantity}`)
    }

    console.log('Sample sales seeded')
    process.exit(0)
  } catch (err) {
    console.error('Error seeding sample sales:', err)
    process.exit(1)
  }
}

run()