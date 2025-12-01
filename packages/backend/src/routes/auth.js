import express from 'express'
import jwt from 'jsonwebtoken'
import { Op } from 'sequelize'
import User from '../models/User.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Generate JWT token
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
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register user baru
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       201:
 *         description: User berhasil didaftarkan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Register new user
router.post('/register', async (req, res) => {
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
})

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login berhasil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Login user
router.post('/login', async (req, res) => {
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
})

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
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
})

/**
 * @swagger
 * /api/auth/me:
 *   put:
 *     summary: Update current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ahmad Wijaya Updated
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ahmad.new@minierp.com
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
// Update current user profile
router.put('/me', authenticateToken, async (req, res) => {
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
})

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Change current user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: password123
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Current password incorrect
 */
// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
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
})

export default router
