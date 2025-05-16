// config/notification.config.js
module.exports = {
  // Notification types
  types: {
    ticket: {
      icon: "ticket",
      color: "#4CAF50",
      priority: "high",
      defaultChannel: ["email", "in_app"],
    },
    reminder: {
      icon: "clock",
      color: "#2196F3",
      priority: "medium",
      defaultChannel: ["email", "in_app", "push"],
    },
    recommendation: {
      icon: "star",
      color: "#FF9800",
      priority: "low",
      defaultChannel: ["in_app"],
    },
    price: {
      icon: "tag",
      color: "#9C27B0",
      priority: "medium",
      defaultChannel: ["email", "in_app"],
    },
    cancellation: {
      icon: "x-circle",
      color: "#F44336",
      priority: "high",
      defaultChannel: ["email", "in_app", "push", "sms"],
    },
    system: {
      icon: "info",
      color: "#607D8B",
      priority: "medium",
      defaultChannel: ["in_app"],
    },
  },

  // Delivery channels
  channels: {
    email: {
      enabled: true,
      throttle: {
        maxPerHour: 10,
        maxPerDay: 50,
      },
      templates: {
        path: "./templates/email",
        extension: ".html",
      },
    },
    in_app: {
      enabled: true,
      maxUnread: 100,
      autoDeleteAfterDays: 30,
    },
    push: {
      enabled: process.env.PUSH_NOTIFICATIONS_ENABLED === "true",
      provider: process.env.PUSH_PROVIDER || "firebase",
      firebase: {
        serviceAccountKey: process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      },
      onesignal: {
        appId: process.env.ONESIGNAL_APP_ID,
        apiKey: process.env.ONESIGNAL_API_KEY,
      },
    },
    sms: {
      enabled: process.env.SMS_NOTIFICATIONS_ENABLED === "true",
      provider: process.env.SMS_PROVIDER || "twilio",
      twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        phoneNumber: process.env.TWILIO_PHONE_NUMBER,
      },
    },
  },

  // Batch processing
  batch: {
    enabled: true,
    interval: 5 * 60 * 1000, // 5 minutes
    maxBatchSize: 100,
  },

  // Default settings
  defaults: {
    retentionDays: 30,
    maxNotificationsPerUser: 1000,
  },
}
