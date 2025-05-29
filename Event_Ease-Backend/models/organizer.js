// models/organizer.js
const { Sequelize, DataTypes } = require("sequelize")
const sequelize = require("../config/database")
const User = require("./user")

const   Organizer = sequelize.define(
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
      get() {
        const value = this.getDataValue('verificationDocuments');
        if (value === null) return [];
        if (Array.isArray(value)) return value;
        try {
          // If stored as JSON string, parse it
          return typeof value === 'string' ? JSON.parse(value) : value;
        } catch (e) {
          console.error('Error parsing verificationDocuments:', e);
          return [];
        }
      },
      set(value) {
        // Ensure we store as proper JSON
        if (value === null || value === undefined) {
          this.setDataValue('verificationDocuments', null);
        } else if (Array.isArray(value)) {
          this.setDataValue('verificationDocuments', value);
        } else if (typeof value === 'string') {
          try {
            // Check if it's a JSON string
            const parsed = JSON.parse(value);
            this.setDataValue('verificationDocuments', parsed);
          } catch (e) {
            // Not a JSON string, store as an array with one item
            this.setDataValue('verificationDocuments', [value]);
          }
        } else {
          // Unknown format, store as empty array
          this.setDataValue('verificationDocuments', []);
        }
      }
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
