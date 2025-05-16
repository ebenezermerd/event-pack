// models/eventSchedule.js
const { Sequelize, DataTypes } = require("sequelize")
const sequelize = require("../config/database")
const Event = require("./event")

const EventSchedule = sequelize.define(
  "EventSchedule",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    eventId: {
      type: Sequelize.UUID,
      references: {
        model: Event,
        key: "id",
      },
      allowNull: false,
    },
    time: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    location: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    speaker: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "event_schedules",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  },
)

// Establish association with Event model
EventSchedule.belongsTo(Event, { foreignKey: "eventId" })
Event.hasMany(EventSchedule, { foreignKey: "eventId" })

module.exports = EventSchedule
