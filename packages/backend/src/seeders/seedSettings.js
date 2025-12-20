import { Settings } from '../models/index.js'

export const seedDefaultSettings = async () => {
  try {
    console.log('🌱 Seeding default settings...')

    const defaultSettings = [
      // POS Settings
      {
        key: 'pos.plastic_bag_small_price',
        value: '200',
        type: 'number',
        description: 'Harga kantong plastik kecil',
        category: 'pos'
      },
      {
        key: 'pos.plastic_bag_large_price',
        value: '500',
        type: 'number',
        description: 'Harga kantong plastik besar',
        category: 'pos'
      },
      {
        key: 'pos.tax_rate',
        value: '11',
        type: 'number',
        description: 'PPN rate dalam persen (default 11%)',
        category: 'pos'
      },
      {
        key: 'pos.default_discount',
        value: '0',
        type: 'number',
        description: 'Diskon default dalam persen',
        category: 'pos'
      },
      {
        key: 'pos.enable_tax',
        value: 'true',
        type: 'boolean',
        description: 'Enable/disable PPN',
        category: 'pos'
      },
      {
        key: 'pos.enable_discount',
        value: 'true',
        type: 'boolean',
        description: 'Enable/disable diskon',
        category: 'pos'
      },
      // Store Settings
      {
        key: 'store.name',
        value: 'Supermarket Sejahtera',
        type: 'string',
        description: 'Nama toko',
        category: 'store'
      },
      {
        key: 'store.address',
        value: 'Jl. Raya No. 123',
        type: 'string',
        description: 'Alamat toko',
        category: 'store'
      },
      {
        key: 'store.phone',
        value: '021-12345678',
        type: 'string',
        description: 'Nomor telepon toko',
        category: 'store'
      },
      {
        key: 'store.email',
        value: 'info@supermarket.com',
        type: 'string',
        description: 'Email toko',
        category: 'store'
      }
    ]

    for (const setting of defaultSettings) {
      await Settings.setSetting(
        setting.key,
        setting.value,
        setting.type,
        setting.description,
        setting.category
      )
    }

    console.log('✅ Default settings seeded successfully')
  } catch (error) {
    console.error('❌ Error seeding settings:', error)
    throw error
  }
}
