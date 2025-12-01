import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const authenticateToken = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                error: 'Access denied',
                message: 'No token provided'
            })
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        // Get user from database
        const user = await User.findByPk(decoded.id)
        
        if (!user) {
            return res.status(401).json({
                error: 'Access denied',
                message: 'User not found'
            })
        }

        // Attach user to request
        req.user = user
        next()
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({
                error: 'Invalid token',
                message: 'Token is not valid'
            })
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({
                error: 'Token expired',
                message: 'Your session has expired. Please login again'
            })
        }
        return res.status(500).json({
            error: 'Authentication error',
            message: error.message
        })
    }
}

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Access denied',
                message: 'Not authenticated'
            })
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You do not have permission to perform this action'
            })
        }

        next()
    }
}
