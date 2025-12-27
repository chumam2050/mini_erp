import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const SaleItem = sequelize.define('SaleItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    saleId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    productName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    productSku: {
        type: DataTypes.STRING,
        allowNull: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    unitPrice: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
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
    subtotal: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    }
}, {
    tableName: 'sale_items',
    timestamps: true,
    hooks: {
        beforeSave: (saleItem) => {
            // Calculate subtotal based on quantity, unit price, and discount
            let subtotal = saleItem.quantity * saleItem.unitPrice
            
            if (saleItem.discount > 0) {
                if (saleItem.discountType === 'percentage') {
                    subtotal = subtotal * (1 - saleItem.discount / 100)
                } else {
                    subtotal = subtotal - saleItem.discount
                }
            }
            
            saleItem.subtotal = Math.max(0, subtotal)
        }
    }
})

export default SaleItem