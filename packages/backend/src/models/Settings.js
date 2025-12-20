import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Settings = sequelize.define('Settings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Setting key identifier'
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Setting value (can be JSON string)'
  },
  type: {
    type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
    defaultValue: 'string',
    comment: 'Data type of the value'
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Description of the setting'
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'general',
    comment: 'Category grouping for settings'
  }
}, {
  tableName: 'settings',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['key']
    },
    {
      fields: ['category']
    }
  ]
})

// Helper method to get typed value
Settings.prototype.getTypedValue = function() {
  switch (this.type) {
    case 'number':
      return parseFloat(this.value)
    case 'boolean':
      return this.value === 'true'
    case 'json':
      try {
        return JSON.parse(this.value)
      } catch (e) {
        return this.value
      }
    default:
      return this.value
  }
}

// Static method to get setting by key
Settings.getSetting = async function(key, defaultValue = null) {
  const setting = await Settings.findOne({ where: { key } })
  if (!setting) return defaultValue
  return setting.getTypedValue()
}

// Static method to set setting
Settings.setSetting = async function(key, value, type = 'string', description = null, category = 'general') {
  const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value)
  
  const [setting, created] = await Settings.findOrCreate({
    where: { key },
    defaults: {
      key,
      value: stringValue,
      type,
      description,
      category
    }
  })

  if (!created) {
    setting.value = stringValue
    setting.type = type
    if (description) setting.description = description
    if (category) setting.category = category
    await setting.save()
  }

  return setting
}

export default Settings
