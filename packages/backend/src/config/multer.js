import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads/products')
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir)
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const ext = path.extname(file.originalname)
        cb(null, `product-${uniqueSuffix}${ext}`)
    }
})

// File filter
const fileFilter = (req, file, cb) => {
    const allowedImageTypes = /jpeg|jpg|png|gif|webp/
    const allowedVideoTypes = /mp4|mov|avi|webm/
    const allowedSpreadsheetExts = /csv|xls|xlsx/
    const allowedSpreadsheetMimes = [
        'text/csv',
        'application/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]

    const extname = path.extname(file.originalname).toLowerCase().replace('.', '')
    const mimetype = (file.mimetype || '').toLowerCase()

    const isImage = allowedImageTypes.test(extname)
    const isVideo = allowedVideoTypes.test(extname)
    const isSpreadsheet = allowedSpreadsheetExts.test(extname) || allowedSpreadsheetMimes.includes(mimetype)

    // Allow spreadsheets only for the import endpoint (field name 'file')
    if (isImage || isVideo || (isSpreadsheet && file.fieldname === 'file')) {
        cb(null, true)
    } else {
        cb(new Error('Only image files (JPEG, PNG, GIF, WEBP) and video files (MP4, MOV, AVI, WEBM) are allowed. CSV/XLS/XLSX are allowed for imports.'))
    }
}

// Configure multer
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
})

// Helper to delete file
export const deleteFile = (filepath) => {
    try {
        const fullPath = path.join(__dirname, '../../uploads/products', path.basename(filepath))
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath)
            return true
        }
    } catch (error) {
        console.error('Error deleting file:', error)
    }
    return false
}
