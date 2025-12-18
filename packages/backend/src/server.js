import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import swaggerUi from 'swagger-ui-express'
import chalk from 'chalk'
import sequelize, { testConnection } from './config/database.js'
import swaggerSpec from './config/swagger.js'
import apiRoutes from './routes/api.js'
import authRoutes from './routes/auth.js'
// Import models to ensure they are registered
import './models/index.js'

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Request logging middleware
app.use((req, res, next) => {
    console.log(chalk.gray(`${new Date().toISOString()} - ${req.method} ${req.path}`))
    next()
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api', apiRoutes)

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'MiniERP API Documentation'
}))

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(swaggerSpec)
})

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'MiniERP Backend API',
        version: '1.0.0',
        status: 'running',
        documentation: {
            swagger: '/api-docs',
            json: '/api-docs.json'
        },
        endpoints: {
            health: '/api/health',
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                profile: 'GET /api/auth/me',
                updateProfile: 'PUT /api/auth/me',
                changePassword: 'PUT /api/auth/change-password'
            },
            users: '/api/users'
        }
    })
})

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.path} not found`
    })
})

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err)
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    })
})

// Start server
const startServer = async () => {
    try {
        // Test database connection
        await testConnection()
        
        // Sync database models
        await sequelize.sync({ alter: true })
        
        console.log(chalk.green('✅ Database models synchronized'))

        // Start Express server hanya jika bukan test environment
        if (process.env.NODE_ENV !== 'test') {
            app.listen(PORT, () => {
                console.log(chalk.cyan(`
╔════════════════════════════════════════╗
║   ${chalk.bold.yellow('MiniERP Backend Server Started')}      ║
╠════════════════════════════════════════╣
║   ${chalk.white('Port:')} ${chalk.green(PORT)}                           ║
║   ${chalk.white('Environment:')} ${chalk.blue(process.env.NODE_ENV || 'development')}            ║
║   ${chalk.white('Time:')} ${chalk.gray(new Date().toLocaleString())}   ║
╚════════════════════════════════════════╝
    `))
                console.log(chalk.blue(`🚀 Server is running on ${chalk.underline(`http://localhost:${PORT}`)}`))
                console.log(chalk.yellow(`📚 API Documentation: ${chalk.underline(`http://localhost:${PORT}/api-docs`)}`))
                console.log(chalk.yellow(`📄 Swagger JSON: ${chalk.underline(`http://localhost:${PORT}/api-docs.json`)}\n`))
            })
        }
    } catch (error) {
        console.error(chalk.red('❌ Failed to start server:'), error)
        if (process.env.NODE_ENV !== 'test') {
            process.exit(1)
        }
    }
}

// Start server jika bukan di-import sebagai module
if (process.env.NODE_ENV !== 'test') {
    startServer()
}

export default app
