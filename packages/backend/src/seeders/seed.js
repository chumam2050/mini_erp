import sequelize from '../config/database.js'
import chalk from 'chalk'
import User from '../models/User.js'
import Product from '../models/Product.js'
import { seedDefaultSettings } from './seedSettings.js'

const seedDatabase = async () => {
    try {
        console.log(chalk.blue('🌱 Starting database seeding...'))

        // Connect to database
        await sequelize.authenticate()
        
        console.log(chalk.green('✅ Database connected'))

        await seedDefaultSettings()

        console.log(chalk.green('🌱 Seeding completed successfully!'))

        process.exit(0)
    } catch (error) {
        console.error(chalk.red('❌ Seeding failed:'), error)
        process.exit(1)
    }
}

seedDatabase()
