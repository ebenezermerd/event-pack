// services/recommendation.service.js
const { v4: uuidv4 } = require("uuid")
const { Op, Sequelize } = require("sequelize")
const recommendationConfig = require("../config/recommendation.config")
const Event = require("../models/event")
const User = require("../models/user")
const UserEventInteraction = require("../models/userEventInteraction")
const SavedEvent = require("../models/savedEvent")
const Order = require("../models/order")
const OrderItem = require("../models/orderItem")
const Organizer = require("../models/organizer")

class RecommendationService {
  /**
   * Get user recommendations
   * @param {Object} params - Query parameters
   * @param {Object} user - User object
   * @returns {Array} Recommendations
   */
  async getUserRecommendations(params, user) {
    try {
      const { limit = 6, type = "event" } = params

      // Get user preferences
      const preferences = user.preferences || {}

      // Get user interactions to determine interests
      const userInteractions = await UserEventInteraction.findAll({
        where: { userId: user.id },
        include: [
          {
            model: Event,
            attributes: ["id", "category", "organizerId"],
          },
        ],
      })

      // Count interactions by category
      const categoryInteractions = {}
      const organizerInteractions = {}

      userInteractions.forEach((interaction) => {
        if (!interaction.Event) return

        const category = interaction.Event.category
        const organizerId = interaction.Event.organizerId
        const weight = recommendationConfig.interactions[interaction.interactionType] || 0.1

        categoryInteractions[category] = (categoryInteractions[category] || 0) + weight
        organizerInteractions[organizerId] = (organizerInteractions[organizerId] || 0) + weight
      })

      // Get preferred categories from interactions and preferences
      const preferredCategories = [
        ...Object.keys(categoryInteractions).sort((a, b) => categoryInteractions[b] - categoryInteractions[a]),
        ...(preferences.categories || []),
      ]

      // Get preferred organizers from interactions
      const preferredOrganizers = Object.keys(organizerInteractions).sort(
        (a, b) => organizerInteractions[b] - organizerInteractions[a],
      )

      // Get preferred locations from preferences
      const preferredLocations = preferences.locations || []

      // Get events the user has already attended
      const attendedEventIds = await this.getAttendedEventIds(user.id)

      // Get events the user has saved
      const savedEventIds = await this.getSavedEventIds(user.id)

      // Build where clause for events
      const whereClause = {
        status: "published",
        eventDate: { [Op.gte]: new Date() },
        id: { [Op.notIn]: attendedEventIds },
      }

      // If we have preferred categories, use them
      if (preferredCategories.length > 0) {
        whereClause.category = { [Op.in]: preferredCategories }
      }

      // Get upcoming events
      const events = await Event.findAll({
        where: whereClause,
        include: [
          {
            model: Organizer,
            attributes: ["id", "companyName", "logo"],
          },
        ],
        order: [["eventDate", "ASC"]],
        limit: Number.parseInt(limit) * 3, // Get more events than needed for scoring
      })

      // Score and rank events
      const scoredEvents = events.map((event) => {
        let score = 0

        // Category match
        const categoryIndex = preferredCategories.indexOf(event.category)
        if (categoryIndex !== -1) {
          score += recommendationConfig.factors.categoryMatch * (1 - categoryIndex / preferredCategories.length)
        }

        // Location match
        if (preferredLocations.includes(event.location)) {
          score += recommendationConfig.factors.locationMatch
        }

        // Organizer match
        const organizerIndex = preferredOrganizers.indexOf(event.organizerId)
        if (organizerIndex !== -1) {
          score += recommendationConfig.factors.pastAttendance * (1 - organizerIndex / preferredOrganizers.length)
        }

        // Saved event
        if (savedEventIds.includes(event.id)) {
          score += recommendationConfig.factors.savedEvents
        }

        // Popularity (attendees)
        const popularity = Math.min(event.attendees / 100, 1)
        score += recommendationConfig.factors.popularity * popularity

        // Apply freshness decay if enabled
        if (recommendationConfig.freshness.enabled) {
          const eventDate = new Date(event.eventDate)
          const now = new Date()
          const daysUntilEvent = Math.max(0, (eventDate - now) / (1000 * 60 * 60 * 24))

          if (daysUntilEvent > recommendationConfig.freshness.maxAgeDays) {
            score = 0
          } else {
            const decay = Math.pow(0.5, daysUntilEvent / recommendationConfig.freshness.halfLifeDays)
            score *= decay
          }
        }

        return {
          event,
          score,
        }
      })

      // Sort by score
      scoredEvents.sort((a, b) => b.score - a.score)

      // Apply diversity if enabled
      let recommendations = []

      if (recommendationConfig.diversity.enabled) {
        const seenCategories = new Set()
        const seenOrganizers = new Set()

        for (const { event, score } of scoredEvents) {
          let diversityScore = score

          // Apply category penalty
          if (seenCategories.has(event.category)) {
            diversityScore *= 1 - recommendationConfig.diversity.categoryPenalty
          }

          // Apply organizer penalty
          if (seenOrganizers.has(event.organizerId)) {
            diversityScore *= 1 - recommendationConfig.diversity.organizerPenalty
          }

          // Add to recommendations if score is above threshold
          if (diversityScore >= recommendationConfig.types[type].minScore) {
            recommendations.push({
              id: event.id,
              title: event.title,
              date: event.eventDate,
              location: event.location,
              price: event.price,
              category: event.category,
              image: event.image,
              organizer: event.Organizer
                ? {
                    id: event.Organizer.id,
                    name: event.Organizer.companyName,
                    logo: event.Organizer.logo,
                  }
                : null,
              matchScore: diversityScore,
              matchReason: this.getMatchReason(event, preferredCategories, preferredLocations, preferredOrganizers),
            })

            seenCategories.add(event.category)
            seenOrganizers.add(event.organizerId)

            // Stop if we have enough recommendations
            if (recommendations.length >= Number.parseInt(limit)) {
              break
            }
          }
        }
      } else {
        // Just take the top scoring events
        recommendations = scoredEvents
          .filter(({ score }) => score >= recommendationConfig.types[type].minScore)
          .slice(0, Number.parseInt(limit))
          .map(({ event, score }) => ({
            id: event.id,
            title: event.title,
            date: event.eventDate,
            location: event.location,
            price: event.price,
            category: event.category,
            image: event.image,
            organizer: event.Organizer
              ? {
                  id: event.Organizer.id,
                  name: event.Organizer.companyName,
                  logo: event.Organizer.logo,
                }
              : null,
            matchScore: score,
            matchReason: this.getMatchReason(event, preferredCategories, preferredLocations, preferredOrganizers),
          }))
      }

      return {
        success: true,
        recommendations,
      }
    } catch (error) {
      console.error("Error getting user recommendations:", error)
      throw error
    }
  }

  /**
   * Get match reason
   * @param {Object} event - Event object
   * @param {Array} preferredCategories - Preferred categories
   * @param {Array} preferredLocations - Preferred locations
   * @param {Array} preferredOrganizers - Preferred organizers
   * @returns {String} Match reason
   */
  getMatchReason(event, preferredCategories, preferredLocations, preferredOrganizers) {
    if (preferredCategories.includes(event.category)) {
      return `Based on your interest in ${event.category} events`
    }

    if (preferredLocations.includes(event.location)) {
      return `Based on your interest in events in ${event.location}`
    }

    if (preferredOrganizers.includes(event.organizerId)) {
      return `Based on your interest in events by this organizer`
    }

    return "You might be interested in this event"
  }

  /**
   * Get attended event IDs
   * @param {String} userId - User ID
   * @returns {Array} Attended event IDs
   */
  async getAttendedEventIds(userId) {
    try {
      const orders = await Order.findAll({
        where: {
          userId,
          status: { [Op.in]: ["completed", "pending"] },
        },
        attributes: ["eventId"],
      })

      return orders.map((order) => order.eventId)
    } catch (error) {
      console.error("Error getting attended event IDs:", error)
      return []
    }
  }

  /**
   * Get saved event IDs
   * @param {String} userId - User ID
   * @returns {Array} Saved event IDs
   */
  async getSavedEventIds(userId) {
    try {
      const savedEvents = await SavedEvent.findAll({
        where: { userId },
        attributes: ["eventId"],
      })

      return savedEvents.map((savedEvent) => savedEvent.eventId)
    } catch (error) {
      console.error("Error getting saved event IDs:", error)
      return []
    }
  }

  /**
   * Log user event interaction
   * @param {Object} interactionData - Interaction data
   * @param {Object} user - User object
   * @returns {Object} Created interaction
   */
  async logUserEventInteraction(interactionData, user) {
    try {
      const { eventId, interactionType, data } = interactionData

      // Validate interaction type
      const validInteractionTypes = Object.keys(recommendationConfig.interactions)

      if (!validInteractionTypes.includes(interactionType)) {
        throw new Error(`Invalid interaction type: ${interactionType}`)
      }

      // Check if event exists
      const event = await Event.findByPk(eventId)

      if (!event) {
        throw new Error("Event not found")
      }

      // Create interaction
      const interaction = await UserEventInteraction.create({
        id: uuidv4(),
        userId: user.id,
        eventId,
        interactionType,
        interactionDate: new Date(),
        data,
      })

      return {
        success: true,
        interaction,
      }
    } catch (error) {
      console.error("Error logging user event interaction:", error)
      throw error
    }
  }

  /**
   * Update user preferences
   * @param {Object} preferencesData - Preferences data
   * @param {Object} user - User object
   * @returns {Object} Updated preferences
   */
  async updateUserPreferences(preferencesData, user) {
    try {
      const { categories, locations, calendarSync } = preferencesData

      // Get current preferences or initialize
      const preferences = user.preferences || {}

      // Update preferences
      if (categories !== undefined) {
        preferences.categories = categories
      }

      if (locations !== undefined) {
        preferences.locations = locations
      }

      if (calendarSync !== undefined) {
        preferences.calendarSync = calendarSync
      }

      // Save preferences
      await user.update({ preferences })

      return {
        success: true,
        message: "Preferences updated successfully",
        preferences,
      }
    } catch (error) {
      console.error("Error updating user preferences:", error)
      throw error
    }
  }

  /**
   * Get user preferences
   * @param {Object} user - User object
   * @returns {Object} User preferences
   */
  async getUserPreferences(user) {
    try {
      return {
        success: true,
        preferences: user.preferences || {},
      }
    } catch (error) {
      console.error("Error getting user preferences:", error)
      throw error
    }
  }

  /**
   * Get event categories
   * @returns {Array} Event categories
   */
  async getEventCategories() {
    try {
      const categories = await Event.findAll({
        attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("category")), "category"]],
        where: {
          category: { [Op.ne]: null },
        },
        raw: true,
      })

      return {
        success: true,
        categories: categories.map((c) => c.category).sort(),
      }
    } catch (error) {
      console.error("Error getting event categories:", error)
      throw error
    }
  }

  /**
   * Get event locations
   * @returns {Array} Event locations
   */
  async getEventLocations() {
    try {
      const locations = await Event.findAll({
        attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("location")), "location"]],
        where: {
          location: { [Op.ne]: null },
        },
        raw: true,
      })

      return {
        success: true,
        locations: locations.map((l) => l.location).sort(),
      }
    } catch (error) {
      console.error("Error getting event locations:", error)
      throw error
    }
  }
}

module.exports = new RecommendationService()
