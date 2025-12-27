import bwipjs from 'bwip-js'
import PDFDocument from 'pdfkit'

/**
 * Generate simple product label like thermal printer (58mm style)
 * Similar to the EPPOS label format
 * @param {object} product - Product object
 * @returns {Promise<PDFDocument>} - PDF document stream
 */
export const generateSimpleProductLabel = async (product) => {
    try {
        const doc = new PDFDocument({
            size: [226.77, 340], // 58mm width (similar to thermal printer)
            margin: 10
        })

        // Generate barcode image with high quality for scanning
        const barcodeImage = await bwipjs.toBuffer({
            bcid: 'code128',
            text: product.sku,
            scale: 5,
            height: 20,
            includetext: true,
            textsize: 14,
            textxalign: 'center',
            backgroundcolor: 'ffffff',
        })

        // Product Name (bold and larger)
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text(product.name, {
               align: 'center',
               width: 206.77
           })

        doc.moveDown(0.3)

        // SKU
        doc.fontSize(9)
           .font('Helvetica')
           .text(`SKU: ${product.sku}`, {
               align: 'center'
           })

        doc.moveDown(0.3)

        // Price (bold)
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .text(`Rp ${parseFloat(product.price).toLocaleString('id-ID')}`, {
               align: 'center'
           })

        doc.moveDown(0.5)

        // Barcode - centered and larger
        doc.image(barcodeImage, {
            fit: [200, 100],
            align: 'center',
            valign: 'center'
        })

        return doc
    } catch (error) {
        throw new Error(`Failed to generate simple product label: ${error.message}`)
    }
}

/**
 * Generate thermal printer style labels (compact format)
 * Multiple labels in a grid, optimized for small label printers
 * @param {Array} products - Array of product objects
 * @param {object} options - Label options
 * @returns {Promise<PDFDocument>} - PDF document stream
 */
export const generateThermalLabels = async (products, options = {}) => {
    try {
        const doc = new PDFDocument({
            size: 'A4',
            margin: 10
        })

        const labelsPerRow = options.labelsPerRow || 3
        const labelWidth = (doc.page.width - 20) / labelsPerRow
        const labelHeight = options.labelHeight || 150
        const startX = 10
        const startY = 10

        let currentX = startX
        let currentY = startY
        let labelCount = 0

        for (const product of products) {
            // Check if we need a new page
            if (currentY + labelHeight > doc.page.height - 10) {
                doc.addPage()
                currentX = startX
                currentY = startY
            }

            // Generate high-quality barcode
            const barcodeImage = await bwipjs.toBuffer({
                bcid: 'code128',
                text: product.sku,
                scale: 4,
                height: 15,
                includetext: true,
                textsize: 12,
                textxalign: 'center',
                backgroundcolor: 'ffffff',
            })

            // Draw label border if requested
            if (options.showBorder) {
                doc.rect(currentX, currentY, labelWidth, labelHeight).stroke()
            }

            const padding = 5

            // Product name (truncated if too long)
            const productName = product.name.length > 30 
                ? product.name.substring(0, 27) + '...' 
                : product.name

            doc.fontSize(8)
               .font('Helvetica-Bold')
               .text(productName, 
                   currentX + padding, 
                   currentY + padding, 
                   {
                       width: labelWidth - (padding * 2),
                       align: 'center',
                       lineBreak: false
                   }
               )

            // Price
            doc.fontSize(9)
               .font('Helvetica-Bold')
               .text(`Rp ${parseFloat(product.price).toLocaleString('id-ID')}`, 
                   currentX + padding, 
                   currentY + padding + 20, 
                   {
                       width: labelWidth - (padding * 2),
                       align: 'center'
                   }
               )

            // Barcode
            doc.image(barcodeImage, 
                currentX + padding, 
                currentY + padding + 40, 
                {
                    fit: [labelWidth - (padding * 2), 80],
                    align: 'center'
                }
            )

            // SKU text
            doc.fontSize(7)
               .font('Helvetica')
               .text(product.sku, 
                   currentX + padding, 
                   currentY + labelHeight - 15, 
                   {
                       width: labelWidth - (padding * 2),
                       align: 'center'
                   }
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
        throw new Error(`Failed to generate thermal labels: ${error.message}`)
    }
}

/**
 * Generate large barcode for easy scanning (one per page)
 * @param {object} product - Product object
 * @returns {Promise<PDFDocument>} - PDF document stream
 */
export const generateLargeBarcodeForScanning = async (product) => {
    try {
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50
        })

        // Generate LARGE barcode for easy scanning
        const barcodeImage = await bwipjs.toBuffer({
            bcid: 'code128',
            text: product.sku,
            scale: 6,           // Very large scale
            height: 25,         // Tall bars
            includetext: true,
            textsize: 16,
            textxalign: 'center',
            backgroundcolor: 'ffffff',
        })

        // Title
        doc.fontSize(24)
           .font('Helvetica-Bold')
           .text(product.name, { align: 'center' })

        doc.moveDown(1)

        // Large barcode - centered
        doc.image(barcodeImage, {
            fit: [500, 250],
            align: 'center',
            valign: 'center'
        })

        doc.moveDown(2)

        // Product details
        doc.fontSize(14)
           .font('Helvetica')
           .text(`SKU: ${product.sku}`, { align: 'center' })
        
        doc.moveDown(0.5)
        
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .text(`Rp ${parseFloat(product.price).toLocaleString('id-ID')}`, { align: 'center' })

        if (product.stock !== undefined) {
            doc.moveDown(0.5)
            doc.fontSize(12)
               .font('Helvetica')
               .text(`Stock: ${product.stock} units`, { align: 'center' })
        }

        return doc
    } catch (error) {
        throw new Error(`Failed to generate large barcode: ${error.message}`)
    }
}
