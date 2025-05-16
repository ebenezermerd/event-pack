// routes/notificationRoutes.js
const express = require("express")
const router = express.Router()
const notificationController = require("../controllers/notificationController")
const { userAuth } = require("../middleware/authMiddleware")

// Apply authentication middleware to all routes
router.use(userAuth)

// Notification routes
router.get("/notifications", notificationController.getUserNotifications)
router.put("/notifications/:id/read", notificationController.markNotificationAsRead)
router.put("/notifications/read-all", notificationController.markAllNotificationsAsRead)
router.delete("/notifications/:id", notificationController.deleteNotification)
router.delete("/notifications/read", notificationController.clearReadNotifications)

// Push notification routes
router.post("/notifications/push-token", notificationController.registerPushToken)
router.delete("/notifications/push-token", notificationController.unregisterPushToken)

// Notification settings routes
router.put("/notification-settings", notificationController.updateNotificationSettings)

module.exports = router
