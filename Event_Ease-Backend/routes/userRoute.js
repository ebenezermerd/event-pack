// routes/userRoutes.js
const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")
const { userAuth } = require("../middleware/authMiddleware")
const validate = require("../middleware/validate")
const Joi = require("joi")

// Validation schemas
const updateProfileSchema = Joi.object({
  name: Joi.string().optional(),
  phone: Joi.string().optional(),
  avatar: Joi.string().optional(),
  bio: Joi.string().optional(),
  address: Joi.string().optional(),
})

const saveEventSchema = Joi.object({
  eventId: Joi.string().required(),
  notes: Joi.string().optional(),
})

const calendarEventSchema = Joi.object({
  calendarId: Joi.string().required(),
  eventId: Joi.string().optional(),
  title: Joi.string().required(),
  description: Joi.string().optional(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  location: Joi.string().optional(),
  isAllDay: Joi.boolean().optional(),
  recurrence: Joi.string().optional(),
  reminder: Joi.number().optional(),
})

const calendarSchema = Joi.object({
  name: Joi.string().required(),
  color: Joi.string().optional(),
  isDefault: Joi.boolean().optional(),
})

const externalCalendarSchema = Joi.object({
  calendarId: Joi.string().required(),
  externalCalendarType: Joi.string().valid("google", "outlook", "apple").required(),
  authCode: Joi.string().required(),
})

const notificationSettingsSchema = Joi.object({
  email: Joi.boolean().optional(),
  push: Joi.boolean().optional(),
  sms: Joi.boolean().optional(),
})

const userPreferencesSchema = Joi.object({
  categories: Joi.array().items(Joi.string()).optional(),
  locations: Joi.array().items(Joi.string()).optional(),
  calendarSync: Joi.boolean().optional(),
})

// Profile routes
router.get("/profile", userAuth, userController.getProfile)
router.put("/profile", userAuth, validate(updateProfileSchema), userController.updateProfile)

// Order routes
router.get("/orders", userAuth, userController.getUserOrders)

// Event routes
router.get("/events", userAuth, userController.getUserEvents)

// Notification routes
router.get("/notifications", userAuth, userController.getUserNotifications)
router.put("/notifications/:id/read", userAuth, userController.markNotificationAsRead)
router.put("/notifications/read-all", userAuth, userController.markAllNotificationsAsRead)
router.delete("/notifications/:id", userAuth, userController.deleteNotification)
router.delete("/notifications/read", userAuth, userController.clearReadNotifications)

// Saved events routes
router.get("/saved-events", userAuth, userController.getSavedEvents)
router.post("/saved-events", userAuth, validate(saveEventSchema), userController.saveEvent)
router.delete("/saved-events/:eventId", userAuth, userController.removeSavedEvent)
router.delete("/saved-events", userAuth, userController.clearSavedEvents)

// Ticket routes
router.get("/tickets", userAuth, userController.getUserTickets)
router.get("/tickets/:id/download", userAuth, userController.downloadTicket)
router.put("/tickets/:id/cancel", userAuth, userController.cancelTicket)
router.get("/tickets/:id/qr-code", userAuth, userController.getTicketQRCode)

// Calendar routes
router.get("/calendar", userAuth, userController.getUserCalendar)
router.post("/calendar/events", userAuth, validate(calendarEventSchema), userController.createCalendarEvent)
router.put("/calendar/events/:id", userAuth, userController.updateCalendarEvent)
router.delete("/calendar/events/:id", userAuth, userController.deleteCalendarEvent)
router.get("/calendars", userAuth, userController.getUserCalendars)
router.post("/calendars", userAuth, validate(calendarSchema), userController.createCalendar)
router.post("/calendars/connect", userAuth, validate(externalCalendarSchema), userController.connectExternalCalendar)
router.post("/calendars/:id/sync", userAuth, userController.syncCalendar)

// Feed and recommendations routes
router.get("/feed", userAuth, userController.getEventFeed)
router.get("/recommendations", userAuth, userController.getUserRecommendations)

// Settings routes
router.put(
  "/notification-settings",
  userAuth,
  validate(notificationSettingsSchema),
  userController.updateNotificationSettings,
)
router.put("/preferences", userAuth, validate(userPreferencesSchema), userController.updateUserPreferences)

module.exports = router
