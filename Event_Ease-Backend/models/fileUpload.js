// models/fileUpload.js
const { Sequelize, DataTypes } = require("sequelize")
const sequelize = require("../config/database")
const User = require("./user")

const FileUpload = sequelize.define(
  "FileUpload",
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
      allowNull: true,
    },
    filename: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    fileSize: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    fileType: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    mimeType: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    path: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    url: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    provider: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    width: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    height: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    status: {
      type: Sequelize.ENUM("pending", "completed", "failed"),
      defaultValue: "completed",
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "file_uploads",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  },
)

// Establish association with User model
FileUpload.belongsTo(User, { foreignKey: "userId" })
User.hasMany(FileUpload, { foreignKey: "userId" })

module.exports = FileUpload
