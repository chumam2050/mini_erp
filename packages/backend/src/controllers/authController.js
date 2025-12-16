import jwt from 'jsonwebtoken'
import { Op } from 'sequelize'
import User from '../models/User.js'
import AuthToken from '../models/AuthToken.js'

/**
 * Generate JWT token
 */
const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )
}

/**
 * Get token expiration date
 */
const getTokenExpirationDate = () => {
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d'
    const days = parseInt(expiresIn.replace('d', ''))
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + days)
    return expirationDate
}

/**
 * Register new user
 */
export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Name, email, and password are required'
            })
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } })
        if (existingUser) {
            return res.status(400).json({
                error: 'Registration failed',
                message: 'Email already registered'
            })
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'Staff'
        })

        // Generate token
        const token = generateToken(user)

        res.status(201).json({
            message: 'User registered successfully',
            user: user.toJSON(),
            token
        })
    } catch (error) {
        console.error('Registration error:', error)
        
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                error: 'Validation error',
                message: error.errors.map(e => e.message).join(', ')
            })
        }
        
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Email already exists'
            })
        }

        res.status(500).json({
            error: 'Registration failed',
            message: error.message
        })
    }
}

/**
 * Login user
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Email and password are required'
            })
        }

        // Find user
        const user = await User.findOne({ where: { email } })
        if (!user) {
            return res.status(401).json({
                error: 'Login failed',
                message: 'Invalid email or password'
            })
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password)
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Login failed',
                message: 'Invalid email or password'
            })
        }

        // Generate token
        const token = generateToken(user)

        // Save token to database
        await AuthToken.create({
            userId: user.id,
            token: token,
            expiresAt: getTokenExpirationDate(),
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip || req.connection.remoteAddress
        })

        res.json({
            message: 'Login successful',
            user: user.toJSON(),
            token
        })
    } catch (error) {
        console.error('Login error:', error)
        res.status(500).json({
            error: 'Login failed',
            message: error.message
        })
    }
}

/**
 * Get current user profile
 */
export const getProfile = async (req, res) => {
    try {
        res.json({
            user: req.user.toJSON()
        })
    } catch (error) {
        console.error('Profile error:', error)
        res.status(500).json({
            error: 'Failed to get profile',
            message: error.message
        })
    }
}

/**
 * Update current user profile
 */
export const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body
        const user = req.user

        if (name) user.name = name
        if (email) {
            // Check if email is already taken by another user
            const existingUser = await User.findOne({ 
                where: { 
                    email,
                    id: { [Op.ne]: user.id }
                } 
            })
            if (existingUser) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: 'Email already in use'
                })
            }
            user.email = email
        }

        await user.save()

        res.json({
            message: 'Profile updated successfully',
            user: user.toJSON()
        })
    } catch (error) {
        console.error('Update profile error:', error)
        
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                error: 'Validation error',
                message: error.errors.map(e => e.message).join(', ')
            })
        }

        res.status(500).json({
            error: 'Failed to update profile',
            message: error.message
        })
    }
}

/**
 * Change password
 */
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Current password and new password are required'
            })
        }

        const user = req.user

        // Verify current password
        const isPasswordValid = await user.comparePassword(currentPassword)
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Change password failed',
                message: 'Current password is incorrect'
            })
        }

        // Update password
        user.password = newPassword
        await user.save()

        res.json({
            message: 'Password changed successfully'
        })
    } catch (error) {
        console.error('Change password error:', error)
        
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                error: 'Validation error',
                message: error.errors.map(e => e.message).join(', ')
            })
        }

        res.status(500).json({
            error: 'Failed to change password',
            message: error.message
        })
    }
}

/**
 * Logout user
 */
export const logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]
        
        if (token) {
            // Delete token from database
            await AuthToken.destroy({
                where: { token }
            })
        }
        
        res.json({
            message: 'Logout successful'
        })
    } catch (error) {
        console.error('Logout error:', error)
        res.status(500).json({
            error: 'Logout failed',
            message: error.message
        })
    }
}
