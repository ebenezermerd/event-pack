// controllers/notificationController.js
const notificationService = require("../services/notification.service")

// Get user notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const params = req.query
    const user = req.user

    const result = await notificationService.getUserNotifications(params, user)

    res.status(200).json(result)
  } catch (error) {
    console.error("Get user notifications error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Mark notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params
    const user = req.user

    const result = await notificationService.markNotificationAsRead(id, user)

    res.status(200).json(result)
  } catch (error) {
    console.error("Mark notification as read error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Mark all notifications as read
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const user = req.user

    const result = await notificationService.markAllNotificationsAsRead(user)

    res.status(200).json(result)
  } catch (error) {
    console.error("Mark all notifications as read error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params
    const user = req.user

    const result = await notificationService.deleteNotification(id, user)

    res.status(200).json(result)
  } catch (error) {
    console.error("Delete notification error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Clear read notifications
exports.clearReadNotifications = async (req, res) => {
  try {
    const user = req.user

    const result = await notificationService.clearReadNotifications(user)

    res.status(200).json(result)
  } catch (error) {
    console.error("Clear read notifications error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Register push token
exports.registerPushToken = async (req, res) => {
  try {
    const { token } = req.body
    const user = req.user

    const result = await notificationService.registerPushToken(token, user)

    res.status(200).json(result)
  } catch (error) {
    console.error("Register push token error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Unregister push token
exports.unregisterPushToken = async (req, res) => {
  try {
    const user = req.user

    const result = await notificationService.unregisterPushToken(user)

    res.status(200).json(result)
  } catch (error) {
    console.error("Unregister push token error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Update notification settings
exports.updateNotificationSettings = async (req, res) => {
  try {
    const settings = req.body
    const user = req.user

    const result = await notificationService.updateNotificationSettings(settings, user)

    res.status(200).json(result)
  } catch (error) {
    console.error("Update notification settings error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
