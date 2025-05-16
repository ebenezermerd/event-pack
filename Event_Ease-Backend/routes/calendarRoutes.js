// routes/calendarRoutes.js
const express = require("express")
const router = express.Router()
const calendarController = require("../controllers/calendarController")
const { userAuth } = require("../middleware/authMiddleware")

// Apply authentication middleware to all routes
router.use(userAuth)

// Calendar routes
router.post("/calendars", calendarController.createCalendar)
router.get("/calendars", calendarController.getUserCalendars)
router.put("/calendars/:id", calendarController.updateCalendar)
router.delete("/calendars/:id", calendarController.deleteCalendar)

// Calendar event routes
router.post("/calendar-events", calendarController.createCalendarEvent)
router.get("/calendar-events", calendarController.getCalendarEvents)
router.put("/calendar-events/:id", calendarController.updateCalendarEvent)
router.delete("/calendar-events/:id", calendarController.deleteCalendarEvent)

// External calendar integration routes
router.get("/calendars/auth/:provider", calendarController.getAuthorizationUrl)
router.get("/calendars/auth/:provider/callback", calendarController.handleOAuthCallback)
router.post("/calendars/:id/sync", calendarController.syncCalendar)

// ICS file generation
router.get("/events/:eventId/ics", calendarController.generateICSFile)

module.exports = router
