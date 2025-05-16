const { Sequelize, DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const EventReview = sequelize.define(
  "EventReview",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    eventId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    rating: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    title: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    comment: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    status: {
      type: Sequelize.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
  },
  {
    timestamps: true,
    tableName: "event_reviews",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  }
)

module.exports = EventReview 