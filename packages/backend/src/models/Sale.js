import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'
import User from './User.js'

const Sale = sequelize.define('Sale', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    saleNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    },
    customerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: User,
            key: 'id'
        }
    },
    customerName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    customerPhone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    customerEmail: {
        type: DataTypes.STRING,
        allowNull: true
    },
    cashierId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    subtotal: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    discount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    discountType: {
        type: DataTypes.ENUM('percentage', 'fixed'),
        defaultValue: 'fixed'
    },
    tax: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    taxRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 100
        }
    },
    total: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    amountPaid: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    change: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    paymentMethod: {
        type: DataTypes.ENUM('cash', 'card', 'digital_wallet', 'bank_transfer'),
        allowNull: false,
        defaultValue: 'cash'
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'cancelled', 'refunded'),
        defaultValue: 'completed'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    saleDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'sales',
    timestamps: true,
    hooks: {
        beforeCreate: async (sale) => {
            // Generate sale number
            const date = new Date()
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            
            // Find the last sale of the day
            const lastSale = await Sale.findOne({
                where: sequelize.where(
                    sequelize.fn('DATE', sequelize.col('saleDate')),
                    sequelize.fn('DATE', new Date())
                ),
                order: [['id', 'DESC']]
            })
            
            let sequence = 1
            if (lastSale) {
                const lastNumber = lastSale.saleNumber
                const lastSequence = parseInt(lastNumber.split('-')[3])
                sequence = lastSequence + 1
            }
            
            sale.saleNumber = `SALE-${year}${month}${day}-${String(sequence).padStart(4, '0')}`
        }
    }
})

export default Sale