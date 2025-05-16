// models/eventReminder.js
const { Sequelize, DataTypes } = require("sequelize")
const sequelize = require("../config/database")
const User = require("./user")
const Event = require("./event")

const EventReminder = sequelize.define(
  "EventReminder",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: Sequelize.UUID,
      references: {
        model: User,
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
      allowNull: false,
    },
    reminderDate: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    reminderSent: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    reminderType: {
      type: Sequelize.ENUM("email", "push", "sms"),
      defaultValue: "email",
    },
  },
  {
    timestamps: true,
    tableName: "event_reminders",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  },
)

// Establish associations
EventReminder.belongsTo(User, { foreignKey: "userId" })
User.hasMany(EventReminder, { foreignKey: "userId" })

EventReminder.belongsTo(Event, { foreignKey: "eventId" })
Event.hasMany(EventReminder, { foreignKey: "eventId" })

module.exports = EventReminder
