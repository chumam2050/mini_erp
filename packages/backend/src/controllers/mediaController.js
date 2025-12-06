import Product from '../models/Product.js'
import { deleteFile } from '../config/multer.js'
import path from 'path'

/**
 * Upload product images/videos
 */
export const uploadProductMedia = async (req, res) => {
    try {
        const productId = parseInt(req.params.id)
        const product = await Product.findByPk(productId)

        if (!product) {
            // Delete uploaded files if product not found
            if (req.files) {
                req.files.forEach(file => deleteFile(file.filename))
            }
            return res.status(404).json({
                error: 'Product not found',
                message: `Product with ID ${productId} does not exist`
            })
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                error: 'No files uploaded',
                message: 'Please select at least one file to upload'
            })
        }

        // Get current images
        const currentImages = product.images || []

        // Add new files
        const newFiles = req.files.map(file => ({
            filename: file.filename,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: `/uploads/products/${file.filename}`,
            type: file.mimetype.startsWith('image') ? 'image' : 'video',
            uploadedAt: new Date().toISOString()
        }))

        const updatedImages = [...currentImages, ...newFiles]
        product.images = updatedImages

        // Set first image as primary if no primary image exists
        if (!product.primaryImage && newFiles.length > 0 && newFiles[0].type === 'image') {
            product.primaryImage = newFiles[0].url
        }

        await product.save()

        res.json({
            message: 'Files uploaded successfully',
            files: newFiles,
            product: product.toJSON()
        })
    } catch (error) {
        console.error('Upload error:', error)
        // Clean up uploaded files on error
        if (req.files) {
            req.files.forEach(file => deleteFile(file.filename))
        }
        res.status(500).json({
            error: 'Failed to upload files',
            message: error.message
        })
    }
}

/**
 * Set primary image for product
 */
export const setPrimaryImage = async (req, res) => {
    try {
        const productId = parseInt(req.params.id)
        const { imageUrl } = req.body

        if (!imageUrl) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Image URL is required'
            })
        }

        const product = await Product.findByPk(productId)

        if (!product) {
            return res.status(404).json({
                error: 'Product not found',
                message: `Product with ID ${productId} does not exist`
            })
        }

        // Verify the image exists in product images
        const images = product.images || []
        const imageExists = images.some(img => img.url === imageUrl && img.type === 'image')

        if (!imageExists) {
            return res.status(400).json({
                error: 'Invalid image',
                message: 'The specified image does not exist for this product'
            })
        }

        product.primaryImage = imageUrl
        await product.save()

        res.json({
            message: 'Primary image updated successfully',
            product: product.toJSON()
        })
    } catch (error) {
        console.error('Set primary image error:', error)
        res.status(500).json({
            error: 'Failed to set primary image',
            message: error.message
        })
    }
}

/**
 * Delete product media file
 */
export const deleteProductMedia = async (req, res) => {
    try {
        const productId = parseInt(req.params.id)
        const { fileUrl } = req.body

        if (!fileUrl) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'File URL is required'
            })
        }

        const product = await Product.findByPk(productId)

        if (!product) {
            return res.status(404).json({
                error: 'Product not found',
                message: `Product with ID ${productId} does not exist`
            })
        }

        const images = product.images || []
        const fileToDelete = images.find(img => img.url === fileUrl)

        if (!fileToDelete) {
            return res.status(404).json({
                error: 'File not found',
                message: 'The specified file does not exist for this product'
            })
        }

        // Delete file from filesystem
        const filename = path.basename(fileUrl)
        deleteFile(filename)

        // Remove from images array
        product.images = images.filter(img => img.url !== fileUrl)

        // If deleted file was primary image, set new primary
        if (product.primaryImage === fileUrl) {
            const remainingImages = product.images.filter(img => img.type === 'image')
            product.primaryImage = remainingImages.length > 0 ? remainingImages[0].url : null
        }

        await product.save()

        res.json({
            message: 'File deleted successfully',
            product: product.toJSON()
        })
    } catch (error) {
        console.error('Delete media error:', error)
        res.status(500).json({
            error: 'Failed to delete file',
            message: error.message
        })
    }
}
