import { generateSaleNumber } from '../src/utils/saleUtils.js'

describe('POS Utilities', () => {
  describe('generateSaleNumber', () => {
    it('should generate sale number with correct format', () => {
      const saleNumber = generateSaleNumber()
      expect(saleNumber).toMatch(/^SALE-\d{8}-\d{4}$/)
    })

    it('should include current date', () => {
      const saleNumber = generateSaleNumber()
      const date = new Date()
      const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
      expect(saleNumber).toContain(dateStr)
    })
  })
})