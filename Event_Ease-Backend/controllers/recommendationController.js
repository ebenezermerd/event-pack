// controllers/recommendationController.js
const recommendationService = require("../services/recommendation.service")

// Get user recommendations
exports.getUserRecommendations = async (req, res) => {
  try {
    const params = req.query
    const user = req.user

    const result = await recommendationService.getUserRecommendations(params, user)

    res.status(200).json(result)
  } catch (error) {
    console.error("Get user recommendations error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Log user event interaction
exports.logUserEventInteraction = async (req, res) => {
  try {
    const interactionData = req.body
    const user = req.user

    const result = await recommendationService.logUserEventInteraction(interactionData, user)

    res.status(201).json(result)
  } catch (error) {
    console.error("Log user event interaction error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Update user preferences
exports.updateUserPreferences = async (req, res) => {
  try {
    const preferencesData = req.body
    const user = req.user

    const result = await recommendationService.updateUserPreferences(preferencesData, user)

    res.status(200).json(result)
  } catch (error) {
    console.error("Update user preferences error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get user preferences
exports.getUserPreferences = async (req, res) => {
  try {
    const user = req.user

    const result = await recommendationService.getUserPreferences(user)

    res.status(200).json(result)
  } catch (error) {
    console.error("Get user preferences error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get event categories
exports.getEventCategories = async (req, res) => {
  try {
    const result = await recommendationService.getEventCategories()

    res.status(200).json(result)
  } catch (error) {
    console.error("Get event categories error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get event locations
exports.getEventLocations = async (req, res) => {
  try {
    const result = await recommendationService.getEventLocations()

    res.status(200).json(result)
  } catch (error) {
    console.error("Get event locations error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
