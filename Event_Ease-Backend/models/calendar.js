// models/calendar.js
const { Sequelize, DataTypes } = require("sequelize")
const sequelize = require("../config/database")
const User = require("./user")

const Calendar = sequelize.define(
  "Calendar",
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
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    color: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    isDefault: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    externalCalendarId: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    externalCalendarType: {
      type: Sequelize.ENUM("google", "outlook", "apple"),
      allowNull: true,
    },
    externalCalendarData: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    lastSynced: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "calendars",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  },
)

// Establish association with User model
Calendar.belongsTo(User, { foreignKey: "userId" })
User.hasMany(Calendar, { foreignKey: "userId" })

module.exports = Calendar
