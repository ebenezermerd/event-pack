// models/order.js
const { Sequelize, DataTypes } = require("sequelize")
const sequelize = require("../config/database")
const User = require("./user")
const Event = require("./event")
const Promotion = require("./promotion")

const Order = sequelize.define(
  "Order",
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
    eventId: {
      type: Sequelize.UUID,
      references: {
        model: Event,
        key: "id",
      },
      allowNull: false,
    },
    totalAmount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    currency: {
      type: Sequelize.STRING,
      defaultValue: "ETB",
    },
    approvalStatus: {
      type: Sequelize.ENUM("pending", "completed", "cancelled", "refunded", "failed"),
      defaultValue: "pending",
    },
    paymentMethod: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    transactionId: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    promotionId: {
      type: Sequelize.UUID,
      references: {
        model: "promotions", // Using string reference since Promotion model is defined later
        key: "id",
      },
      allowNull: true,
    },
    discountAmount: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    purchaseDate: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    billingName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    billingEmail: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    billingAddress: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "orders",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  },
)

module.exports = Order
