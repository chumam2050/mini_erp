import sequelize from '../config/database.js'
import chalk from 'chalk'
import User from '../models/User.js'
import Product from '../models/Product.js'

const seedDatabase = async () => {
    try {
        console.log(chalk.blue('🌱 Starting database seeding...'))

        // Connect to database
        await sequelize.authenticate()
        console.log(chalk.green('✅ Database connected'))

        // Sync models (force: true will drop existing tables)
        await sequelize.sync({ force: true })
        console.log(chalk.green('✅ Database tables created'))

        // Create users
        const users = await User.bulkCreate([
            {
                name: 'Ahmad Wijaya',
                email: 'ahmad.wijaya@minierp.com',
                password: 'password123',
                role: 'Administrator'
            },
            {
                name: 'Siti Nurhaliza',
                email: 'siti.nurhaliza@minierp.com',
                password: 'password123',
                role: 'Manager'
            },
            {
                name: 'Budi Santoso',
                email: 'budi.santoso@minierp.com',
                password: 'password123',
                role: 'Staff'
            },
            {
                name: 'Dewi Lestari',
                email: 'dewi.lestari@minierp.com',
                password: 'password123',
                role: 'Staff'
            }
        ], {
            individualHooks: true // This ensures password hashing hooks are called
        })

        console.log(chalk.green(`✅ Created ${users.length} users`))

        // Create products
        const products = await Product.bulkCreate([
            {
                sku: 'LPT-001',
                name: 'Laptop Dell XPS 13',
                description: 'High-performance ultrabook with 13-inch display',
                category: 'Electronics',
                price: 15000000,
                stock: 45,
                minStock: 10
            },
            {
                sku: 'PHN-002',
                name: 'iPhone 15 Pro',
                description: 'Latest iPhone with advanced camera system',
                category: 'Electronics',
                price: 18000000,
                stock: 12,
                minStock: 15
            },
            {
                sku: 'FRN-003',
                name: 'Office Chair Pro',
                description: 'Ergonomic office chair with lumbar support',
                category: 'Furniture',
                price: 2500000,
                stock: 88,
                minStock: 20
            },
            {
                sku: 'FRN-004',
                name: 'Standing Desk',
                description: 'Adjustable height standing desk',
                category: 'Furniture',
                price: 4500000,
                stock: 5,
                minStock: 10
            },
            {
                sku: 'ACC-005',
                name: 'Mechanical Keyboard',
                description: 'RGB mechanical gaming keyboard',
                category: 'Accessories',
                price: 1200000,
                stock: 0,
                minStock: 15
            },
            {
                sku: 'ACC-006',
                name: 'Wireless Mouse',
                description: 'Ergonomic wireless mouse',
                category: 'Accessories',
                price: 350000,
                stock: 156,
                minStock: 30
            }
        ])

        console.log(chalk.green(`✅ Created ${products.length} products`))

        console.log(chalk.green('\n🎉 Database seeding completed successfully!'))
        console.log(chalk.yellow('\n📝 Login credentials:'))
        console.log(chalk.cyan('Administrator: ahmad.wijaya@minierp.com / password123'))
        console.log(chalk.cyan('Manager: siti.nurhaliza@minierp.com / password123'))
        console.log(chalk.cyan('Staff: budi.santoso@minierp.com / password123'))
        console.log(chalk.cyan('Staff: dewi.lestari@minierp.com / password123'))

        process.exit(0)
    } catch (error) {
        console.error(chalk.red('❌ Seeding failed:'), error)
        process.exit(1)
    }
}

seedDatabase()
