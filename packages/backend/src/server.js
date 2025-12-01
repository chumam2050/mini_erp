import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import apiRoutes from './routes/api.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
    next()
})

// Routes
app.use('/api', apiRoutes)

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'MiniERP Backend API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/api/health',
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
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   MiniERP Backend Server Started      ║
╠════════════════════════════════════════╣
║   Port: ${PORT}                           ║
║   Environment: ${process.env.NODE_ENV || 'development'}            ║
║   Time: ${new Date().toLocaleString()}   ║
╚════════════════════════════════════════╝
  `)
    console.log(`🚀 Server is running on http://localhost:${PORT}`)
    console.log(`📚 API Documentation: http://localhost:${PORT}/api/health\n`)
})

export default app
