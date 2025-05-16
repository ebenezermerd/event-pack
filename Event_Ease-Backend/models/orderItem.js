// models/orderItem.js
const { Sequelize, DataTypes } = require("sequelize")
const sequelize = require("../config/database")
const Order = require("./order")
const TicketType = require("./ticketType")

const OrderItem = sequelize.define(
  "OrderItem",
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
    ticketTypeId: {
      type: Sequelize.UUID,
      references: {
        model: TicketType,
        key: "id",
      },
      allowNull: false,
    },
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    unitPrice: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    totalPrice: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    attendeeName: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    attendeeEmail: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    checkInStatus: {
      type: Sequelize.ENUM("not_checked", "checked_in", "cancelled"),
      defaultValue: "not_checked",
    },
    checkInTime: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    ticketCode: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    timestamps: true,
    tableName: "order_items",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  },
)

// Establish associations
OrderItem.belongsTo(Order, { foreignKey: "orderId" })
Order.hasMany(OrderItem, { foreignKey: "orderId" })

OrderItem.belongsTo(TicketType, { foreignKey: "ticketTypeId" })
TicketType.hasMany(OrderItem, { foreignKey: "ticketTypeId" })

module.exports = OrderItem
