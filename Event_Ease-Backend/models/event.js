// models/event.js
const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")
const Organizer = require("./organizer")

const Event = sequelize.define(
  "Event",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    longDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    eventDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    region: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    approvalStatus: {
      type: DataTypes.ENUM("draft", "pending", "approved", "rejected", "cancelled"),
      defaultValue: "draft",
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gallery: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    organizerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Organizer,
        key: "userId",
      },
    },
    attendees: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    maxAttendees: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    revenue: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    expenses: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    profit: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // Temporarily commented out until the database schema is updated
    /*
    seriesId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'event_series',
        key: 'id'
      },
      comment: "If this event is part of a series, reference the series ID"
    }
    */
  },
  {
    timestamps: true,
    tableName: "events",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  },
)

// Establish association with Organizer model
Event.belongsTo(Organizer, { foreignKey: "organizerId" })
Organizer.hasMany(Event, { foreignKey: "organizerId" })

// Note: The relationship with EventRelationship model is defined in eventRelationship.js

module.exports = Event
