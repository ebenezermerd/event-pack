// config/calendar.config.js
module.exports = {
  providers: {
    google: {
      clientId: process.env.GOOGLE_CALENDAR_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
      redirectUri: `${process.env.BASE_URL}/api/calendar/google/callback`,
      scopes: ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events"],
      enabled: process.env.GOOGLE_CALENDAR_CLIENT_ID ? true : false,
    },
    outlook: {
      clientId: process.env.OUTLOOK_CALENDAR_CLIENT_ID,
      clientSecret: process.env.OUTLOOK_CALENDAR_CLIENT_SECRET,
      redirectUri: `${process.env.BASE_URL}/api/calendar/outlook/callback`,
      scopes: ["offline_access", "Calendars.ReadWrite"],
      enabled: process.env.OUTLOOK_CALENDAR_CLIENT_ID ? true : false,
    },
    apple: {
      teamId: process.env.APPLE_TEAM_ID,
      keyId: process.env.APPLE_KEY_ID,
      privateKey: process.env.APPLE_PRIVATE_KEY,
      redirectUri: `${process.env.BASE_URL}/api/calendar/apple/callback`,
      enabled: process.env.APPLE_TEAM_ID ? true : false,
    },
  },

  // Default calendar settings
  defaults: {
    defaultCalendarName: "EventEase Events",
    defaultCalendarColor: "#3788d8",
    syncFrequency: 60 * 60 * 1000, // 1 hour in milliseconds
    reminderTimes: [5, 15, 30, 60, 1440], // minutes before event (5min, 15min, 30min, 1hr, 1day)
    maxEventsPerSync: 100,
  },

  // Sync settings
  sync: {
    enabled: true,
    syncOnLogin: true,
    syncOnEventCreation: true,
    syncOnEventUpdate: true,
    syncOnEventDeletion: true,
    syncPastEvents: false,
    syncWindow: {
      past: 7, // days in the past
      future: 90, // days in the future
    },
  },

  // ICS export settings
  ics: {
    enabled: true,
    includeAttachments: false,
    includeDescription: true,
    includeLocation: true,
    includeOrganizer: true,
    includeUrl: true,
  },
}
