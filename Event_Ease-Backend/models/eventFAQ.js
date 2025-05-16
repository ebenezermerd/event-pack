// models/eventFAQ.js
const { Sequelize, DataTypes } = require("sequelize")
const sequelize = require("../config/database")
const Event = require("./event")

const EventFAQ = sequelize.define(
  "EventFAQ",
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
    question: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    answer: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    order: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    tableName: "event_faqs",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  },
)

// Establish association with Event model
EventFAQ.belongsTo(Event, { foreignKey: "eventId" })
Event.hasMany(EventFAQ, { foreignKey: "eventId" })

module.exports = EventFAQ
