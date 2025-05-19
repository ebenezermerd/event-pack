const { Sequelize } = require("sequelize")
const sequelize = require("../config/database")
const Order = require("./order")

const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: Sequelize.INTEGER,
      references: {
        model: Order,
        key: "id",
      },
      allowNull: false,
    },
    paymentMethod: {
      type: Sequelize.ENUM("credit_card", "paypal", "bank_transfer", "cash", "mobile_money"),
      defaultValue: "credit_card",
    },
    amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: Sequelize.STRING(3),
      defaultValue: "USD",
    },
    status: {
      type: Sequelize.ENUM("pending", "completed", "failed", "refunded"),
      defaultValue: "pending",
    },
    transactionId: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    paymentDate: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    receiptUrl: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    notes: {
      type: Sequelize.TEXT,
      allowNull: true,
    }
  },
  {
    timestamps: true,
    tableName: "payments",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  },
)
module.exports = Payment 