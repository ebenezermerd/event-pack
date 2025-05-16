const { Sequelize } = require("sequelize")
const sequelize = require("../config/database")
const User = require("./user")
const Event = require("./event")

const UserEventRegistration = sequelize.define(
  "UserEventRegistration",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: Sequelize.INTEGER,
      references: {
        model: User,
        key: "id",
      },
      allowNull: false,
    },
    eventId: {
      type: Sequelize.INTEGER,
      references: {
        model: Event,
        key: "id",
      },
      allowNull: false,
    },
    bookingDate: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM("confirmed", "pending", "cancelled"),
      defaultValue: "pending",
    },
  },
  {
    timestamps: true,
    tableName: "user_event_registrations",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  },
)
module.exports = UserEventRegistration
