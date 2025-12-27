import bwipjs from 'bwip-js'
import PDFDocument from 'pdfkit'

/**
 * Generate barcode image buffer from SKU
 * @param {string} sku - Product SKU
 * @param {object} options - Barcode options
 * @returns {Promise<Buffer>} - Barcode image buffer
 */
export const generateBarcodeImage = async (sku, options = {}) => {
    try {
        const barcodeOptions = {
            bcid: options.type || 'code128',       // Barcode type (code128 is most compatible)
            text: sku,                              // Text to encode
            scale: options.scale || 4,              // 4x scaling factor for better scanning
            height: options.height || 15,           // Bar height, in millimeters (increased for better scanning)
            includetext: options.includetext !== false,  // Show human-readable text
            textxalign: 'center',                   // Center align text
            textsize: options.textsize || 12,       // Text size
            textgaps: 0,                            // No gaps in text
            backgroundcolor: 'ffffff',              // White background
        }

        const png = await bwipjs.toBuffer(barcodeOptions)
        return png
    } catch (error) {
        throw new Error(`Failed to generate barcode: ${error.message}`)
    }
}

/**
 * Generate PDF with barcode for a single product
 * @param {object} product - Product object with SKU and name
 * @param {object} options - PDF options
 * @returns {Promise<PDFDocument>} - PDF document stream
 */
export const generateBarcodePDF = async (product, options = {}) => {
    try {
        const doc = new PDFDocument({
            size: options.pageSize || 'A4',
            margin: 50
        })

        // Generate barcode image with optimal settings for scanning
        const barcodeImage = await generateBarcodeImage(product.sku, {
            scale: 5,
            height: 20,
            includetext: true,
            textsize: 14
        })

        // Add title
        doc.fontSize(20).text('Product Barcode', { align: 'center' })
        doc.moveDown()

        // Add product information
        doc.fontSize(12).text(`Product: ${product.name}`, { align: 'center' })
        doc.fontSize(10).text(`SKU: ${product.sku}`, { align: 'center' })
        doc.moveDown()

        // Add barcode image
        doc.image(barcodeImage, {
            fit: [400, 200],
            align: 'center',
            valign: 'center'
        })

        doc.moveDown()
        doc.fontSize(10).text(`Price: Rp ${parseFloat(product.price).toLocaleString('id-ID')}`, { align: 'center' })

        return doc
    } catch (error) {
        throw new Error(`Failed to generate barcode PDF: ${error.message}`)
    }
}

/**
 * Generate PDF with multiple barcodes (batch)
 * @param {Array} products - Array of product objects
 * @param {object} options - PDF options
 * @returns {Promise<PDFDocument>} - PDF document stream
 */
export const generateBatchBarcodePDF = async (products, options = {}) => {
    try {
        const doc = new PDFDocument({
            size: options.pageSize || 'A4',
            margin: 50
        })

        // Add title
        doc.fontSize(20).text('Product Barcodes', { align: 'center' })
        doc.moveDown(2)

        for (let i = 0; i < products.length; i++) {
            const product = products[i]

            // Add new page for each product except the first one
            if (i > 0) {
                doc.addPage()
            }

            // Generate barcode image with optimal settings for scanning
            const barcodeImage = await generateBarcodeImage(product.sku, {
                scale: 5,
                height: 20,
                includetext: true,
                textsize: 14
            })

            // Add product information
            doc.fontSize(14).text(`${i + 1}. ${product.name}`, { align: 'center' })
            doc.fontSize(10).text(`SKU: ${product.sku}`, { align: 'center' })
            doc.moveDown()

            // Add barcode image
            doc.image(barcodeImage, {
                fit: [400, 200],
                align: 'center',
                valign: 'center'
            })

            doc.moveDown()
            doc.fontSize(10).text(`Price: Rp ${parseFloat(product.price).toLocaleString('id-ID')}`, { align: 'center' })
            
            if (product.stock !== undefined) {
                doc.text(`Stock: ${product.stock}`, { align: 'center' })
            }
        }

        return doc
    } catch (error) {
        throw new Error(`Failed to generate batch barcode PDF: ${error.message}`)
    }
}

/**
 * Generate barcode labels in a grid layout (for printing labels)
 * @param {Array} products - Array of product objects
 * @param {object} options - Label options
 * @returns {Promise<PDFDocument>} - PDF document stream
 */
export const generateBarcodeLabelsPDF = async (products, options = {}) => {
    try {
        const doc = new PDFDocument({
            size: options.pageSize || 'A4',
            margin: 20
        })

        const labelsPerRow = options.labelsPerRow || 3
        const labelWidth = (doc.page.width - 40) / labelsPerRow
        const labelHeight = options.labelHeight || 100
        const startX = 20
        const startY = 20

        let currentX = startX
        let currentY = startY
        let labelCount = 0

        for (const product of products) {
            // Check if we need a new page
            if (currentY + labelHeight > doc.page.height - 20) {
                doc.addPage()
                currentX = startX
                currentY = startY
            }

            // Generate barcode image with optimal settings for scanning
            const barcodeImage = await generateBarcodeImage(product.sku, {
                scale: 3,
                height: 12,
                includetext: true,
                textsize: 10
            })

            // Draw label border (optional)
            if (options.showBorder) {
                doc.rect(currentX, currentY, labelWidth, labelHeight).stroke()
            }

            // Add product name
            doc.fontSize(8)
                .text(product.name, currentX + 5, currentY + 5, {
                    width: labelWidth - 10,
                    align: 'center'
                })

            // Add barcode
            doc.image(barcodeImage, currentX + 10, currentY + 25, {
                fit: [labelWidth - 20, 40]
            })

            // Add price
            doc.fontSize(8)
                .text(`Rp ${parseFloat(product.price).toLocaleString('id-ID')}`, 
                    currentX + 5, 
                    currentY + 70, 
                    { width: labelWidth - 10, align: 'center' }
                )

            // Move to next label position
            labelCount++
            currentX += labelWidth

            // Move to next row if needed
            if (labelCount % labelsPerRow === 0) {
                currentX = startX
                currentY += labelHeight
            }
        }

        return doc
    } catch (error) {
        throw new Error(`Failed to generate barcode labels PDF: ${error.message}`)
    }
}
