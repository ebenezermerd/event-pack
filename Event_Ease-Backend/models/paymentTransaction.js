// models/paymentTransaction.js
const { Sequelize, DataTypes } = require("sequelize")
const sequelize = require("../config/database")
const Order = require("./order")

const PaymentTransaction = sequelize.define(
  "PaymentTransaction",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: Sequelize.UUID,
      references: {
        model: Order,
        key: "id",
      },
      allowNull: false,
    },
    transactionId: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    provider: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: Sequelize.STRING,
      defaultValue: "ETB",
    },
    status: {
      type: Sequelize.ENUM("pending", "completed", "failed", "refunded"),
      defaultValue: "pending",
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    transactionDate: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    timestamps: true,
    tableName: "payment_transactions",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  },
)

// Establish association with Order model
PaymentTransaction.belongsTo(Order, { foreignKey: "orderId" })
Order.hasMany(PaymentTransaction, { foreignKey: "orderId" })

module.exports = PaymentTransaction
