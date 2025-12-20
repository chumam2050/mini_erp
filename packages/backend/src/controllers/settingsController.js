import { Settings } from '../models/index.js'

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get all settings or by category
 *     tags: [Settings]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: List of settings
 */
export const getAllSettings = async (req, res) => {
  try {
    const { category } = req.query
    const where = category ? { category } : {}
    
    const settings = await Settings.findAll({
      where,
      order: [['category', 'ASC'], ['key', 'ASC']]
    })

    // Transform to key-value pairs with typed values
    const settingsMap = {}
    settings.forEach(setting => {
      settingsMap[setting.key] = {
        value: setting.getTypedValue(),
        type: setting.type,
        description: setting.description,
        category: setting.category
      }
    })

    res.json(settingsMap)
  } catch (error) {
    console.error('Error fetching settings:', error)
    res.status(500).json({ message: 'Error fetching settings' })
  }
}

/**
 * @swagger
 * /api/settings/{key}:
 *   get:
 *     summary: Get a specific setting by key
 *     tags: [Settings]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Setting value
 *       404:
 *         description: Setting not found
 */
export const getSetting = async (req, res) => {
  try {
    const { key } = req.params
    const setting = await Settings.findOne({ where: { key } })

    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' })
    }

    res.json({
      key: setting.key,
      value: setting.getTypedValue(),
      type: setting.type,
      description: setting.description,
      category: setting.category
    })
  } catch (error) {
    console.error('Error fetching setting:', error)
    res.status(500).json({ message: 'Error fetching setting' })
  }
}

/**
 * @swagger
 * /api/settings:
 *   post:
 *     summary: Create or update a setting
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *               value:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [string, number, boolean, json]
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Setting saved
 */
export const upsertSetting = async (req, res) => {
  try {
    const { key, value, type, description, category } = req.body

    if (!key || value === undefined) {
      return res.status(400).json({ message: 'Key and value are required' })
    }

    const setting = await Settings.setSetting(key, value, type, description, category)

    res.json({
      key: setting.key,
      value: setting.getTypedValue(),
      type: setting.type,
      description: setting.description,
      category: setting.category
    })
  } catch (error) {
    console.error('Error saving setting:', error)
    res.status(500).json({ message: 'Error saving setting' })
  }
}

/**
 * @swagger
 * /api/settings/bulk:
 *   post:
 *     summary: Update multiple settings at once
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Settings saved
 */
export const bulkUpsertSettings = async (req, res) => {
  try {
    const settings = req.body

    const results = []
    for (const [key, config] of Object.entries(settings)) {
      const { value, type, description, category } = config
      const setting = await Settings.setSetting(key, value, type, description, category)
      results.push({
        key: setting.key,
        value: setting.getTypedValue(),
        type: setting.type,
        description: setting.description,
        category: setting.category
      })
    }

    res.json({ message: 'Settings saved successfully', settings: results })
  } catch (error) {
    console.error('Error saving settings:', error)
    res.status(500).json({ message: 'Error saving settings' })
  }
}

/**
 * @swagger
 * /api/settings/{key}:
 *   delete:
 *     summary: Delete a setting
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Setting deleted
 */
export const deleteSetting = async (req, res) => {
  try {
    const { key } = req.params
    const deleted = await Settings.destroy({ where: { key } })

    if (!deleted) {
      return res.status(404).json({ message: 'Setting not found' })
    }

    res.json({ message: 'Setting deleted successfully' })
  } catch (error) {
    console.error('Error deleting setting:', error)
    res.status(500).json({ message: 'Error deleting setting' })
  }
}
