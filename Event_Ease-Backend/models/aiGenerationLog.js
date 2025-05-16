// models/aiGenerationLog.js
const { Sequelize, DataTypes } = require("sequelize")
const sequelize = require("../config/database")
const User = require("./user")

const AIGenerationLog = sequelize.define(
  "AIGenerationLog",
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
    prompt: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    parameters: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    result: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    status: {
      type: Sequelize.ENUM("success", "error", "pending"),
      allowNull: false,
    },
    errorMessage: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    model: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    tokensUsed: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "ai_generation_logs",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  },
)

// Establish association with User model
AIGenerationLog.belongsTo(User, { foreignKey: "userId" })
User.hasMany(AIGenerationLog, { foreignKey: "userId" })

module.exports = AIGenerationLog
