import swaggerJsdoc from 'swagger-jsdoc'

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'MiniERP API Documentation',
            version: '1.0.0',
            description: 'API documentation untuk MiniERP Backend dengan JWT Authentication',
            contact: {
                name: 'MiniERP Team',
                email: 'support@minierp.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server'
            },
            {
                url: 'https://api.minierp.com',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token (didapat dari login)'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'User ID',
                            example: 1
                        },
                        name: {
                            type: 'string',
                            description: 'User full name',
                            example: 'Ahmad Wijaya'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address',
                            example: 'ahmad.wijaya@minierp.com'
                        },
                        role: {
                            type: 'string',
                            enum: ['Administrator', 'Manager', 'Staff'],
                            description: 'User role',
                            example: 'Administrator'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Creation timestamp'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last update timestamp'
                        }
                    }
                },
                UserInput: {
                    type: 'object',
                    required: ['name', 'email', 'password'],
                    properties: {
                        name: {
                            type: 'string',
                            minLength: 1,
                            maxLength: 100,
                            description: 'User full name',
                            example: 'Ahmad Wijaya'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            maxLength: 100,
                            description: 'User email address',
                            example: 'ahmad.wijaya@minierp.com'
                        },
                        password: {
                            type: 'string',
                            minLength: 6,
                            maxLength: 100,
                            description: 'User password (minimal 6 karakter)',
                            example: 'password123'
                        },
                        role: {
                            type: 'string',
                            enum: ['Administrator', 'Manager', 'Staff'],
                            default: 'Staff',
                            description: 'User role',
                            example: 'Staff'
                        }
                    }
                },
                LoginInput: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email',
                            example: 'ahmad.wijaya@minierp.com'
                        },
                        password: {
                            type: 'string',
                            description: 'User password',
                            example: 'password123'
                        }
                    }
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            example: 'Login successful'
                        },
                        user: {
                            $ref: '#/components/schemas/User'
                        },
                        token: {
                            type: 'string',
                            description: 'JWT token',
                            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: 'Error type',
                            example: 'Validation error'
                        },
                        message: {
                            type: 'string',
                            description: 'Error message',
                            example: 'Email and password are required'
                        }
                    }
                },
                HealthCheck: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'OK'
                        },
                        message: {
                            type: 'string',
                            example: 'Backend is running smoothly'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time'
                        },
                        uptime: {
                            type: 'number',
                            description: 'Server uptime in seconds'
                        },
                        environment: {
                            type: 'string',
                            example: 'development'
                        }
                    }
                }
            }
        },
        tags: [
            {
                name: 'Authentication',
                description: 'Authentication & authorization endpoints'
            },
            {
                name: 'Users',
                description: 'User management endpoints (protected)'
            },
            {
                name: 'Health',
                description: 'Health check endpoints'
            }
        ]
    },
    apis: ['./src/routes/*.js'] // Path ke file routes dengan JSDoc comments
}

const swaggerSpec = swaggerJsdoc(options)

export default swaggerSpec
