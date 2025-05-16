// controllers/aiController.js
const { v4: uuidv4 } = require("uuid")
const aiService = require("../services/ai-service")
const EventTemplate = require("../models/eventTemplate")
const AIGenerationLog = require("../models/aiGenerationLog")
const { validationResult } = require("express-validator")

// Generate event content
exports.generateEventContent = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      })
    }

    const { eventType, topic, location, targetAudience, additionalDetails } = req.body
    const user = req.user
    
    // Add this line to declare logId
    let logId

    // Generate event content
    const result = await aiService.generateEventContent(
      { eventType, topic, location, targetAudience, additionalDetails },
      user,
    )

    res.status(200).json({
      success: true,
      eventTemplate: result.eventTemplate,
      logId: result.logId,
    })
  } catch (error) {
    console.error("Error generating event content:", error)
    res.status(error.message.includes("rate limit") ? 429 : 500).json({
      success: false,
      message: error.message,
    })
  }
}

// Generate image for event
exports.generateEventImage = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      })
    }

    const { prompt, size, eventType, additionalDetails } = req.body
    const user = req.user

    // Generate image
    const result = await aiService.generateEventImage({ prompt, size, eventType, additionalDetails }, user)

    res.status(200).json({
      success: true,
      imageUrl: result.imageUrl,
      logId: result.logId,
    })
  } catch (error) {
    console.error("Error generating event image:", error)
    res.status(error.message.includes("rate limit") ? 429 : 500).json({
      success: false,
      message: error.message,
    })
  }
}

// Save event template
exports.saveEventTemplate = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      })
    }

    const { name, eventType, template } = req.body
    const user = req.user

    // Save template
    const result = await aiService.saveEventTemplate({ name, eventType, template }, user)

    res.status(201).json({
      success: true,
      message: "Template saved successfully",
      templateId: result.templateId,
    })
  } catch (error) {
    console.error("Error saving event template:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get event templates
exports.getEventTemplates = async (req, res) => {
  try {
    const user = req.user

    // Get templates
    const result = await aiService.getEventTemplates(user)

    res.status(200).json({
      success: true,
      templates: result.templates,
    })
  } catch (error) {
    console.error("Error getting event templates:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get event template by ID
exports.getEventTemplateById = async (req, res) => {
  try {
    const { id } = req.params
    const user = req.user

    // Get template
    const result = await aiService.getEventTemplateById(id, user)

    res.status(200).json({
      success: true,
      template: result.template,
    })
  } catch (error) {
    console.error("Error getting event template:", error)
    res.status(error.message.includes("not found") ? 404 : 500).json({
      success: false,
      message: error.message,
    })
  }
}

// Delete event template
exports.deleteEventTemplate = async (req, res) => {
  try {
    const { id } = req.params
    const user = req.user

    // Delete template
    await aiService.deleteEventTemplate(id, user)

    res.status(200).json({
      success: true,
      message: "Template deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting event template:", error)
    res.status(error.message.includes("not found") ? 404 : 500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get AI generation logs
exports.getAIGenerationLogs = async (req, res) => {
  try {
    const { page, limit, status } = req.query
    const user = req.user

    // Get logs
    const result = await aiService.getAIGenerationLogs(user, { page, limit, status })

    res.status(200).json({
      success: true,
      logs: result.logs,
      pagination: result.pagination,
    })
  } catch (error) {
    console.error("Error getting AI generation logs:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get AI generation log by ID
exports.getAIGenerationLogById = async (req, res) => {
  try {
    const { id } = req.params
    const user = req.user

    // Get log
    const result = await aiService.getAIGenerationLogById(id, user)

    res.status(200).json({
      success: true,
      log: result.log,
    })
  } catch (error) {
    console.error("Error getting AI generation log:", error)
    res.status(error.message.includes("not found") ? 404 : 500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get event types
exports.getEventTypes = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      eventTypes: require("../config/ai.config").templates.eventTypes,
    })
  } catch (error) {
    console.error("Error getting event types:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get AI usage statistics
exports.getAIUsageStatistics = async (req, res) => {
  try {
    const user = req.user

    // Get today's date (start of day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get start of current hour
    const currentHour = new Date()
    currentHour.setMinutes(0, 0, 0)

    // Get start of current month
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    // Get daily usage
    const dailyUsage = await AIGenerationLog.count({
      where: {
        userId: user.id,
        createdAt: { [Op.gte]: today },
      },
    })

    // Get hourly usage
    const hourlyUsage = await AIGenerationLog.count({
      where: {
        userId: user.id,
        createdAt: { [Op.gte]: currentHour },
      },
    })

    // Get monthly usage
    const monthlyUsage = await AIGenerationLog.count({
      where: {
        userId: user.id,
        createdAt: { [Op.gte]: currentMonth },
      },
    })

    // Get total token usage for today
    const dailyTokens =
      (await AIGenerationLog.sum("tokensUsed", {
        where: {
          userId: user.id,
          createdAt: { [Op.gte]: today },
          tokensUsed: { [Op.ne]: null },
        },
      })) || 0

    // Get total token usage for month
    const monthlyTokens =
      (await AIGenerationLog.sum("tokensUsed", {
        where: {
          userId: user.id,
          createdAt: { [Op.gte]: currentMonth },
          tokensUsed: { [Op.ne]: null },
        },
      })) || 0

    // Get user's subscription tier
    const tier = user.subscription || "free"

    // Get limits for user's tier
    const limits = {
      hourlyRequests: require("../config/ai.config").rateLimit.maxRequestsPerHour[tier],
      dailyTokens: require("../config/ai.config").rateLimit.maxTokensPerDay[tier],
    }

    res.status(200).json({
      success: true,
      usage: {
        hourly: {
          requests: hourlyUsage,
          limit: limits.hourlyRequests,
          remaining: limits.hourlyRequests - hourlyUsage,
        },
        daily: {
          requests: dailyUsage,
          tokens: dailyTokens,
          tokenLimit: limits.dailyTokens,
          tokenRemaining: limits.dailyTokens - dailyTokens,
        },
        monthly: {
          requests: monthlyUsage,
          tokens: monthlyTokens,
        },
      },
    })
  } catch (error) {
    console.error("Error getting AI usage statistics:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
