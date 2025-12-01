import express from 'express'

const router = express.Router()

// Sample data
const users = [
    {
        id: 1,
        name: 'Ahmad Wijaya',
        email: 'ahmad.wijaya@minierp.com',
        role: 'Administrator'
    },
    {
        id: 2,
        name: 'Siti Nurhaliza',
        email: 'siti.nurhaliza@minierp.com',
        role: 'Manager'
    },
    {
        id: 3,
        name: 'Budi Santoso',
        email: 'budi.santoso@minierp.com',
        role: 'Staff'
    },
    {
        id: 4,
        name: 'Dewi Lestari',
        email: 'dewi.lestari@minierp.com',
        role: 'Staff'
    }
]

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

// Get all users
router.get('/users', (req, res) => {
    try {
        res.json(users)
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch users',
            message: error.message
        })
    }
})

// Get user by ID
router.get('/users/:id', (req, res) => {
    try {
        const userId = parseInt(req.params.id)
        const user = users.find(u => u.id === userId)

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: `User with ID ${userId} does not exist`
            })
        }

        res.json(user)
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch user',
            message: error.message
        })
    }
})

// Create new user
router.post('/users', (req, res) => {
    try {
        const { name, email, role } = req.body

        if (!name || !email || !role) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Name, email, and role are required'
            })
        }

        const newUser = {
            id: users.length + 1,
            name,
            email,
            role
        }

        users.push(newUser)

        res.status(201).json({
            message: 'User created successfully',
            user: newUser
        })
    } catch (error) {
        res.status(500).json({
            error: 'Failed to create user',
            message: error.message
        })
    }
})

// Update user
router.put('/users/:id', (req, res) => {
    try {
        const userId = parseInt(req.params.id)
        const userIndex = users.findIndex(u => u.id === userId)

        if (userIndex === -1) {
            return res.status(404).json({
                error: 'User not found',
                message: `User with ID ${userId} does not exist`
            })
        }

        const { name, email, role } = req.body

        if (name) users[userIndex].name = name
        if (email) users[userIndex].email = email
        if (role) users[userIndex].role = role

        res.json({
            message: 'User updated successfully',
            user: users[userIndex]
        })
    } catch (error) {
        res.status(500).json({
            error: 'Failed to update user',
            message: error.message
        })
    }
})

// Delete user
router.delete('/users/:id', (req, res) => {
    try {
        const userId = parseInt(req.params.id)
        const userIndex = users.findIndex(u => u.id === userId)

        if (userIndex === -1) {
            return res.status(404).json({
                error: 'User not found',
                message: `User with ID ${userId} does not exist`
            })
        }

        const deletedUser = users.splice(userIndex, 1)[0]

        res.json({
            message: 'User deleted successfully',
            user: deletedUser
        })
    } catch (error) {
        res.status(500).json({
            error: 'Failed to delete user',
            message: error.message
        })
    }
})

export default router
