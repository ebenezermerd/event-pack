// config/database.js
const { Sequelize } = require("sequelize")
const config = require("./config")

// Create Sequelize instance
const sequelize = new Sequelize(config.DB_CONFIG.database, config.DB_CONFIG.user, config.DB_CONFIG.password, {
  host: config.DB_CONFIG.host,
  dialect: config.DB_CONFIG.dialect,
  logging: config.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    freezeTableName: true,
  },
  // Add query options to avoid foreign key constraints
  quoteIdentifiers: false,
})

// Function to initialize database
const initializeDatabase = async () => {
  try {
    // Test connection
    await sequelize.authenticate()
    console.log("Database connection established successfully.")

    // Import models
    require("../models/association")

    // Skip sync if it causes permission issues
    console.log("Database models loaded successfully.")

    return true
  } catch (error) {
    console.error("Error initializing database:", error)
    return false
  }
}

module.exports = sequelize
module.exports.initializeDatabase = initializeDatabase
