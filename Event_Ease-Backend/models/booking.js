const { Sequelize, DataTypes } = require("sequelize")
const sequelize = require("../config/database")
const User = require("./user")
const Event = require("./event")
const TicketType = require("./ticketType")

const Booking = sequelize.define(
  "Booking",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: Sequelize.INTEGER,
      references: {
        model: User,
        key: "id",
      },
      allowNull: false,
    },
    eventId: {
      type: Sequelize.INTEGER,
      references: {
        model: Event,
        key: "id",
      },
      allowNull: false,
    },
    ticketTypeId: {
      type: Sequelize.INTEGER,
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
    totalPrice: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    status: {
      type: Sequelize.ENUM("pending", "confirmed", "cancelled", "checked-in"),
      defaultValue: "pending",
    },
    bookingReference: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    timestamps: true,
    tableName: "bookings",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  },
)

// Establish associations
Booking.belongsTo(User, { foreignKey: "userId" })
User.hasMany(Booking, { foreignKey: "userId" })

Booking.belongsTo(Event, { foreignKey: "eventId" })
Event.hasMany(Booking, { foreignKey: "eventId" })

Booking.belongsTo(TicketType, { foreignKey: "ticketTypeId" })
TicketType.hasMany(Booking, { foreignKey: "ticketTypeId" })

module.exports = Booking
