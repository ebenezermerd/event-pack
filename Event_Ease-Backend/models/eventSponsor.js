const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")
const Event = require("./event")

const EventSponsor = sequelize.define(
  "EventSponsor",
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
    sponsorName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sponsorLevel: {
      type: DataTypes.ENUM("platinum", "gold", "silver", "bronze"),
      defaultValue: "bronze",
    },
    logoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    websiteUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    contributionAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    }
  },
  {
    timestamps: true,
    tableName: "event_sponsors",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  },
)
module.exports = EventSponsor 