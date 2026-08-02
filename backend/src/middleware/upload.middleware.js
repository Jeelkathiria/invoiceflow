import multer from 'multer'
import path from 'path'

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|png|jpg|jpeg/
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimeType = allowedTypes.test(file.mimetype)

  if (extName && mimeType) {
    return cb(null, true)
  }
  cb(new Error('Only PDF, PNG, JPG, and JPEG document files are supported'))
}

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter,
})
