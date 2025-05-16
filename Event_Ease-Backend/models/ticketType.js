// models/ticketType.js
const { Sequelize, DataTypes } = require("sequelize")
const sequelize = require("../config/database")
const Event = require("./event")

const TicketType = sequelize.define(
  "TicketType",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    eventId: {
      type: Sequelize.UUID,
      references: {
        model: Event,
        key: "id",
      },
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    currency: {
      type: Sequelize.STRING,
      defaultValue: "ETB",
    },
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 100,
    },
    sold: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    available: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 100,
    },
    startDate: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    endDate: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    minPerOrder: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
    },
    maxPerOrder: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    benefits: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    requirements: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    transferable: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    refundable: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    revenue: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
  },
  {
    timestamps: true,
    tableName: "ticket_types",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  },
)

// Establish association with Event model
TicketType.belongsTo(Event, { foreignKey: "eventId" })
Event.hasMany(TicketType, { foreignKey: "eventId" })

module.exports = TicketType
