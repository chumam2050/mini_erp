import { DataTypes } from 'sequelize'
import bcrypt from 'bcryptjs'
import sequelize from '../config/database.js'

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Name cannot be empty'
            }
        }
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: {
            msg: 'Email already exists'
        },
        validate: {
            isEmail: {
                msg: 'Please provide a valid email'
            },
            notEmpty: {
                msg: 'Email cannot be empty'
            }
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Password cannot be empty'
            },
            len: {
                args: [6, 100],
                msg: 'Password must be at least 6 characters'
            }
        }
    },
    role: {
        type: DataTypes.ENUM('Administrator', 'Manager', 'Staff'),
        defaultValue: 'Staff',
        allowNull: false
    }
}, {
    tableName: 'users',
    timestamps: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10)
                user.password = await bcrypt.hash(user.password, salt)
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10)
                user.password = await bcrypt.hash(user.password, salt)
            }
        }
    }
})

// Instance method to compare password
User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password)
}

// Remove password from JSON output
User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get())
    delete values.password
    return values
}

export default User
