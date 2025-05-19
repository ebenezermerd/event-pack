const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")
const Event = require("./event")

const EventRelationship = sequelize.define(
  "EventRelationship",
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
    relatedEventId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Event,
        key: "id",
      },
    },
    relationshipType: {
      type: DataTypes.ENUM("category", "organizer", "series", "custom", "recommended"),
      defaultValue: "category",
      allowNull: false,
    },
    strength: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: "Value from 1-10 indicating how strongly related these events are"
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: "ID of admin or algorithm that created this relationship"
    }
  },
  {
    timestamps: true,
    tableName: "event_relationships",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    indexes: [
      {
        unique: true,
        fields: ["eventId", "relatedEventId"],
      },
    ],
  }
)

// Establish associations with Event model - use different aliases than 'Event'
EventRelationship.belongsTo(Event, { as: 'SourceEvent', foreignKey: "eventId" })
EventRelationship.belongsTo(Event, { as: 'RelatedEvent', foreignKey: "relatedEventId" })

// Add reverse lookup to Event model
Event.hasMany(EventRelationship, { as: 'RelatedEvents', foreignKey: "eventId" })
Event.hasMany(EventRelationship, { as: 'ParentEvents', foreignKey: "relatedEventId" })

module.exports = EventRelationship 