import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

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

export default sequelize
