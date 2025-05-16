// models/savedEvent.js
const { Sequelize, DataTypes } = require("sequelize")
const sequelize = require("../config/database")
const User = require("./user")
const Event = require("./event")

const SavedEvent = sequelize.define(
  "SavedEvent",
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
    savedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    notes: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "saved_events",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  },
)

// Establish associations
SavedEvent.belongsTo(User, { foreignKey: "userId" })
User.hasMany(SavedEvent, { foreignKey: "userId" })

SavedEvent.belongsTo(Event, { foreignKey: "eventId" })
Event.hasMany(SavedEvent, { foreignKey: "eventId" })

module.exports = SavedEvent
