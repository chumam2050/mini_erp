import User from '../models/User.js'

/**
 * Get all users
 */
export const getAllUsers = async (req, res) => {
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
}

/**
 * Get user by ID
 */
export const getUserById = async (req, res) => {
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
}

/**
 * Create new user
 */
export const createUser = async (req, res) => {
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
}

/**
 * Update user
 */
export const updateUser = async (req, res) => {
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
}

/**
 * Delete user
 */
export const deleteUser = async (req, res) => {
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
}
