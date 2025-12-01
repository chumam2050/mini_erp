import sequelize from '../config/database.js'
import User from '../models/User.js'

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...')

        // Connect to database
        await sequelize.authenticate()
        console.log('✅ Database connected')

        // Sync models (force: true will drop existing tables)
        await sequelize.sync({ force: true })
        console.log('✅ Database tables created')

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

        console.log(`✅ Created ${users.length} users`)

        console.log('\n🎉 Database seeding completed successfully!')
        console.log('\n📝 Login credentials:')
        console.log('Administrator: ahmad.wijaya@minierp.com / password123')
        console.log('Manager: siti.nurhaliza@minierp.com / password123')
        console.log('Staff: budi.santoso@minierp.com / password123')
        console.log('Staff: dewi.lestari@minierp.com / password123')

        process.exit(0)
    } catch (error) {
        console.error('❌ Seeding failed:', error)
        process.exit(1)
    }
}

seedDatabase()
