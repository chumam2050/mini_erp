import sequelize from '../config/database.js'
import User from '../models/User.js'
import Product from '../models/Product.js'
import { seedDefaultSettings } from './seedSettings.js' 

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...')

        // Connect to database
        await sequelize.authenticate()
        
        console.log('✅ Database connected')

        await seedDefaultSettings()

        console.log('🌱 Seeding completed successfully!')

        process.exit(0)
    } catch (error) {
        console.error('❌ Seeding failed:', error)
        process.exit(1)
    }
}

seedDatabase()
