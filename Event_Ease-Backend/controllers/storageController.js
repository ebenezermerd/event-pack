// controllers/storageController.js
const storageService = require("../services/storage.service")
const multer = require("multer")
const upload = multer({ storage: multer.memoryStorage() })

// Upload file middleware
exports.uploadMiddleware = upload.single("file")

// Upload file
exports.uploadFile = async (req, res) => {
  try {
    const { fileType } = req.body
    const options = {
      resize: req.body.resize,
      provider: req.body.provider,
      metadata: req.body.metadata ? JSON.parse(req.body.metadata) : {},
    }
    const user = req.user

    const result = await storageService.uploadFile(req.file, fileType, options, user)

    res.status(201).json(result)
  } catch (error) {
    console.error("Upload file error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get file
exports.getFile = async (req, res) => {
  try {
    const { id } = req.params

    const result = await storageService.getFile(id)

    res.status(200).json(result)
  } catch (error) {
    console.error("Get file error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Delete file
exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params
    const user = req.user

    const result = await storageService.deleteFile(id, user)

    res.status(200).json(result)
  } catch (error) {
    console.error("Delete file error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Generate upload URL
exports.generateUploadUrl = async (req, res) => {
  try {
    const { fileType, filename } = req.body
    const options = req.body.options || {}
    const user = req.user

    const result = await storageService.generateUploadUrl(fileType, filename, options, user)

    res.status(200).json(result)
  } catch (error) {
    console.error("Generate upload URL error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Update file upload status
exports.updateFileUpload = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const result = await storageService.updateFileUpload(id, updateData)

    res.status(200).json(result)
  } catch (error) {
    console.error("Update file upload error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
