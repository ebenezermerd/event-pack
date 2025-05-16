// services/calendar.service.js
const { v4: uuidv4 } = require("uuid")
const { google } = require("googleapis")
const { Client } = require("@microsoft/microsoft-graph-client")
const ical = require("ical-generator")
const fs = require("fs")
const path = require("path")
const axios = require("axios")
const calendarConfig = require("../config/calendar.config")
const Calendar = require("../models/calendar")
const CalendarEvent = require("../models/calendarEvent")
const Event = require("../models/event")
const EventReminder = require("../models/eventReminder")
const User = require("../models/user")
const Notification = require("../models/notification")
const { Op } = require("sequelize")

class CalendarService {
  /**
   * Create a new calendar for a user
   * @param {Object} calendarData - Calendar data
   * @param {Object} user - User object
   * @returns {Object} Created calendar
   */
  async createCalendar(calendarData, user) {
    try {
      const { name, color, isDefault } = calendarData

      // If setting as default, update existing default calendar
      if (isDefault) {
        await Calendar.update({ isDefault: false }, { where: { userId: user.id, isDefault: true } })
      }

      // Create calendar
      const calendar = await Calendar.create({
        id: uuidv4(),
        userId: user.id,
        name: name || calendarConfig.defaults.defaultCalendarName,
        color: color || calendarConfig.defaults.defaultCalendarColor,
        isDefault: isDefault || false,
      })

      return {
        success: true,
        calendar,
      }
    } catch (error) {
      console.error("Error creating calendar:", error)
      throw error
    }
  }

  /**
   * Get user calendars
   * @param {Object} user - User object
   * @returns {Array} User calendars
   */
  async getUserCalendars(user) {
    try {
      const calendars = await Calendar.findAll({
        where: { userId: user.id },
        order: [
          ["isDefault", "DESC"],
          ["name", "ASC"],
        ],
      })

      return {
        success: true,
        calendars,
      }
    } catch (error) {
      console.error("Error getting user calendars:", error)
      throw error
    }
  }

  /**
   * Update calendar
   * @param {String} id - Calendar ID
   * @param {Object} calendarData - Calendar data
   * @param {Object} user - User object
   * @returns {Object} Updated calendar
   */
  async updateCalendar(id, calendarData, user) {
    try {
      const { name, color, isDefault } = calendarData

      // Find calendar
      const calendar = await Calendar.findOne({
        where: { id, userId: user.id },
      })

      if (!calendar) {
        throw new Error("Calendar not found")
      }

      // If setting as default, update existing default calendar
      if (isDefault && !calendar.isDefault) {
        await Calendar.update({ isDefault: false }, { where: { userId: user.id, isDefault: true } })
      }

      // Update calendar
      await calendar.update({
        name: name || calendar.name,
        color: color || calendar.color,
        isDefault: isDefault !== undefined ? isDefault : calendar.isDefault,
      })

      return {
        success: true,
        calendar,
      }
    } catch (error) {
      console.error("Error updating calendar:", error)
      throw error
    }
  }

  /**
   * Delete calendar
   * @param {String} id - Calendar ID
   * @param {Object} user - User object
   * @returns {Object} Result
   */
  async deleteCalendar(id, user) {
    try {
      // Find calendar
      const calendar = await Calendar.findOne({
        where: { id, userId: user.id },
      })

      if (!calendar) {
        throw new Error("Calendar not found")
      }

      // Check if it's the default calendar
      if (calendar.isDefault) {
        throw new Error("Cannot delete the default calendar")
      }

      // Delete calendar events
      await CalendarEvent.destroy({
        where: { calendarId: id },
      })

      // Delete calendar
      await calendar.destroy()

      return {
        success: true,
        message: "Calendar deleted successfully",
      }
    } catch (error) {
      console.error("Error deleting calendar:", error)
      throw error
    }
  }

  /**
   * Create calendar event
   * @param {Object} eventData - Event data
   * @param {Object} user - User object
   * @returns {Object} Created event
   */
  async createCalendarEvent(eventData, user) {
    try {
      const { calendarId, eventId, title, description, startDate, endDate, location, isAllDay, recurrence, reminder } =
        eventData

      // Check if calendar exists and belongs to user
      const calendar = await Calendar.findOne({
        where: { id: calendarId, userId: user.id },
      })

      if (!calendar) {
        throw new Error("Calendar not found")
      }

      // If eventId is provided, check if event exists
      let event = null
      if (eventId) {
        event = await Event.findByPk(eventId)
        if (!event) {
          throw new Error("Event not found")
        }
      }

      // Create calendar event
      const calendarEvent = await CalendarEvent.create({
        id: uuidv4(),
        calendarId,
        eventId,
        title,
        description,
        startDate,
        endDate,
        location,
        isAllDay: isAllDay || false,
        recurrence,
        reminder,
      })

      // If reminder is set, create event reminder
      if (reminder && eventId) {
        const reminderDate = new Date(startDate)
        reminderDate.setMinutes(reminderDate.getMinutes() - reminder)

        await EventReminder.create({
          id: uuidv4(),
          userId: user.id,
          eventId,
          reminderDate,
          reminderSent: false,
          reminderType: "email",
        })
      }

      // If calendar is connected to external provider, sync event
      if (calendar.externalCalendarId && calendar.externalCalendarType) {
        try {
          await this.syncEventToExternalCalendar(calendarEvent, calendar, user)
        } catch (syncError) {
          console.error("Error syncing event to external calendar:", syncError)
          // Continue even if sync fails
        }
      }

      return {
        success: true,
        calendarEvent,
      }
    } catch (error) {
      console.error("Error creating calendar event:", error)
      throw error
    }
  }

  /**
   * Get calendar events
   * @param {Object} params - Query parameters
   * @param {Object} user - User object
   * @returns {Array} Calendar events
   */
  async getCalendarEvents(params, user) {
    try {
      const { calendarId, month, year, startDate, endDate } = params

      // Build where clause for calendars
      const calendarWhereClause = { userId: user.id }

      if (calendarId) {
        calendarWhereClause.id = calendarId
      }

      // Get user calendars
      const calendars = await Calendar.findAll({
        where: calendarWhereClause,
      })

      if (calendars.length === 0) {
        return {
          success: true,
          events: [],
        }
      }

      const calendarIds = calendars.map((calendar) => calendar.id)

      // Build where clause for events
      const eventWhereClause = {
        calendarId: { [Op.in]: calendarIds },
      }

      // Handle date filtering
      if (startDate && endDate) {
        eventWhereClause[Op.or] = [
          {
            startDate: { [Op.between]: [new Date(startDate), new Date(endDate)] },
          },
          {
            endDate: { [Op.between]: [new Date(startDate), new Date(endDate)] },
          },
          {
            [Op.and]: [{ startDate: { [Op.lte]: new Date(startDate) } }, { endDate: { [Op.gte]: new Date(endDate) } }],
          },
        ]
      } else if (month && year) {
        const startOfMonth = new Date(year, month - 1, 1)
        const endOfMonth = new Date(year, month, 0, 23, 59, 59)

        eventWhereClause[Op.or] = [
          {
            startDate: { [Op.between]: [startOfMonth, endOfMonth] },
          },
          {
            endDate: { [Op.between]: [startOfMonth, endOfMonth] },
          },
          {
            [Op.and]: [{ startDate: { [Op.lte]: startOfMonth } }, { endDate: { [Op.gte]: endOfMonth } }],
          },
        ]
      }

      // Get calendar events
      const events = await CalendarEvent.findAll({
        where: eventWhereClause,
        include: [
          {
            model: Calendar,
            attributes: ["name", "color"],
          },
          {
            model: Event,
            attributes: ["id", "title", "location", "image"],
            required: false,
          },
        ],
        order: [["startDate", "ASC"]],
      })

      // Format events
      const formattedEvents = events.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        isAllDay: event.isAllDay,
        recurrence: event.recurrence,
        reminder: event.reminder,
        calendarId: event.calendarId,
        calendarName: event.Calendar.name,
        calendarColor: event.Calendar.color,
        eventId: event.eventId,
        eventDetails: event.Event
          ? {
              id: event.Event.id,
              title: event.Event.title,
              location: event.Event.location,
              image: event.Event.image,
            }
          : null,
      }))

      return {
        success: true,
        events: formattedEvents,
      }
    } catch (error) {
      console.error("Error getting calendar events:", error)
      throw error
    }
  }

  /**
   * Update calendar event
   * @param {String} id - Event ID
   * @param {Object} eventData - Event data
   * @param {Object} user - User object
   * @returns {Object} Updated event
   */
  async updateCalendarEvent(id, eventData, user) {
    try {
      const { title, description, startDate, endDate, location, isAllDay, recurrence, reminder } = eventData

      // Find calendar event
      const calendarEvent = await CalendarEvent.findOne({
        where: { id },
        include: [
          {
            model: Calendar,
            where: { userId: user.id },
          },
        ],
      })

      if (!calendarEvent) {
        throw new Error("Calendar event not found")
      }

      // Update calendar event
      await calendarEvent.update({
        title: title || calendarEvent.title,
        description: description !== undefined ? description : calendarEvent.description,
        startDate: startDate || calendarEvent.startDate,
        endDate: endDate || calendarEvent.endDate,
        location: location !== undefined ? location : calendarEvent.location,
        isAllDay: isAllDay !== undefined ? isAllDay : calendarEvent.isAllDay,
        recurrence: recurrence !== undefined ? recurrence : calendarEvent.recurrence,
        reminder: reminder !== undefined ? reminder : calendarEvent.reminder,
      })

      // If reminder is updated and event is linked, update event reminder
      if (reminder !== undefined && calendarEvent.eventId) {
        // Delete existing reminder
        await EventReminder.destroy({
          where: {
            userId: user.id,
            eventId: calendarEvent.eventId,
          },
        })

        // Create new reminder if needed
        if (reminder) {
          const reminderDate = new Date(calendarEvent.startDate)
          reminderDate.setMinutes(reminderDate.getMinutes() - reminder)

          await EventReminder.create({
            id: uuidv4(),
            userId: user.id,
            eventId: calendarEvent.eventId,
            reminderDate,
            reminderSent: false,
            reminderType: "email",
          })
        }
      }

      // If calendar is connected to external provider, sync event
      if (calendarEvent.Calendar.externalCalendarId && calendarEvent.Calendar.externalCalendarType) {
        try {
          await this.syncEventToExternalCalendar(calendarEvent, calendarEvent.Calendar, user)
        } catch (syncError) {
          console.error("Error syncing event to external calendar:", syncError)
          // Continue even if sync fails
        }
      }

      return {
        success: true,
        calendarEvent,
      }
    } catch (error) {
      console.error("Error updating calendar event:", error)
      throw error
    }
  }

  /**
   * Delete calendar event
   * @param {String} id - Event ID
   * @param {Object} user - User object
   * @returns {Object} Result
   */
  async deleteCalendarEvent(id, user) {
    try {
      // Find calendar event
      const calendarEvent = await CalendarEvent.findOne({
        where: { id },
        include: [
          {
            model: Calendar,
            where: { userId: user.id },
          },
        ],
      })

      if (!calendarEvent) {
        throw new Error("Calendar event not found")
      }

      // If event is linked, delete event reminder
      if (calendarEvent.eventId) {
        await EventReminder.destroy({
          where: {
            userId: user.id,
            eventId: calendarEvent.eventId,
          },
        })
      }

      // If calendar is connected to external provider, delete event from external calendar
      if (calendarEvent.Calendar.externalCalendarId && calendarEvent.Calendar.externalCalendarType) {
        try {
          await this.deleteEventFromExternalCalendar(calendarEvent, calendarEvent.Calendar, user)
        } catch (syncError) {
          console.error("Error deleting event from external calendar:", syncError)
          // Continue even if sync fails
        }
      }

      // Delete calendar event
      await calendarEvent.destroy()

      return {
        success: true,
        message: "Calendar event deleted successfully",
      }
    } catch (error) {
      console.error("Error deleting calendar event:", error)
      throw error
    }
  }

  /**
   * Generate authorization URL for external calendar
   * @param {String} provider - Calendar provider
   * @param {Object} user - User object
   * @returns {String} Authorization URL
   */
  getAuthorizationUrl(provider, user) {
    try {
      switch (provider) {
        case "google":
          return this.getGoogleAuthUrl(user)
        case "outlook":
          return this.getOutlookAuthUrl(user)
        case "apple":
          return this.getAppleAuthUrl(user)
        default:
          throw new Error(`Unsupported calendar provider: ${provider}`)
      }
    } catch (error) {
      console.error("Error generating authorization URL:", error)
      throw error
    }
  }

  /**
   * Get Google Calendar authorization URL
   * @param {Object} user - User object
   * @returns {String} Authorization URL
   */
  getGoogleAuthUrl(user) {
    try {
      const config = calendarConfig.providers.google

      if (!config.enabled) {
        throw new Error("Google Calendar integration is not enabled")
      }

      const oauth2Client = new google.auth.OAuth2(config.clientId, config.clientSecret, config.redirectUri)

      const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: config.scopes,
        state: user.id, // Pass user ID in state parameter
      })

      return authUrl
    } catch (error) {
      console.error("Error generating Google authorization URL:", error)
      throw error
    }
  }

  /**
   * Get Outlook Calendar authorization URL
   * @param {Object} user - User object
   * @returns {String} Authorization URL
   */
  getOutlookAuthUrl(user) {
    try {
      const config = calendarConfig.providers.outlook

      if (!config.enabled) {
        throw new Error("Outlook Calendar integration is not enabled")
      }

      const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${config.clientId}&response_type=code&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_mode=query&scope=${encodeURIComponent(config.scopes.join(" "))}&state=${user.id}`

      return authUrl
    } catch (error) {
      console.error("Error generating Outlook authorization URL:", error)
      throw error
    }
  }

  /**
   * Get Apple Calendar authorization URL
   * @param {Object} user - User object
   * @returns {String} Authorization URL
   */
  getAppleAuthUrl(user) {
    try {
      const config = calendarConfig.providers.apple

      if (!config.enabled) {
        throw new Error("Apple Calendar integration is not enabled")
      }

      // Apple Calendar uses a different authentication flow
      // This is a simplified example
      const authUrl = `https://appleid.apple.com/auth/authorize?client_id=${config.teamId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_type=code&state=${user.id}&scope=name%20email`

      return authUrl
    } catch (error) {
      console.error("Error generating Apple authorization URL:", error)
      throw error
    }
  }

  /**
   * Handle OAuth callback
   * @param {String} provider - Calendar provider
   * @param {String} code - Authorization code
   * @param {String} userId - User ID
   * @returns {Object} Result
   */
  async handleOAuthCallback(provider, code, userId) {
    try {
      switch (provider) {
        case "google":
          return await this.handleGoogleCallback(code, userId)
        case "outlook":
          return await this.handleOutlookCallback(code, userId)
        case "apple":
          return await this.handleAppleCallback(code, userId)
        default:
          throw new Error(`Unsupported calendar provider: ${provider}`)
      }
    } catch (error) {
      console.error("Error handling OAuth callback:", error)
      throw error
    }
  }

  /**
   * Handle Google Calendar OAuth callback
   * @param {String} code - Authorization code
   * @param {String} userId - User ID
   * @returns {Object} Result
   */
  async handleGoogleCallback(code, userId) {
    try {
      const config = calendarConfig.providers.google

      if (!config.enabled) {
        throw new Error("Google Calendar integration is not enabled")
      }

      // Get user
      const user = await User.findByPk(userId)

      if (!user) {
        throw new Error("User not found")
      }

      // Exchange code for tokens
      const oauth2Client = new google.auth.OAuth2(config.clientId, config.clientSecret, config.redirectUri)

      const { tokens } = await oauth2Client.getToken(code)

      // Get primary calendar
      oauth2Client.setCredentials(tokens)
      const calendar = google.calendar({ version: "v3", auth: oauth2Client })

      const { data } = await calendar.calendarList.get({ calendarId: "primary" })

      // Check if user already has a Google Calendar
      const existingCalendar = await Calendar.findOne({
        where: {
          userId,
          externalCalendarType: "google",
        },
      })

      if (existingCalendar) {
        // Update existing calendar
        await existingCalendar.update({
          externalCalendarId: data.id,
          externalCalendarData: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiryDate: tokens.expiry_date,
          },
        })

        return {
          success: true,
          calendar: existingCalendar,
          message: "Google Calendar reconnected successfully",
        }
      } else {
        // Create new calendar
        const newCalendar = await Calendar.create({
          id: uuidv4(),
          userId,
          name: `Google: ${data.summary}`,
          color: data.backgroundColor || calendarConfig.defaults.defaultCalendarColor,
          isDefault: false,
          externalCalendarId: data.id,
          externalCalendarType: "google",
          externalCalendarData: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiryDate: tokens.expiry_date,
          },
        })

        return {
          success: true,
          calendar: newCalendar,
          message: "Google Calendar connected successfully",
        }
      }
    } catch (error) {
      console.error("Error handling Google callback:", error)
      throw error
    }
  }

  /**
   * Handle Outlook Calendar OAuth callback
   * @param {String} code - Authorization code
   * @param {String} userId - User ID
   * @returns {Object} Result
   */
  async handleOutlookCallback(code, userId) {
    try {
      const config = calendarConfig.providers.outlook

      if (!config.enabled) {
        throw new Error("Outlook Calendar integration is not enabled")
      }

      // Get user
      const user = await User.findByPk(userId)

      if (!user) {
        throw new Error("User not found")
      }

      // Exchange code for tokens
      const tokenResponse = await axios.post(
        "https://login.microsoftonline.com/common/oauth2/v2.0/token",
        new URLSearchParams({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          code,
          redirect_uri: config.redirectUri,
          grant_type: "authorization_code",
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      )

      const tokens = tokenResponse.data

      // Get user's default calendar
      const client = Client.init({
        authProvider: (done) => {
          done(null, tokens.access_token)
        },
      })

      const calendars = await client.api("/me/calendars").get()
      const defaultCalendar = calendars.value.find((cal) => cal.isDefaultCalendar) || calendars.value[0]

      // Check if user already has an Outlook Calendar
      const existingCalendar = await Calendar.findOne({
        where: {
          userId,
          externalCalendarType: "outlook",
        },
      })

      if (existingCalendar) {
        // Update existing calendar
        await existingCalendar.update({
          externalCalendarId: defaultCalendar.id,
          externalCalendarData: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiryDate: Date.now() + tokens.expires_in * 1000,
          },
        })

        return {
          success: true,
          calendar: existingCalendar,
          message: "Outlook Calendar reconnected successfully",
        }
      } else {
        // Create new calendar
        const newCalendar = await Calendar.create({
          id: uuidv4(),
          userId,
          name: `Outlook: ${defaultCalendar.name}`,
          color: calendarConfig.defaults.defaultCalendarColor,
          isDefault: false,
          externalCalendarId: defaultCalendar.id,
          externalCalendarType: "outlook",
          externalCalendarData: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiryDate: Date.now() + tokens.expires_in * 1000,
          },
        })

        return {
          success: true,
          calendar: newCalendar,
          message: "Outlook Calendar connected successfully",
        }
      }
    } catch (error) {
      console.error("Error handling Outlook callback:", error)
      throw error
    }
  }

  /**
   * Handle Apple Calendar OAuth callback
   * @param {String} code - Authorization code
   * @param {String} userId - User ID
   * @returns {Object} Result
   */
  async handleAppleCallback(code, userId) {
    try {
      const config = calendarConfig.providers.apple

      if (!config.enabled) {
        throw new Error("Apple Calendar integration is not enabled")
      }

      // Get user
      const user = await User.findByPk(userId)

      if (!user) {
        throw new Error("User not found")
      }

      // Apple Calendar integration is more complex and requires additional steps
      // This is a simplified example

      // Check if user already has an Apple Calendar
      const existingCalendar = await Calendar.findOne({
        where: {
          userId,
          externalCalendarType: "apple",
        },
      })

      if (existingCalendar) {
        // Update existing calendar
        await existingCalendar.update({
          externalCalendarId: `apple-${Date.now()}`,
          externalCalendarData: {
            code,
            connectedAt: new Date(),
          },
        })

        return {
          success: true,
          calendar: existingCalendar,
          message: "Apple Calendar reconnected successfully",
        }
      } else {
        // Create new calendar
        const newCalendar = await Calendar.create({
          id: uuidv4(),
          userId,
          name: "Apple Calendar",
          color: calendarConfig.defaults.defaultCalendarColor,
          isDefault: false,
          externalCalendarId: `apple-${Date.now()}`,
          externalCalendarType: "apple",
          externalCalendarData: {
            code,
            connectedAt: new Date(),
          },
        })

        return {
          success: true,
          calendar: newCalendar,
          message: "Apple Calendar connected successfully",
        }
      }
    } catch (error) {
      console.error("Error handling Apple callback:", error)
      throw error
    }
  }

  /**
   * Sync calendar with external provider
   * @param {String} calendarId - Calendar ID
   * @param {Object} user - User object
   * @returns {Object} Result
   */
  async syncCalendar(calendarId, user) {
    try {
      // Find calendar
      const calendar = await Calendar.findOne({
        where: { id: calendarId, userId: user.id },
      })

      if (!calendar) {
        throw new Error("Calendar not found")
      }

      if (!calendar.externalCalendarId || !calendar.externalCalendarType) {
        throw new Error("Calendar is not connected to an external provider")
      }

      // Sync based on provider
      switch (calendar.externalCalendarType) {
        case "google":
          return await this.syncGoogleCalendar(calendar, user)
        case "outlook":
          return await this.syncOutlookCalendar(calendar, user)
        case "apple":
          return await this.syncAppleCalendar(calendar, user)
        default:
          throw new Error(`Unsupported calendar provider: ${calendar.externalCalendarType}`)
      }
    } catch (error) {
      console.error("Error syncing calendar:", error)
      throw error
    }
  }

  /**
   * Sync Google Calendar
   * @param {Object} calendar - Calendar object
   * @param {Object} user - User object
   * @returns {Object} Result
   */
  async syncGoogleCalendar(calendar, user) {
    try {
      const config = calendarConfig.providers.google

      if (!config.enabled) {
        throw new Error("Google Calendar integration is not enabled")
      }

      // Get calendar events
      const calendarEvents = await CalendarEvent.findAll({
        where: { calendarId: calendar.id },
      })

      // Initialize Google Calendar client
      const oauth2Client = new google.auth.OAuth2(config.clientId, config.clientSecret, config.redirectUri)

      oauth2Client.setCredentials({
        access_token: calendar.externalCalendarData.accessToken,
        refresh_token: calendar.externalCalendarData.refreshToken,
        expiry_date: calendar.externalCalendarData.expiryDate,
      })

      const googleCalendar = google.calendar({ version: "v3", auth: oauth2Client })

      // Sync events to Google Calendar
      let eventsAdded = 0
      let eventsUpdated = 0
      const eventsRemoved = 0

      for (const event of calendarEvents) {
        try {
          if (event.externalEventId) {
            // Update existing event
            await googleCalendar.events.update({
              calendarId: calendar.externalCalendarId,
              eventId: event.externalEventId,
              resource: this.formatEventForGoogle(event),
            })

            eventsUpdated++
          } else {
            // Create new event
            const response = await googleCalendar.events.insert({
              calendarId: calendar.externalCalendarId,
              resource: this.formatEventForGoogle(event),
            })

            // Save external event ID
            await event.update({
              externalEventId: response.data.id,
            })

            eventsAdded++
          }
        } catch (eventError) {
          console.error("Error syncing event to Google Calendar:", eventError)
          // Continue with next event
        }
      }

      // Update calendar sync status
      await calendar.update({
        lastSynced: new Date(),
      })

      return {
        success: true,
        message: "Calendar synced successfully",
        stats: {
          eventsAdded,
          eventsUpdated,
          eventsRemoved,
        },
      }
    } catch (error) {
      console.error("Error syncing Google Calendar:", error)
      throw error
    }
  }

  /**
   * Sync Outlook Calendar
   * @param {Object} calendar - Calendar object
   * @param {Object} user - User object
   * @returns {Object} Result
   */
  async syncOutlookCalendar(calendar, user) {
    try {
      const config = calendarConfig.providers.outlook

      if (!config.enabled) {
        throw new Error("Outlook Calendar integration is not enabled")
      }

      // Get calendar events
      const calendarEvents = await CalendarEvent.findAll({
        where: { calendarId: calendar.id },
      })

      // Initialize Microsoft Graph client
      const client = Client.init({
        authProvider: (done) => {
          done(null, calendar.externalCalendarData.accessToken)
        },
      })

      // Sync events to Outlook Calendar
      let eventsAdded = 0
      let eventsUpdated = 0
      const eventsRemoved = 0

      for (const event of calendarEvents) {
        try {
          if (event.externalEventId) {
            // Update existing event
            await client
              .api(`/me/calendars/${calendar.externalCalendarId}/events/${event.externalEventId}`)
              .update(this.formatEventForOutlook(event))

            eventsUpdated++
          } else {
            // Create new event
            const response = await client
              .api(`/me/calendars/${calendar.externalCalendarId}/events`)
              .post(this.formatEventForOutlook(event))

            // Save external event ID
            await event.update({
              externalEventId: response.id,
            })

            eventsAdded++
          }
        } catch (eventError) {
          console.error("Error syncing event to Outlook Calendar:", eventError)
          // Continue with next event
        }
      }

      // Update calendar sync status
      await calendar.update({
        lastSynced: new Date(),
      })

      return {
        success: true,
        message: "Calendar synced successfully",
        stats: {
          eventsAdded,
          eventsUpdated,
          eventsRemoved,
        },
      }
    } catch (error) {
      console.error("Error syncing Outlook Calendar:", error)
      throw error
    }
  }

  /**
   * Sync Apple Calendar
   * @param {Object} calendar - Calendar object
   * @param {Object} user - User object
   * @returns {Object} Result
   */
  async syncAppleCalendar(calendar, user) {
    try {
      const config = calendarConfig.providers.apple

      if (!config.enabled) {
        throw new Error("Apple Calendar integration is not enabled")
      }

      // Apple Calendar integration is more complex
      // This is a simplified example

      // Update calendar sync status
      await calendar.update({
        lastSynced: new Date(),
      })

      return {
        success: true,
        message: "Apple Calendar sync is not fully implemented",
        stats: {
          eventsAdded: 0,
          eventsUpdated: 0,
          eventsRemoved: 0,
        },
      }
    } catch (error) {
      console.error("Error syncing Apple Calendar:", error)
      throw error
    }
  }

  /**
   * Sync event to external calendar
   * @param {Object} event - Calendar event
   * @param {Object} calendar - Calendar object
   * @param {Object} user - User object
   * @returns {Object} Result
   */
  async syncEventToExternalCalendar(event, calendar, user) {
    try {
      switch (calendar.externalCalendarType) {
        case "google":
          return await this.syncEventToGoogleCalendar(event, calendar, user)
        case "outlook":
          return await this.syncEventToOutlookCalendar(event, calendar, user)
        case "apple":
          return await this.syncEventToAppleCalendar(event, calendar, user)
        default:
          throw new Error(`Unsupported calendar provider: ${calendar.externalCalendarType}`)
      }
    } catch (error) {
      console.error("Error syncing event to external calendar:", error)
      throw error
    }
  }

  /**
   * Sync event to Google Calendar
   * @param {Object} event - Calendar event
   * @param {Object} calendar - Calendar object
   * @param {Object} user - User object
   * @returns {Object} Result
   */
  async syncEventToGoogleCalendar(event, calendar, user) {
    try {
      const config = calendarConfig.providers.google

      if (!config.enabled) {
        throw new Error("Google Calendar integration is not enabled")
      }

      // Initialize Google Calendar client
      const oauth2Client = new google.auth.OAuth2(config.clientId, config.clientSecret, config.redirectUri)

      oauth2Client.setCredentials({
        access_token: calendar.externalCalendarData.accessToken,
        refresh_token: calendar.externalCalendarData.refreshToken,
        expiry_date: calendar.externalCalendarData.expiryDate,
      })

      const googleCalendar = google.calendar({ version: "v3", auth: oauth2Client })

      if (event.externalEventId) {
        // Update existing event
        await googleCalendar.events.update({
          calendarId: calendar.externalCalendarId,
          eventId: event.externalEventId,
          resource: this.formatEventForGoogle(event),
        })

        return {
          success: true,
          message: "Event updated in Google Calendar",
        }
      } else {
        // Create new event
        const response = await googleCalendar.events.insert({
          calendarId: calendar.externalCalendarId,
          resource: this.formatEventForGoogle(event),
        })

        // Save external event ID
        await event.update({
          externalEventId: response.data.id,
        })

        return {
          success: true,
          message: "Event added to Google Calendar",
        }
      }
    } catch (error) {
      console.error("Error syncing event to Google Calendar:", error)
      throw error
    }
  }

  /**
   * Format event for Google Calendar
   * @param {Object} event - Calendar event
   * @returns {Object} Formatted event
   */
  formatEventForGoogle(event) {
    const formattedEvent = {
      summary: event.title,
      description: event.description || "",
      location: event.location || "",
      start: {
        dateTime: event.isAllDay ? undefined : event.startDate.toISOString(),
        date: event.isAllDay ? event.startDate.toISOString().split("T")[0] : undefined,
      },
      end: {
        dateTime: event.isAllDay ? undefined : event.endDate.toISOString(),
        date: event.isAllDay ? event.endDate.toISOString().split("T")[0] : undefined,
      },
    }

    // Add recurrence if specified
    if (event.recurrence) {
      formattedEvent.recurrence = [event.recurrence]
    }

    // Add reminders if specified
    if (event.reminder) {
      formattedEvent.reminders = {
        useDefault: false,
        overrides: [
          {
            method: "popup",
            minutes: event.reminder,
          },
        ],
      }
    } else {
      formattedEvent.reminders = {
        useDefault: true,
      }
    }

    return formattedEvent
  }

  /**
   * Format event for Outlook Calendar
   * @param {Object} event - Calendar event
   * @returns {Object} Formatted event
   */
  formatEventForOutlook(event) {
    const formattedEvent = {
      subject: event.title,
      body: {
        contentType: "text",
        content: event.description || "",
      },
      start: {
        dateTime: event.startDate.toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: event.endDate.toISOString(),
        timeZone: "UTC",
      },
      location: {
        displayName: event.location || "",
      },
      isAllDay: event.isAllDay,
    }

    // Add reminder if specified
    if (event.reminder) {
      formattedEvent.reminderMinutesBeforeStart = event.reminder
      formattedEvent.isReminderOn = true
    }

    return formattedEvent
  }

  /**
   * Generate ICS file for event
   * @param {String} eventId - Event ID
   * @returns {Buffer} ICS file buffer
   */
  async generateICSFile(eventId) {
    try {
      // Find event
      const event = await Event.findByPk(eventId, {
        include: [
          {
            model: Organizer,
            attributes: ["companyName", "email"],
          },
        ],
      })

      if (!event) {
        throw new Error("Event not found")
      }

      // Create ICS calendar
      const cal = ical({
        domain: "eventease.com",
        name: "EventEase Calendar",
      })

      // Add event to calendar
      const icsEvent = cal.createEvent({
        start: new Date(event.eventDate),
        end: new Date(new Date(event.eventDate).getTime() + (event.duration || 2) * 60 * 60 * 1000),
        summary: event.title,
        description: event.description,
        location: event.location,
        url: `${process.env.FRONTEND_URL}/events/${event.id}`,
        organizer: event.Organizer
          ? {
              name: event.Organizer.companyName,
              email: event.Organizer.email,
            }
          : undefined,
      })

      // Generate ICS file
      const icsString = cal.toString()

      return Buffer.from(icsString)
    } catch (error) {
      console.error("Error generating ICS file:", error)
      throw error
    }
  }

  /**
   * Process event reminders
   * @returns {Object} Result
   */
  async processEventReminders() {
    try {
      const now = new Date()
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000)

      // Find reminders that need to be sent
      const reminders = await EventReminder.findAll({
        where: {
          reminderSent: false,
          reminderDate: {
            [Op.lte]: fiveMinutesFromNow,
            [Op.gte]: new Date(now.getTime() - 10 * 60 * 1000), // Don't process reminders that are more than 10 minutes late
          },
        },
        include: [
          {
            model: User,
            attributes: ["id", "name", "email"],
          },
          {
            model: Event,
            attributes: ["id", "title", "eventDate", "location"],
          },
        ],
      })

      // Process reminders
      let sentCount = 0

      for (const reminder of reminders) {
        try {
          // Skip if event or user is missing
          if (!reminder.Event || !reminder.User) {
            await reminder.update({ reminderSent: true })
            continue
          }

          // Create notification
          await Notification.create({
            id: uuidv4(),
            userId: reminder.userId,
            title: "Event Reminder",
            message: `Reminder: "${reminder.Event.title}" is starting soon at ${reminder.Event.location}.`,
            type: "reminder",
            read: false,
            link: `/events/${reminder.eventId}`,
            actionUrl: `/events/${reminder.eventId}`,
          })

          // Send email notification (implementation depends on your email service)
          // ...

          // Mark reminder as sent
          await reminder.update({ reminderSent: true })

          sentCount++
        } catch (reminderError) {
          console.error("Error processing reminder:", reminderError)
          // Continue with next reminder
        }
      }

      return {
        success: true,
        message: `Processed ${reminders.length} reminders, sent ${sentCount} notifications`,
      }
    } catch (error) {
      console.error("Error processing event reminders:", error)
      throw error
    }
  }
}

module.exports = new CalendarService()
