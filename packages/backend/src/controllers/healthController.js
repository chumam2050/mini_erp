/**
 * Health check endpoint
 */
export const healthCheck = (req, res) => {
    res.json({
        status: 'OK',
        message: 'Backend is running smoothly',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    })
}
