/**
 * Generate unique sale number with format SALE-YYYYMMDD-XXXX
 * @returns {string} Sale number
 */
export const generateSaleNumber = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const time = String(Date.now()).slice(-4) // Use last 4 digits of timestamp
  
  return `SALE-${year}${month}${day}-${time}`
}