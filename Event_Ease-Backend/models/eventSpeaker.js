const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")
const Event = require("./event")

const EventSpeaker = sequelize.define(
  "EventSpeaker",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    eventId: {
      type: DataTypes.UUID,
      references: {
        model: Event,
        key: "id",
      },
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    photoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    socialLinks: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    presentationTopic: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    presentationTime: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  },
  {
    timestamps: true,
    tableName: "event_speakers",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  },
)
module.exports = EventSpeaker 