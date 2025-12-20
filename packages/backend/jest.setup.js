import { jest } from '@jest/globals'

// Mock environment variables untuk testing
process.env.NODE_ENV = 'test'
process.env.PORT = 5001
process.env.JWT_SECRET = 'test-secret-key-for-testing-only'
process.env.JWT_EXPIRES_IN = '1h'

// PostgreSQL database untuk test environment
// Database minierp_test dibuat otomatis oleh .devcontainer/post-create.sh
process.env.DB_HOST = 'db'
process.env.DB_PORT = 5432
process.env.DB_NAME = 'minierp_test'
process.env.DB_USER = 'user'
process.env.DB_PASSWORD = 'password'

// Increase timeout untuk database operations
jest.setTimeout(15000)
