// routes/recommendationRoutes.js
const express = require("express")
const router = express.Router()
const recommendationController = require("../controllers/recommendationController")
const { userAuth } = require("../middleware/authMiddleware")

// Apply authentication middleware to all routes
router.use(userAuth)

// Recommendation routes
router.get("/recommendations", recommendationController.getUserRecommendations)
router.post("/event-interactions", recommendationController.logUserEventInteraction)

// User preferences routes
router.get("/preferences", recommendationController.getUserPreferences)
router.put("/preferences", recommendationController.updateUserPreferences)

// Metadata routes
router.get("/event-categories", recommendationController.getEventCategories)
router.get("/event-locations", recommendationController.getEventLocations)

module.exports = router
