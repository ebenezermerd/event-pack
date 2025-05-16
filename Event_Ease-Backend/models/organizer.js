// models/organizer.js
const { Sequelize, DataTypes } = require("sequelize")
const sequelize = require("../config/database")
const User = require("./user")

const Organizer = sequelize.define(
  "Organizer",
  {
    userId: {
      type: Sequelize.UUID,
      primaryKey: true,
      references: {
        model: User,
        key: "id",
      },
    },
    companyName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    logo: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    website: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    socialMedia: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    address: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    region: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    tinNumber: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
    },
    verified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    verificationDocuments: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    followers: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    totalEvents: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    approvalStatus: {
      type: Sequelize.ENUM("approved", "pending", "rejected"),
      defaultValue: "pending",
    },
  },
  {
    timestamps: true,
    tableName: "organizers",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  },
)

// Establish association with User model
Organizer.belongsTo(User, { foreignKey: "userId" })
User.hasOne(Organizer, { foreignKey: "userId" })

module.exports = Organizer
