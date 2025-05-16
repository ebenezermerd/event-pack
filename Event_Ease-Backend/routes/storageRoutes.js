// routes/storageRoutes.js
const express = require("express")
const router = express.Router()
const storageController = require("../controllers/storageController")
const { userAuth } = require("../middleware/authMiddleware")

// Apply authentication middleware to all routes
router.use(userAuth)

// File upload routes
router.post("/files", storageController.uploadMiddleware, storageController.uploadFile)
router.get("/files/:id", storageController.getFile)
router.delete("/files/:id", storageController.deleteFile)

// Direct upload routes
router.post("/files/upload-url", storageController.generateUploadUrl)
router.put("/files/:id/status", storageController.updateFileUpload)

module.exports = router
