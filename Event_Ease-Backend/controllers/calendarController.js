// controllers/calendarController.js (complete version)
const calendarService = require("../services/calendar.service")

// Create calendar
exports.createCalendar = async (req, res) => {
  try {
    const { name, color, isDefault } = req.body
    const user = req.user

    const result = await calendarService.createCalendar({ name, color, isDefault }, user)

    res.status(201).json(result)
  } catch (error) {
    console.error("Create calendar error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get user calendars
exports.getUserCalendars = async (req, res) => {
  try {
    const user = req.user

    const result = await calendarService.getUserCalendars(user)

    res.status(200).json(result)
  } catch (error) {
    console.error("Get user calendars error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Update calendar
exports.updateCalendar = async (req, res) => {
  try {
    const { id } = req.params
    const { name, color, isDefault } = req.body
    const user = req.user

    const result = await calendarService.updateCalendar(id, { name, color, isDefault }, user)

    res.status(200).json(result)
  } catch (error) {
    console.error("Update calendar error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Delete calendar
exports.deleteCalendar = async (req, res) => {
  try {
    const { id } = req.params
    const user = req.user

    const result = await calendarService.deleteCalendar(id, user)

    res.status(200).json(result)
  } catch (error) {
    console.error("Delete calendar error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Create calendar event
exports.createCalendarEvent = async (req, res) => {
  try {
    const eventData = req.body
    const user = req.user

    const result = await calendarService.createCalendarEvent(eventData, user)

    res.status(201).json(result)
  } catch (error) {
    console.error("Create calendar event error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get calendar events
exports.getCalendarEvents = async (req, res) => {
  try {
    const params = req.query
    const user = req.user

    const result = await calendarService.getCalendarEvents(params, user)

    res.status(200).json(result)
  } catch (error) {
    console.error("Get calendar events error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Update calendar event
exports.updateCalendarEvent = async (req, res) => {
  try {
    const { id } = req.params
    const eventData = req.body
    const user = req.user

    const result = await calendarService.updateCalendarEvent(id, eventData, user)

    res.status(200).json(result)
  } catch (error) {
    console.error("Update calendar event error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Delete calendar event
exports.deleteCalendarEvent = async (req, res) => {
  try {
    const { id } = req.params
    const user = req.user

    const result = await calendarService.deleteCalendarEvent(id, user)

    res.status(200).json(result)
  } catch (error) {
    console.error("Delete calendar event error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get authorization URL for external calendar
exports.getAuthorizationUrl = async (req, res) => {
  try {
    const { provider } = req.params
    const user = req.user

    const authUrl = calendarService.getAuthorizationUrl(provider, user)

    res.status(200).json({
      success: true,
      authUrl,
    })
  } catch (error) {
    console.error("Get authorization URL error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Handle OAuth callback
exports.handleOAuthCallback = async (req, res) => {
  try {
    const { provider } = req.params
    const { code, state } = req.query

    const result = await calendarService.handleOAuthCallback(provider, code, state)

    res.status(200).json(result)
  } catch (error) {
    console.error("Handle OAuth callback error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Sync calendar
exports.syncCalendar = async (req, res) => {
  try {
    const { id } = req.params
    const user = req.user

    const result = await calendarService.syncCalendar(id, user)

    res.status(200).json(result)
  } catch (error) {
    console.error("Sync calendar error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Generate ICS file
exports.generateICSFile = async (req, res) => {
  try {
    const { eventId } = req.params

    const icsBuffer = await calendarService.generateICSFile(eventId)

    res.setHeader("Content-Type", "text/calendar")
    res.setHeader("Content-Disposition", `attachment; filename="event-${eventId}.ics"`)
    res.send(icsBuffer)
  } catch (error) {
    console.error("Generate ICS file error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
