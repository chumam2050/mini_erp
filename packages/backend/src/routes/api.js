import express from 'express'
import User from '../models/User.js'
import { authenticateToken, authorize } from '../middleware/auth.js'

const router = express.Router()

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 */
// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Backend is running smoothly',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    })
})

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
// Get all users - requires authentication
router.get('/users', authenticateToken, async (req, res) => {
    try {
        const users = await User.findAll({
            order: [['id', 'ASC']]
        })
        res.json(users)
    } catch (error) {
        console.error('Fetch users error:', error)
        res.status(500).json({
            error: 'Failed to fetch users',
            message: error.message
        })
    }
})

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
// Get user by ID - requires authentication
router.get('/users/:id', authenticateToken, async (req, res) => {
    try {
        const userId = parseInt(req.params.id)
        const user = await User.findByPk(userId)

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: `User with ID ${userId} does not exist`
            })
        }

        res.json(user)
    } catch (error) {
        console.error('Fetch user error:', error)
        res.status(500).json({
            error: 'Failed to fetch user',
            message: error.message
        })
    }
})

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create new user (Administrator only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Administrator role required
 */
// Create new user - requires Administrator role
router.post('/users', authenticateToken, authorize('Administrator'), async (req, res) => {
    try {
        const { name, email, password, role } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Name, email, and password are required'
            })
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'Staff'
        })

        res.status(201).json({
            message: 'User created successfully',
            user: user.toJSON()
        })
    } catch (error) {
        console.error('Create user error:', error)
        
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
            error: 'Failed to create user',
            message: error.message
        })
    }
})

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user (Administrator or Manager only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [Administrator, Manager, Staff]
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Administrator or Manager role required
 *       404:
 *         description: User not found
 */
// Update user - requires Administrator or Manager role
router.put('/users/:id', authenticateToken, authorize('Administrator', 'Manager'), async (req, res) => {
    try {
        const userId = parseInt(req.params.id)
        const user = await User.findByPk(userId)

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: `User with ID ${userId} does not exist`
            })
        }

        const { name, email, role } = req.body

        if (name) user.name = name
        if (email) user.email = email
        if (role) user.role = role

        await user.save()

        res.json({
            message: 'User updated successfully',
            user: user.toJSON()
        })
    } catch (error) {
        console.error('Update user error:', error)
        
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                error: 'Validation error',
                message: error.errors.map(e => e.message).join(', ')
            })
        }

        res.status(500).json({
            error: 'Failed to update user',
            message: error.message
        })
    }
})

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user (Administrator only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Cannot delete own account
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Administrator role required
 *       404:
 *         description: User not found
 */
// Delete user - requires Administrator role
router.delete('/users/:id', authenticateToken, authorize('Administrator'), async (req, res) => {
    try {
        const userId = parseInt(req.params.id)
        const user = await User.findByPk(userId)

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: `User with ID ${userId} does not exist`
            })
        }

        // Don't allow deleting self
        if (user.id === req.user.id) {
            return res.status(400).json({
                error: 'Delete failed',
                message: 'You cannot delete your own account'
            })
        }

        const deletedUser = user.toJSON()
        await user.destroy()

        res.json({
            message: 'User deleted successfully',
            user: deletedUser
        })
    } catch (error) {
        console.error('Delete user error:', error)
        res.status(500).json({
            error: 'Failed to delete user',
            message: error.message
        })
    }
})

export default router
