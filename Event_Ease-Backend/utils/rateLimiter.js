// utils/rateLimiter.js
const { v4: uuidv4 } = require("uuid")
const { Op } = require("sequelize")
const AIGenerationLog = require("../models/aiGenerationLog")
const aiConfig = require("../config/ai.config")

class RateLimiter {
  constructor(config) {
    this.config = config
  }

  /**
   * Check if user has exceeded rate limits
   * @param {String} userId - User ID
   * @param {String} tier - Subscription tier
   * @returns {Boolean} Whether user can proceed
   */
  async checkRateLimit(userId, tier = "free") {
    if (!this.config.enabled) {
      return true
    }

    try {
      // Get max requests per hour for user's tier
      const maxRequestsPerHour = this.config.maxRequestsPerHour[tier] || this.config.maxRequestsPerHour.free

      // Get max tokens per day for user's tier
      const maxTokensPerDay = this.config.maxTokensPerDay[tier] || this.config.maxTokensPerDay.free

      // Check hourly request limit
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
      const hourlyRequestCount = await AIGenerationLog.count({
        where: {
          userId,
          createdAt: { [Op.gte]: hourAgo },
        },
      })

      if (hourlyRequestCount >= maxRequestsPerHour) {
        throw new Error(
          `You have reached the maximum of ${maxRequestsPerHour} AI requests per hour for your plan. Please try again later or upgrade your subscription.`,
        )
      }

      // Check daily token limit
      const dayStart = new Date()
      dayStart.setHours(0, 0, 0, 0)

      const dailyTokenUsage =
        (await AIGenerationLog.sum("tokensUsed", {
          where: {
            userId,
            createdAt: { [Op.gte]: dayStart },
            tokensUsed: { [Op.ne]: null },
          },
        })) || 0

      if (dailyTokenUsage >= maxTokensPerDay) {
        throw new Error(
          `You have reached the maximum of ${maxTokensPerDay} AI tokens per day for your plan. Please try again tomorrow or upgrade your subscription.`,
        )
      }

      return true
    } catch (error) {
      if (error.message.includes("maximum")) {
        // This is a rate limit error, not a system error
        throw error
      }

      console.error("Error checking rate limits:", error)
      // If there's an error checking rate limits, allow the request to proceed
      return true
    }
  }
}

module.exports = RateLimiter
