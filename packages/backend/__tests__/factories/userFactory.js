import User from '../../src/models/User.js'

/**
 * User Factory for Testing
 * Creates User instances with sensible defaults and random data
 */

let userCounter = 0

/**
 * Generate unique email
 */
export const generateEmail = (prefix = 'user') => {
    userCounter++
    return `${prefix}${userCounter}_${Date.now()}@test.com`
}

/**
 * Create a User with default or custom attributes
 * @param {Object} attributes - Custom user attributes
 * @returns {Promise<User>} Created user instance
 */
export const createUser = async (attributes = {}) => {
    const defaults = {
        name: attributes.name || `Test User ${userCounter + 1}`,
        email: attributes.email || generateEmail('user'),
        password: attributes.password || 'password123',
        role: attributes.role || 'Staff'
    }

    const userData = { ...defaults, ...attributes }
    return await User.create(userData)
}

/**
 * Create an Administrator user
 * @param {Object} attributes - Custom user attributes
 * @returns {Promise<User>} Created admin user
 */
export const createAdmin = async (attributes = {}) => {
    return await createUser({
        name: attributes.name || `Admin User ${userCounter + 1}`,
        email: attributes.email || generateEmail('admin'),
        password: attributes.password || 'password123',
        role: 'Administrator',
        ...attributes
    })
}

/**
 * Create a Manager user
 * @param {Object} attributes - Custom user attributes
 * @returns {Promise<User>} Created manager user
 */
export const createManager = async (attributes = {}) => {
    return await createUser({
        name: attributes.name || `Manager User ${userCounter + 1}`,
        email: attributes.email || generateEmail('manager'),
        password: attributes.password || 'password123',
        role: 'Manager',
        ...attributes
    })
}

/**
 * Create a Staff user
 * @param {Object} attributes - Custom user attributes
 * @returns {Promise<User>} Created staff user
 */
export const createStaff = async (attributes = {}) => {
    return await createUser({
        name: attributes.name || `Staff User ${userCounter + 1}`,
        email: attributes.email || generateEmail('staff'),
        password: attributes.password || 'password123',
        role: 'Staff',
        ...attributes
    })
}

/**
 * Build a User instance without saving to database
 * @param {Object} attributes - Custom user attributes
 * @returns {User} User instance (not saved)
 */
export const buildUser = (attributes = {}) => {
    const defaults = {
        name: attributes.name || `Test User ${userCounter + 1}`,
        email: attributes.email || generateEmail('user'),
        password: attributes.password || 'password123',
        role: attributes.role || 'Staff'
    }

    const userData = { ...defaults, ...attributes }
    return User.build(userData)
}

/**
 * Create multiple users
 * @param {number} count - Number of users to create
 * @param {Object} attributes - Shared attributes for all users
 * @returns {Promise<Array<User>>} Array of created users
 */
export const createUsers = async (count, attributes = {}) => {
    const promises = []
    for (let i = 0; i < count; i++) {
        promises.push(createUser(attributes))
    }
    return await Promise.all(promises)
}

/**
 * Reset the counter (useful for test isolation)
 */
export const resetCounter = () => {
    userCounter = 0
}

export default {
    createUser,
    createAdmin,
    createManager,
    createStaff,
    buildUser,
    createUsers,
    resetCounter,
    generateEmail
}
