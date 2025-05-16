// routes/aiRoutes.js
const express = require("express")
const router = express.Router()
const { body, query, param } = require("express-validator")
const aiController = require("../controllers/aiController")
const { userAuth, checkRole } = require("../middleware/authMiddleware")
const aiConfig = require("../config/ai.config")

// Validation middleware
const validateGenerateEvent = [
  body("eventType")
    .isString()
    .isIn(aiConfig.templates.eventTypes)
    .withMessage(`Event type must be one of: ${aiConfig.templates.eventTypes.join(", ")}`),
  body("topic")
    .optional()
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage("Topic must be between 2 and 100 characters"),
  body("location")
    .optional()
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage("Location must be between 2 and 100 characters"),
  body("targetAudience")
    .optional()
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage("Target audience must be between 2 and 100 characters"),
  body("additionalDetails")
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage("Additional details must be less than 500 characters"),
]

const validateGenerateImage = [
  body("prompt")
    .isString()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Prompt must be between 10 and 1000 characters"),
  body("size")
    .optional()
    .isString()
    .isIn(["256x256", "512x512", "1024x1024"])
    .withMessage("Size must be one of: 256x256, 512x512, 1024x1024"),
  body("eventType")
    .optional()
    .isString()
    .isIn(aiConfig.templates.eventTypes)
    .withMessage(`Event type must be one of: ${aiConfig.templates.eventTypes.join(", ")}`),
  body("additionalDetails")
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage("Additional details must be less than 500 characters"),
]

const validateSaveTemplate = [
  body("name").isString().isLength({ min: 3, max: 100 }).withMessage("Name must be between 3 and 100 characters"),
  body("eventType")
    .isString()
    .isIn(aiConfig.templates.eventTypes)
    .withMessage(`Event type must be one of: ${aiConfig.templates.eventTypes.join(", ")}`),
  body("template").isObject().withMessage("Template must be an object"),
]

// AI routes
router.post(
  "/organizers/events/generate",
  userAuth,
  checkRole(["organizer", "admin"]),
  validateGenerateEvent,
  aiController.generateEventContent,
)

router.post(
  "/organizers/events/generate-image",
  userAuth,
  checkRole(["organizer", "admin"]),
  validateGenerateImage,
  aiController.generateEventImage,
)

router.post(
  "/organizers/templates",
  userAuth,
  checkRole(["organizer", "admin"]),
  validateSaveTemplate,
  aiController.saveEventTemplate,
)

router.get("/organizers/templates", userAuth, checkRole(["organizer", "admin"]), aiController.getEventTemplates)

router.get(
  "/organizers/templates/:id",
  userAuth,
  checkRole(["organizer", "admin"]),
  param("id").isUUID().withMessage("Invalid template ID"),
  aiController.getEventTemplateById,
)

router.delete(
  "/organizers/templates/:id",
  userAuth,
  checkRole(["organizer", "admin"]),
  param("id").isUUID().withMessage("Invalid template ID"),
  aiController.deleteEventTemplate,
)

router.get(
  "/organizers/ai/logs",
  userAuth,
  checkRole(["organizer", "admin"]),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  query("status")
    .optional()
    .isIn(["pending", "success", "error"])
    .withMessage("Status must be one of: pending, success, error"),
  aiController.getAIGenerationLogs,
)

router.get(
  "/organizers/ai/logs/:id",
  userAuth,
  checkRole(["organizer", "admin"]),
  param("id").isUUID().withMessage("Invalid log ID"),
  aiController.getAIGenerationLogById,
)

router.get("/organizers/ai/event-types", userAuth, aiController.getEventTypes)

router.get("/organizers/ai/usage", userAuth, checkRole(["organizer", "admin"]), aiController.getAIUsageStatistics)

module.exports = router
