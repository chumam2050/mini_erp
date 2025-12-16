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
                },
                Product: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Product ID',
                            example: 1
                        },
                        sku: {
                            type: 'string',
                            description: 'Product SKU',
                            example: 'PROD-001'
                        },
                        name: {
                            type: 'string',
                            description: 'Product name',
                            example: 'Laptop Gaming'
                        },
                        description: {
                            type: 'string',
                            description: 'Product description',
                            example: 'High-performance gaming laptop'
                        },
                        category: {
                            type: 'string',
                            description: 'Product category',
                            example: 'Electronics'
                        },
                        price: {
                            type: 'number',
                            format: 'float',
                            description: 'Product price',
                            example: 15000000
                        },
                        stock: {
                            type: 'integer',
                            description: 'Current stock quantity',
                            example: 50
                        },
                        minStock: {
                            type: 'integer',
                            description: 'Minimum stock level',
                            example: 10
                        },
                        primaryImage: {
                            type: 'string',
                            description: 'Primary product image URL',
                            example: 'https://example.com/images/laptop.jpg'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                SaleItem: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Sale item ID',
                            example: 1
                        },
                        productId: {
                            type: 'integer',
                            description: 'Product ID',
                            example: 1
                        },
                        productName: {
                            type: 'string',
                            description: 'Product name',
                            example: 'Laptop Gaming'
                        },
                        productSku: {
                            type: 'string',
                            description: 'Product SKU',
                            example: 'PROD-001'
                        },
                        quantity: {
                            type: 'integer',
                            description: 'Quantity sold',
                            example: 2
                        },
                        unitPrice: {
                            type: 'number',
                            format: 'float',
                            description: 'Unit price',
                            example: 15000000
                        },
                        discount: {
                            type: 'number',
                            format: 'float',
                            description: 'Item discount amount',
                            example: 500000
                        },
                        discountType: {
                            type: 'string',
                            enum: ['fixed', 'percentage'],
                            description: 'Discount type',
                            example: 'fixed'
                        },
                        subtotal: {
                            type: 'number',
                            format: 'float',
                            description: 'Item subtotal after discount',
                            example: 29000000
                        }
                    }
                },
                Sale: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Sale ID',
                            example: 1
                        },
                        saleNumber: {
                            type: 'string',
                            description: 'Unique sale number',
                            example: 'SL-20251211-001'
                        },
                        customerId: {
                            type: 'integer',
                            nullable: true,
                            description: 'Customer ID (if registered)',
                            example: 1
                        },
                        customerName: {
                            type: 'string',
                            nullable: true,
                            description: 'Customer name',
                            example: 'John Doe'
                        },
                        customerPhone: {
                            type: 'string',
                            nullable: true,
                            description: 'Customer phone',
                            example: '+6281234567890'
                        },
                        customerEmail: {
                            type: 'string',
                            nullable: true,
                            format: 'email',
                            description: 'Customer email',
                            example: 'john.doe@example.com'
                        },
                        cashier: {
                            $ref: '#/components/schemas/User'
                        },
                        items: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/SaleItem'
                            }
                        },
                        subtotal: {
                            type: 'number',
                            format: 'float',
                            description: 'Subtotal before discount and tax',
                            example: 30000000
                        },
                        discount: {
                            type: 'number',
                            format: 'float',
                            description: 'Total discount amount',
                            example: 1000000
                        },
                        discountType: {
                            type: 'string',
                            enum: ['fixed', 'percentage'],
                            description: 'Discount type',
                            example: 'fixed'
                        },
                        tax: {
                            type: 'number',
                            format: 'float',
                            description: 'Tax amount',
                            example: 2900000
                        },
                        taxRate: {
                            type: 'number',
                            format: 'float',
                            description: 'Tax rate percentage',
                            example: 10
                        },
                        total: {
                            type: 'number',
                            format: 'float',
                            description: 'Final total amount',
                            example: 31900000
                        },
                        amountPaid: {
                            type: 'number',
                            format: 'float',
                            description: 'Amount paid by customer',
                            example: 32000000
                        },
                        change: {
                            type: 'number',
                            format: 'float',
                            description: 'Change amount',
                            example: 100000
                        },
                        paymentMethod: {
                            type: 'string',
                            enum: ['cash', 'card', 'transfer', 'digital'],
                            description: 'Payment method',
                            example: 'cash'
                        },
                        status: {
                            type: 'string',
                            enum: ['completed', 'cancelled'],
                            description: 'Sale status',
                            example: 'completed'
                        },
                        notes: {
                            type: 'string',
                            nullable: true,
                            description: 'Additional notes',
                            example: 'Customer requested gift wrapping'
                        },
                        saleDate: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Sale date and time'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                SaleInput: {
                    type: 'object',
                    required: ['items', 'amountPaid'],
                    properties: {
                        customerId: {
                            type: 'integer',
                            description: 'Customer ID (optional)',
                            example: 1
                        },
                        customerName: {
                            type: 'string',
                            description: 'Customer name',
                            example: 'John Doe'
                        },
                        customerPhone: {
                            type: 'string',
                            description: 'Customer phone',
                            example: '+6281234567890'
                        },
                        customerEmail: {
                            type: 'string',
                            format: 'email',
                            description: 'Customer email',
                            example: 'john.doe@example.com'
                        },
                        items: {
                            type: 'array',
                            minItems: 1,
                            items: {
                                type: 'object',
                                required: ['productId', 'quantity', 'unitPrice'],
                                properties: {
                                    productId: {
                                        type: 'integer',
                                        description: 'Product ID',
                                        example: 1
                                    },
                                    quantity: {
                                        type: 'integer',
                                        minimum: 1,
                                        description: 'Quantity to sell',
                                        example: 2
                                    },
                                    unitPrice: {
                                        type: 'number',
                                        format: 'float',
                                        minimum: 0,
                                        description: 'Unit price',
                                        example: 15000000
                                    },
                                    discount: {
                                        type: 'number',
                                        format: 'float',
                                        minimum: 0,
                                        description: 'Item discount amount',
                                        example: 500000
                                    },
                                    discountType: {
                                        type: 'string',
                                        enum: ['fixed', 'percentage'],
                                        description: 'Discount type',
                                        example: 'fixed'
                                    }
                                }
                            }
                        },
                        discount: {
                            type: 'number',
                            format: 'float',
                            minimum: 0,
                            description: 'Sale-level discount',
                            example: 1000000
                        },
                        discountType: {
                            type: 'string',
                            enum: ['fixed', 'percentage'],
                            description: 'Sale discount type',
                            example: 'fixed'
                        },
                        taxRate: {
                            type: 'number',
                            format: 'float',
                            minimum: 0,
                            maximum: 100,
                            description: 'Tax rate percentage',
                            example: 10
                        },
                        paymentMethod: {
                            type: 'string',
                            enum: ['cash', 'card', 'transfer', 'digital'],
                            description: 'Payment method',
                            example: 'cash'
                        },
                        amountPaid: {
                            type: 'number',
                            format: 'float',
                            minimum: 0,
                            description: 'Amount paid by customer',
                            example: 32000000
                        },
                        notes: {
                            type: 'string',
                            description: 'Additional notes',
                            example: 'Customer requested gift wrapping'
                        }
                    }
                },
                SalesResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        data: {
                            type: 'object',
                            properties: {
                                sales: {
                                    type: 'array',
                                    items: {
                                        $ref: '#/components/schemas/Sale'
                                    }
                                },
                                pagination: {
                                    type: 'object',
                                    properties: {
                                        page: {
                                            type: 'integer',
                                            example: 1
                                        },
                                        limit: {
                                            type: 'integer',
                                            example: 10
                                        },
                                        total: {
                                            type: 'integer',
                                            example: 25
                                        },
                                        pages: {
                                            type: 'integer',
                                            example: 3
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                SalesSummaryResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        data: {
                            type: 'object',
                            properties: {
                                period: {
                                    type: 'string',
                                    enum: ['today', 'week', 'month'],
                                    example: 'today'
                                },
                                summary: {
                                    type: 'object',
                                    properties: {
                                        totalSales: {
                                            type: 'integer',
                                            example: 15
                                        },
                                        totalRevenue: {
                                            type: 'number',
                                            format: 'float',
                                            example: 150000000
                                        },
                                        totalSubtotal: {
                                            type: 'number',
                                            format: 'float',
                                            example: 135000000
                                        },
                                        totalTax: {
                                            type: 'number',
                                            format: 'float',
                                            example: 13500000
                                        },
                                        averageSale: {
                                            type: 'number',
                                            format: 'float',
                                            example: 10000000
                                        }
                                    }
                                },
                                paymentMethods: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            paymentMethod: {
                                                type: 'string',
                                                example: 'cash'
                                            },
                                            count: {
                                                type: 'integer',
                                                example: 10
                                            },
                                            total: {
                                                type: 'number',
                                                format: 'float',
                                                example: 100000000
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                ProductsResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        data: {
                            type: 'object',
                            properties: {
                                products: {
                                    type: 'array',
                                    items: {
                                        $ref: '#/components/schemas/Product'
                                    }
                                },
                                pagination: {
                                    type: 'object',
                                    properties: {
                                        page: {
                                            type: 'integer',
                                            example: 1
                                        },
                                        limit: {
                                            type: 'integer',
                                            example: 20
                                        },
                                        total: {
                                            type: 'integer',
                                            example: 50
                                        },
                                        pages: {
                                            type: 'integer',
                                            example: 3
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                POSSuccessResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        message: {
                            type: 'string',
                            example: 'Sale created successfully'
                        },
                        data: {
                            $ref: '#/components/schemas/Sale'
                        }
                    }
                },
                POSErrorResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        message: {
                            type: 'string',
                            example: 'Error creating sale'
                        },
                        error: {
                            type: 'string',
                            example: 'Product with ID 1 not found'
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
            },
            {
                name: 'POS',
                description: 'Point of Sale endpoints (protected)'
            }
        ]
    },
    apis: ['./src/routes/*.js'] // Path ke file routes dengan JSDoc comments
}

const swaggerSpec = swaggerJsdoc(options)

export default swaggerSpec
