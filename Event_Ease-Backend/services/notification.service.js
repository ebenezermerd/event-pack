// services/notification.service.js
const { v4: uuidv4 } = require("uuid")
const fs = require("fs")
const path = require("path")
const handlebars = require("handlebars")
const admin = require("firebase-admin")
const twilio = require("twilio")
const axios = require("axios")
const notificationConfig = require("../config/notification.config")
const Notification = require("../models/notification")
const User = require("../models/user")
const { Op } = require("sequelize")
const sendEmail = require("../middleware/sendEmail")

class NotificationService {
  constructor() {
    this.initializeProviders()
  }

  /**
   * Initialize notification providers
   */
  initializeProviders() {
    // Initialize Firebase for push notifications
    if (notificationConfig.channels.push.enabled && notificationConfig.channels.push.provider === "firebase") {
      try {
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
          const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)

          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: notificationConfig.channels.push.firebase.databaseURL,
          })

          this.firebaseAdmin = admin
        }
      } catch (error) {
        console.error("Error initializing Firebase:", error)
      }
    }

    // Initialize Twilio for SMS notifications
    if (notificationConfig.channels.sms.enabled && notificationConfig.channels.sms.provider === "twilio") {
      try {
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
          this.twilioClient = twilio(
            notificationConfig.channels.sms.twilio.accountSid,
            notificationConfig.channels.sms.twilio.authToken,
          )
        }
      } catch (error) {
        console.error("Error initializing Twilio:", error)
      }
    }
  }

  /**
   * Create notification
   * @param {Object} notificationData - Notification data
   * @returns {Object} Created notification
   */
  async createNotification(notificationData) {
    try {
      const { userId, title, message, type = "system", link, actionUrl, data, channels } = notificationData

      // Validate notification type
      if (!notificationConfig.types[type]) {
        throw new Error(`Invalid notification type: ${type}`)
      }

      // Get user
      const user = await User.findByPk(userId)

      if (!user) {
        throw new Error("User not found")
      }

      // Get user notification preferences
      const userPreferences = user.preferences?.notificationSettings || {}

      // Determine channels to use
      const notificationChannels = channels || notificationConfig.types[type].defaultChannel

      // Create in-app notification
      if (notificationChannels.includes("in_app") && userPreferences.in_app !== false) {
        const notification = await Notification.create({
          id: uuidv4(),
          userId,
          title,
          message,
          type,
          read: false,
          link,
          actionUrl,
          data,
        })

        // Clean up old notifications if needed
        await this.cleanupOldNotifications(userId)
      }

      // Send email notification
      if (notificationChannels.includes("email") && userPreferences.email !== false) {
        await this.sendEmailNotification(user, {
          title,
          message,
          type,
          actionUrl,
          data,
        })
      }

      // Send push notification
      if (notificationChannels.includes("push") && userPreferences.push !== false && user.pushToken) {
        await this.sendPushNotification(user, {
          title,
          message,
          type,
          actionUrl,
          data,
        })
      }

      // Send SMS notification
      if (notificationChannels.includes("sms") && userPreferences.sms !== false && user.phone) {
        await this.sendSmsNotification(user, {
          title,
          message,
          type,
          data,
        })
      }

      return {
        success: true,
        message: "Notification created successfully",
      }
    } catch (error) {
      console.error("Error creating notification:", error)
      throw error
    }
  }

  /**
   * Send email notification
   * @param {Object} user - User object
   * @param {Object} notification - Notification data
   * @returns {Object} Result
   */
  async sendEmailNotification(user, notification) {
    try {
      const { title, message, type, actionUrl, data } = notification

      // Check if email channel is enabled
      if (!notificationConfig.channels.email.enabled) {
        return {
          success: false,
          message: "Email notifications are disabled",
        }
      }

      // Check throttling
      const canSendEmail = await this.checkEmailThrottling(user.id)

      if (!canSendEmail) {
        return {
          success: false,
          message: "Email throttling limit reached",
        }
      }

      // Get email template
      const templatePath = path.join(
        notificationConfig.channels.email.templates.path,
        `${type}${notificationConfig.channels.email.templates.extension}`,
      )

      let emailContent

      if (fs.existsSync(templatePath)) {
        // Use template if exists
        const template = handlebars.compile(fs.readFileSync(templatePath, "utf8"))
        emailContent = template({
          title,
          message,
          actionUrl,
          user: {
            name: user.name,
          },
          ...data,
        })
      } else {
        // Use default template
        emailContent = `
          <h1>${title}</h1>
          <p>${message}</p>
          ${actionUrl ? `<p><a href="${actionUrl}">Click here</a> for more information.</p>` : ""}
        `
      }

      // Send email
      await sendEmail(user.email, title, emailContent, { isHtml: true })

      // Record email sent for throttling
      await this.recordEmailSent(user.id)

      return {
        success: true,
        message: "Email notification sent",
      }
    } catch (error) {
      console.error("Error sending email notification:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  }

  /**
   * Send push notification
   * @param {Object} user - User object
   * @param {Object} notification - Notification data
   * @returns {Object} Result
   */
  async sendPushNotification(user, notification) {
    try {
      const { title, message, type, actionUrl, data } = notification

      // Check if push channel is enabled
      if (!notificationConfig.channels.push.enabled) {
        return {
          success: false,
          message: "Push notifications are disabled",
        }
      }

      // Check if user has push token
      if (!user.pushToken) {
        return {
          success: false,
          message: "User does not have a push token",
        }
      }

      // Send push notification based on provider
      switch (notificationConfig.channels.push.provider) {
        case "firebase":
          return await this.sendFirebasePushNotification(user, notification)
        case "onesignal":
          return await this.sendOneSignalPushNotification(user, notification)
        default:
          throw new Error(`Unsupported push notification provider: ${notificationConfig.channels.push.provider}`)
      }
    } catch (error) {
      console.error("Error sending push notification:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  }

  /**
   * Send Firebase push notification
   * @param {Object} user - User object
   * @param {Object} notification - Notification data
   * @returns {Object} Result
   */
  async sendFirebasePushNotification(user, notification) {
    try {
      const { title, message, type, actionUrl, data } = notification

      if (!this.firebaseAdmin) {
        throw new Error("Firebase is not initialized")
      }

      // Prepare notification
      const payload = {
        notification: {
          title,
          body: message,
          icon: notificationConfig.types[type]?.icon || "default",
          color: notificationConfig.types[type]?.color || "#000000",
          click_action: actionUrl,
        },
        data: {
          type,
          ...data,
        },
      }

      // Send notification
      await this.firebaseAdmin.messaging().sendToDevice(user.pushToken, payload)

      return {
        success: true,
        message: "Firebase push notification sent",
      }
    } catch (error) {
      console.error("Error sending Firebase push notification:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  }

  /**
   * Send OneSignal push notification
   * @param {Object} user - User object
   * @param {Object} notification - Notification data
   * @returns {Object} Result
   */
  async sendOneSignalPushNotification(user, notification) {
    try {
      const { title, message, type, actionUrl, data } = notification

      const oneSignalConfig = notificationConfig.channels.push.onesignal

      if (!oneSignalConfig.appId || !oneSignalConfig.apiKey) {
        throw new Error("OneSignal configuration is incomplete")
      }

      // Prepare notification
      const payload = {
        app_id: oneSignalConfig.appId,
        include_player_ids: [user.pushToken],
        headings: { en: title },
        contents: { en: message },
        data: {
          type,
          actionUrl,
          ...data,
        },
        url: actionUrl,
      }

      // Send notification
      await axios.post("https://onesignal.com/api/v1/notifications", payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${oneSignalConfig.apiKey}`,
        },
      })

      return {
        success: true,
        message: "OneSignal push notification sent",
      }
    } catch (error) {
      console.error("Error sending OneSignal push notification:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  }

  /**
   * Send SMS notification
   * @param {Object} user - User object
   * @param {Object} notification - Notification data
   * @returns {Object} Result
   */
  async sendSmsNotification(user, notification) {
    try {
      const { title, message } = notification

      // Check if SMS channel is enabled
      if (!notificationConfig.channels.sms.enabled) {
        return {
          success: false,
          message: "SMS notifications are disabled",
        }
      }

      // Check if user has phone number
      if (!user.phone) {
        return {
          success: false,
          message: "User does not have a phone number",
        }
      }

      // Send SMS based on provider
      switch (notificationConfig.channels.sms.provider) {
        case "twilio":
          return await this.sendTwilioSmsNotification(user, notification)
        default:
          throw new Error(`Unsupported SMS provider: ${notificationConfig.channels.sms.provider}`)
      }
    } catch (error) {
      console.error("Error sending SMS notification:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  }

  /**
   * Send Twilio SMS notification
   * @param {Object} user - User object
   * @param {Object} notification - Notification data
   * @returns {Object} Result
   */
  async sendTwilioSmsNotification(user, notification) {
    try {
      const { title, message } = notification

      if (!this.twilioClient) {
        throw new Error("Twilio is not initialized")
      }

      // Format SMS content
      const smsContent = `${title}: ${message}`

      // Send SMS
      await this.twilioClient.messages.create({
        body: smsContent,
        from: notificationConfig.channels.sms.twilio.phoneNumber,
        to: user.phone,
      })

      return {
        success: true,
        message: "Twilio SMS notification sent",
      }
    } catch (error) {
      console.error("Error sending Twilio SMS notification:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  }

  /**
   * Check email throttling
   * @param {String} userId - User ID
   * @returns {Boolean} Whether email can be sent
   */
  async checkEmailThrottling(userId) {
    try {
      const throttleConfig = notificationConfig.channels.email.throttle

      // Check hourly limit
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
      const hourlyCount = await Notification.count({
        where: {
          userId,
          type: "email_sent",
          createdAt: { [Op.gte]: hourAgo },
        },
      })

      if (hourlyCount >= throttleConfig.maxPerHour) {
        return false
      }

      // Check daily limit
      const dayStart = new Date()
      dayStart.setHours(0, 0, 0, 0)

      const dailyCount = await Notification.count({
        where: {
          userId,
          type: "email_sent",
          createdAt: { [Op.gte]: dayStart },
        },
      })

      if (dailyCount >= throttleConfig.maxPerDay) {
        return false
      }

      return true
    } catch (error) {
      console.error("Error checking email throttling:", error)
      // If there's an error checking throttling, allow the email to be sent
      return true
    }
  }

  /**
   * Record email sent for throttling
   * @param {String} userId - User ID
   */
  async recordEmailSent(userId) {
    try {
      await Notification.create({
        id: uuidv4(),
        userId,
        title: "Email Sent",
        message: "Email notification sent",
        type: "email_sent",
        read: true,
      })
    } catch (error) {
      console.error("Error recording email sent:", error)
    }
  }

  /**
   * Clean up old notifications
   * @param {String} userId - User ID
   */
  async cleanupOldNotifications(userId) {
    try {
      const maxNotifications = notificationConfig.defaults.maxNotificationsPerUser

      // Count user's notifications
      const count = await Notification.count({
        where: { userId },
      })

      if (count > maxNotifications) {
        // Get oldest notifications to delete
        const oldestNotifications = await Notification.findAll({
          where: { userId, read: true },
          order: [["createdAt", "ASC"]],
          limit: count - maxNotifications,
        })

        // Delete oldest notifications
        if (oldestNotifications.length > 0) {
          await Notification.destroy({
            where: {
              id: { [Op.in]: oldestNotifications.map((n) => n.id) },
            },
          })
        }
      }

      // Delete notifications older than retention period
      const retentionDate = new Date(Date.now() - notificationConfig.defaults.retentionDays * 24 * 60 * 60 * 1000)

      await Notification.destroy({
        where: {
          userId,
          createdAt: { [Op.lt]: retentionDate },
        },
      })
    } catch (error) {
      console.error("Error cleaning up old notifications:", error)
    }
  }

  /**
   * Get user notifications
   * @param {Object} params - Query parameters
   * @param {Object} user - User object
   * @returns {Array} User notifications
   */
  async getUserNotifications(params, user) {
    try {
      const { page = 1, limit = 10, unreadOnly, type } = params

      // Build where clause
      const whereClause = {
        userId: user.id,
        type: { [Op.ne]: "email_sent" },
      }

      if (unreadOnly === "true") {
        whereClause.read = false
      }

      if (type) {
        whereClause.type = type
      }

      // Calculate pagination
      const offset = (page - 1) * limit

      // Get notifications
      const { count, rows: notifications } = await Notification.findAndCountAll({
        where: whereClause,
        order: [["createdAt", "DESC"]],
        offset,
        limit: Number.parseInt(limit),
      })

      // Get unread count
      const unreadCount = await Notification.count({
        where: {
          userId: user.id,
          read: false,
          type: { [Op.ne]: "email_sent" },
        },
      })

      // Calculate pagination data
      const totalPages = Math.ceil(count / limit)

      return {
        success: true,
        notifications,
        unreadCount,
        pagination: {
          total: count,
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          pages: totalPages,
        },
      }
    } catch (error) {
      console.error("Error getting user notifications:", error)
      throw error
    }
  }

  /**
   * Mark notification as read
   * @param {String} id - Notification ID
   * @param {Object} user - User object
   * @returns {Object} Result
   */
  async markNotificationAsRead(id, user) {
    try {
      const notification = await Notification.findOne({
        where: { id, userId: user.id },
      })

      if (!notification) {
        throw new Error("Notification not found")
      }

      await notification.update({ read: true })

      return {
        success: true,
        message: "Notification marked as read",
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
      throw error
    }
  }

  /**
   * Mark all notifications as read
   * @param {Object} user - User object
   * @returns {Object} Result
   */
  async markAllNotificationsAsRead(user) {
    try {
      const result = await Notification.update(
        { read: true },
        {
          where: {
            userId: user.id,
            read: false,
            type: { [Op.ne]: "email_sent" },
          },
        },
      )

      return {
        success: true,
        message: "All notifications marked as read",
        count: result[0],
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      throw error
    }
  }

  /**
   * Delete notification
   * @param {String} id - Notification ID
   * @param {Object} user - User object
   * @returns {Object} Result
   */
  async deleteNotification(id, user) {
    try {
      const notification = await Notification.findOne({
        where: { id, userId: user.id },
      })

      if (!notification) {
        throw new Error("Notification not found")
      }

      await notification.destroy()

      return {
        success: true,
        message: "Notification deleted",
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
      throw error
    }
  }

  /**
   * Clear read notifications
   * @param {Object} user - User object
   * @returns {Object} Result
   */
  async clearReadNotifications(user) {
    try {
      const result = await Notification.destroy({
        where: {
          userId: user.id,
          read: true,
          type: { [Op.ne]: "email_sent" },
        },
      })

      return {
        success: true,
        message: "Read notifications cleared",
        count: result,
      }
    } catch (error) {
      console.error("Error clearing read notifications:", error)
      throw error
    }
  }

  /**
   * Register push token
   * @param {String} token - Push token
   * @param {Object} user - User object
   * @returns {Object} Result
   */
  async registerPushToken(token, user) {
    try {
      await User.update({ pushToken: token }, { where: { id: user.id } })

      return {
        success: true,
        message: "Push token registered successfully",
      }
    } catch (error) {
      console.error("Error registering push token:", error)
      throw error
    }
  }

  /**
   * Unregister push token
   * @param {Object} user - User object
   * @returns {Object} Result
   */
  async unregisterPushToken(user) {
    try {
      await User.update({ pushToken: null }, { where: { id: user.id } })

      return {
        success: true,
        message: "Push token unregistered successfully",
      }
    } catch (error) {
      console.error("Error unregistering push token:", error)
      throw error
    }
  }

  /**
   * Update notification settings
   * @param {Object} settings - Notification settings
   * @param {Object} user - User object
   * @returns {Object} Result
   */
  async updateNotificationSettings(settings, user) {
    try {
      const { email, push, sms, in_app } = settings

      // Get current preferences or initialize
      const preferences = user.preferences || {}

      // Update notification settings
      preferences.notificationSettings = {
        email: email !== undefined ? email : preferences.notificationSettings?.email || true,
        push: push !== undefined ? push : preferences.notificationSettings?.push || false,
        sms: sms !== undefined ? sms : preferences.notificationSettings?.sms || false,
        in_app: in_app !== undefined ? in_app : preferences.notificationSettings?.in_app || true,
      }

      // Save preferences
      await user.update({ preferences })

      return {
        success: true,
        message: "Notification settings updated successfully",
        settings: preferences.notificationSettings,
      }
    } catch (error) {
      console.error("Error updating notification settings:", error)
      throw error
    }
  }
}

module.exports = new NotificationService()
