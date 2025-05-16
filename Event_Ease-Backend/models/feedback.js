// models/promotion.js
const { Sequelize, DataTypes } = require("sequelize")
const sequelize = require("../config/database")
const Event = require("./event")

const Promotion = sequelize.define(
  "Promotion",
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
    code: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    discountType: {
      type: Sequelize.ENUM("percentage", "fixed"),
      allowNull: false,
    },
    discountValue: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    maxUses: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    used: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    available: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    startDate: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    endDate: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "promotions",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  },
)

// Establish association with Event model
Promotion.belongsTo(Event, { foreignKey: "eventId" })
Event.hasMany(Promotion, { foreignKey: "eventId" })

module.exports = Promotion
