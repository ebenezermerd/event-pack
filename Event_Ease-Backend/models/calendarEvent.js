// models/calendarEvent.js
const { Sequelize, DataTypes } = require("sequelize")
const sequelize = require("../config/database")
const Calendar = require("./calendar")
const Event = require("./event")

const CalendarEvent = sequelize.define(
  "CalendarEvent",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    calendarId: {
      type: Sequelize.UUID,
      references: {
        model: Calendar,
        key: "id",
      },
      allowNull: false,
    },
    eventId: {
      type: Sequelize.UUID,
      references: {
        model: Event,
        key: "id",
      },
      allowNull: true,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    startDate: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    endDate: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    location: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    isAllDay: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    recurrence: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    reminder: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    externalEventId: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "calendar_events",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  },
)

// Establish associations
CalendarEvent.belongsTo(Calendar, { foreignKey: "calendarId" })
Calendar.hasMany(CalendarEvent, { foreignKey: "calendarId" })

CalendarEvent.belongsTo(Event, { foreignKey: "eventId" })
Event.hasMany(CalendarEvent, { foreignKey: "eventId" })

module.exports = CalendarEvent
