const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")
const Event = require("./event")
const User = require("./user")

const EventAttendee = sequelize.define(
  "EventAttendee",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    eventId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Event,
        key: "id",
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    attendanceStatus: {
      type: DataTypes.ENUM("registered", "attended", "no_show", "cancelled"),
      defaultValue: "registered",
    },
    checkInTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    registrationDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "event_attendees",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    indexes: [
      {
        unique: true,
        fields: ["eventId", "userId"],
      },
    ],
  }
)

module.exports = EventAttendee 