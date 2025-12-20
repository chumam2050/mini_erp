import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

const { Op } = Sequelize

// Use SQLite for test only, PostgreSQL for development and production
const isTest = process.env.NODE_ENV === 'test'

const sequelize = isTest 
    ? new Sequelize({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false,
    })
    : new Sequelize(
        process.env.DB_NAME || 'minierp',
        process.env.DB_USER || 'user',
        process.env.DB_PASSWORD || 'password',
        {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            dialect: 'postgres',
            logging: console.log,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
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
