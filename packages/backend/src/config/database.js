import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

const { Op } = Sequelize

const sequelize = new Sequelize(
    process.env.DB_NAME || 'minierp',
    process.env.DB_USER || 'user',
    process.env.DB_PASSWORD || 'password',
    {
        host: process.env.DB_HOST || 'db',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: process.env.NODE_ENV === 'test' ? 2 : 5,
            min: 0,
            acquire: process.env.NODE_ENV === 'test' ? 5000 : 30000, // 5 detik untuk test, 30 detik untuk production
            idle: process.env.NODE_ENV === 'test' ? 1000 : 10000   // 1 detik untuk test, 10 detik untuk production
        },
        dialectOptions: process.env.NODE_ENV === 'test' ? {
            // Optimasi untuk test environment
            statement_timeout: 5000, // 5 detik timeout untuk statements
            idle_in_transaction_session_timeout: 5000 // 5 detik timeout untuk idle transactions
        } : {}
    }
)

export const testConnection = async () => {
    try {
        await sequelize.authenticate()
        console.log('✅ Database connection established successfully')
        return true
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error.message)
        return false
    }
}

export { Op }
export default sequelize
