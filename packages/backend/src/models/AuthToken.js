import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const AuthToken = sequelize.define('AuthToken', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    token: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    userAgent: {
        type: DataTypes.STRING,
        allowNull: true
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'auth_tokens',
    timestamps: true,
    indexes: [
        {
            fields: ['token']
        },
        {
            fields: ['userId']
        },
        {
            fields: ['expiresAt']
        }
    ]
})

export default AuthToken
