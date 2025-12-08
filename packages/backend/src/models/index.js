import User from './User.js'
import Product from './Product.js'
import Sale from './Sale.js'
import SaleItem from './SaleItem.js'

// Setup associations
Sale.belongsTo(User, { as: 'cashier', foreignKey: 'cashierId' })
Sale.belongsTo(User, { as: 'customer', foreignKey: 'customerId' })
Sale.hasMany(SaleItem, { foreignKey: 'saleId', as: 'items' })

SaleItem.belongsTo(Sale, { foreignKey: 'saleId' })
SaleItem.belongsTo(Product, { foreignKey: 'productId' })

export {
    User,
    Product,
    Sale,
    SaleItem
}