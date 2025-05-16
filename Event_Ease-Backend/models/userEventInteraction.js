// models/userEventInteraction.js
const { Sequelize, DataTypes } = require("sequelize")
const sequelize = require("../config/database")
const User = require("./user")
const Event = require("./event")

const UserEventInteraction = sequelize.define(
  "UserEventInteraction",
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
    interactionType: {
      type: Sequelize.ENUM("view", "click", "share", "bookmark", "purchase"),
      allowNull: false,
    },
    interactionDate: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    data: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "user_event_interactions",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  },
)

// Establish associations
UserEventInteraction.belongsTo(User, { foreignKey: "userId" })
User.hasMany(UserEventInteraction, { foreignKey: "userId" })

UserEventInteraction.belongsTo(Event, { foreignKey: "eventId" })
Event.hasMany(UserEventInteraction, { foreignKey: "eventId" })

module.exports = UserEventInteraction
