import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sequelize from '../config/database.js'
import Product from '../models/Product.js'
import { 
    generateBarcodePDF, 
    generateBatchBarcodePDF, 
    generateBarcodeLabelsPDF 
} from '../utils/barcodeGenerator.js'
import { 
    generateSimpleProductLabel, 
    generateThermalLabels, 
    generateLargeBarcodeForScanning 
} from '../utils/thermalLabelGenerator.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create output directory
const outputDir = path.join(__dirname, '../../barcode-output')
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
}

/**
 * Generate individual barcode PDF for each product
 */
async function generateIndividualBarcodes(products) {
    console.log('\n📄 Generating individual barcode PDFs...')
    
    const individualDir = path.join(outputDir, 'individual')
    if (!fs.existsSync(individualDir)) {
        fs.mkdirSync(individualDir, { recursive: true })
    }

    let success = 0
    let failed = 0

    for (const product of products) {
        try {
            const doc = await generateBarcodePDF(product)
            const filename = `barcode_${product.sku.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
            const filepath = path.join(individualDir, filename)
            
            const writeStream = fs.createWriteStream(filepath)
            doc.pipe(writeStream)
            doc.end()

            await new Promise((resolve, reject) => {
                writeStream.on('finish', resolve)
                writeStream.on('error', reject)
            })

            success++
            console.log(`✓ Generated: ${filename}`)
        } catch (error) {
            failed++
            console.error(`✗ Failed to generate barcode for ${product.sku}:`, error.message)
        }
    }

    console.log(`\nIndividual barcodes: ${success} success, ${failed} failed`)
    return { success, failed }
}

/**
 * Generate batch barcode PDF (all products in one PDF)
 */
async function generateBatchPDF(products) {
    console.log('\n📚 Generating batch barcode PDF...')
    
    try {
        const doc = await generateBatchBarcodePDF(products)
        const filename = 'all_products_barcodes.pdf'
        const filepath = path.join(outputDir, filename)
        
        const writeStream = fs.createWriteStream(filepath)
        doc.pipe(writeStream)
        doc.end()

        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve)
            writeStream.on('error', reject)
        })

        console.log(`✓ Generated: ${filename}`)
        console.log(`  Location: ${filepath}`)
        return true
    } catch (error) {
        console.error('✗ Failed to generate batch PDF:', error.message)
        return false
    }
}

/**
 * Generate barcode labels PDF (grid layout for printing)
 */
async function generateLabelsPDF(products, options = {}) {
    console.log('\n🏷️  Generating barcode labels PDF...')
    
    try {
        const doc = await generateBarcodeLabelsPDF(products, options)
        const filename = 'barcode_labels.pdf'
        const filepath = path.join(outputDir, filename)
        
        const writeStream = fs.createWriteStream(filepath)
        doc.pipe(writeStream)
        doc.end()

        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve)
            writeStream.on('error', reject)
        })

        console.log(`✓ Generated: ${filename}`)
        console.log(`  Layout: ${options.labelsPerRow || 3} labels per row`)
        console.log(`  Location: ${filepath}`)
        return true
    } catch (error) {
        console.error('✗ Failed to generate labels PDF:', error.message)
        return false
    }
}

/**
 * Generate barcodes by category
 */
async function generateByCategory(products) {
    console.log('\n📁 Generating barcodes by category...')
    
    const categoryDir = path.join(outputDir, 'by-category')
    if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true })
    }

    // Group products by category
    const categories = {}
    products.forEach(product => {
        if (!categories[product.category]) {
            categories[product.category] = []
        }
        categories[product.category].push(product)
    })

    let success = 0
    let failed = 0

    for (const [category, categoryProducts] of Object.entries(categories)) {
        try {
            const doc = await generateBatchBarcodePDF(categoryProducts)
            const filename = `barcodes_${category.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
            const filepath = path.join(categoryDir, filename)
            
            const writeStream = fs.createWriteStream(filepath)
            doc.pipe(writeStream)
            doc.end()

            await new Promise((resolve, reject) => {
                writeStream.on('finish', resolve)
                writeStream.on('error', reject)
            })

            success++
            console.log(`✓ Generated: ${filename} (${categoryProducts.length} products)`)
        } catch (error) {
            failed++
            console.error(`✗ Failed to generate barcode for category ${category}:`, error.message)
        }
    }

    console.log(`\nCategory barcodes: ${success} success, ${failed} failed`)
    return { success, failed }
}

/**
 * Generate thermal-style labels (optimized for scanning)
 */
async function generateThermalLabelsPDF(products, options = {}) {
    console.log('\n🏷️  Generating thermal-style barcode labels (HIGH QUALITY FOR SCANNING)...')
    
    try {
        const doc = await generateThermalLabels(products, options)
        const filename = 'thermal_barcode_labels.pdf'
        const filepath = path.join(outputDir, filename)
        
        const writeStream = fs.createWriteStream(filepath)
        doc.pipe(writeStream)
        doc.end()

        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve)
            writeStream.on('error', reject)
        })

        console.log(`✓ Generated: ${filename}`)
        console.log(`  Layout: ${options.labelsPerRow || 3} labels per row`)
        console.log(`  Quality: HIGH - Optimized for barcode scanners`)
        console.log(`  Location: ${filepath}`)
        return true
    } catch (error) {
        console.error('✗ Failed to generate thermal labels PDF:', error.message)
        return false
    }
}

/**
 * Generate large scannable barcodes
 */
async function generateLargeBarcodes(products) {
    console.log('\n📐 Generating large scannable barcodes...')
    
    const largeDir = path.join(outputDir, 'large-scannable')
    if (!fs.existsSync(largeDir)) {
        fs.mkdirSync(largeDir, { recursive: true })
    }

    let success = 0
    let failed = 0

    for (const product of products) {
        try {
            const doc = await generateLargeBarcodeForScanning(product)
            const filename = `large_${product.sku.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
            const filepath = path.join(largeDir, filename)
            
            const writeStream = fs.createWriteStream(filepath)
            doc.pipe(writeStream)
            doc.end()

            await new Promise((resolve, reject) => {
                writeStream.on('finish', resolve)
                writeStream.on('error', reject)
            })

            success++
            console.log(`✓ Generated: ${filename}`)
        } catch (error) {
            failed++
            console.error(`✗ Failed to generate large barcode for ${product.sku}:`, error.message)
        }
    }

    console.log(`\nLarge barcodes: ${success} success, ${failed} failed`)
    return { success, failed }
}

/**
 * Generate simple thermal-style labels (like thermal printer output)
 */
async function generateSimpleLabels(products) {
    console.log('\n🎫 Generating simple thermal-style labels...')
    
    const simpleDir = path.join(outputDir, 'simple-labels')
    if (!fs.existsSync(simpleDir)) {
        fs.mkdirSync(simpleDir, { recursive: true })
    }

    let success = 0
    let failed = 0

    for (const product of products) {
        try {
            const doc = await generateSimpleProductLabel(product)
            const filename = `label_${product.sku.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
            const filepath = path.join(simpleDir, filename)
            
            const writeStream = fs.createWriteStream(filepath)
            doc.pipe(writeStream)
            doc.end()

            await new Promise((resolve, reject) => {
                writeStream.on('finish', resolve)
                writeStream.on('error', reject)
            })

            success++
            console.log(`✓ Generated: ${filename}`)
        } catch (error) {
            failed++
            console.error(`✗ Failed to generate simple label for ${product.sku}:`, error.message)
        }
    }

    console.log(`\nSimple labels: ${success} success, ${failed} failed`)
    return { success, failed }
}

/**
 * Main function
 */
async function main() {
    console.log('🚀 Starting Barcode Generation Script')
    console.log('=' .repeat(50))

    try {
        // Test database connection
        await sequelize.authenticate()
        console.log('✓ Database connection established')

        // Fetch all products
        const products = await Product.findAll({
            order: [['name', 'ASC']]
        })

        if (products.length === 0) {
            console.log('\n⚠️  No products found in database')
            process.exit(0)
        }

        console.log(`\n📦 Found ${products.length} products`)
        console.log(`📂 Output directory: ${outputDir}`)

        // Parse command line arguments
        const args = process.argv.slice(2)
        const mode = args[0] || 'all'

        switch (mode) {
            case 'individual':
                await generateIndividualBarcodes(products)
                break
            
            case 'batch':
                await generateBatchPDF(products)
                break
            
            case 'labels':
                const labelsPerRow = parseInt(args[1]) || 3
                const showBorder = args[2] === 'true'
                await generateLabelsPDF(products, { labelsPerRow, showBorder })
                break
            
            case 'category':
                await generateByCategory(products)
                break
            
            case 'thermal':
                const thermalLabelsPerRow = parseInt(args[1]) || 3
                const thermalShowBorder = args[2] === 'true'
                await generateThermalLabelsPDF(products, { labelsPerRow: thermalLabelsPerRow, showBorder: thermalShowBorder })
                break
            
            case 'large':
                await generateLargeBarcodes(products)
                break
            
            case 'simple':
                await generateSimpleLabels(products)
                break
            
            case 'all':
            default:
                // Generate all types
                await generateIndividualBarcodes(products)
                await generateBatchPDF(products)
                await generateLabelsPDF(products, { labelsPerRow: 3, showBorder: false })
                await generateThermalLabelsPDF(products, { labelsPerRow: 3, showBorder: false })
                await generateByCategory(products)
                break
        }

        console.log('\n' + '='.repeat(50))
        console.log('✅ Barcode generation completed!')
        console.log(`📂 Check output in: ${outputDir}`)
        
    } catch (error) {
        console.error('\n❌ Error:', error.message)
        console.error(error.stack)
        process.exit(1)
    } finally {
        await sequelize.close()
    }
}

// Show usage
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
Usage: node generateAllBarcodes.js [mode] [options]

Modes:
  all          Generate all types (default)
  individual   Generate individual PDF for each product
  batch        Generate one PDF with all products
  labels       Generate label sheet (grid layout)
  thermal      Generate thermal-style labels (HIGH QUALITY - optimized for scanning) ⭐
  large        Generate large scannable barcodes (A4, very clear)
  simple       Generate simple thermal-style labels (58mm style)
  category     Generate PDFs grouped by category

Examples:
  node generateAllBarcodes.js thermal          # RECOMMENDED for scanning
  node generateAllBarcodes.js thermal 3 true   # With 3 labels per row and borders
  node generateAllBarcodes.js large            # Large A4 barcodes
  node generateAllBarcodes.js simple           # Simple 58mm style labels
  node generateAllBarcodes.js category

Options for 'thermal' and 'labels' mode:
  [labelsPerRow]  Number of labels per row (default: 3)
  [showBorder]    Show border around labels (default: false)

⭐ RECOMMENDED: Use 'thermal' mode for best scanning quality!
    `)
    process.exit(0)
}

// Run the script
main()
