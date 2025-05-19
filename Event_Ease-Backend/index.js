// index.js (updated)
require('dotenv').config()
const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const path = require("path")
const sequelize = require("./config/database")
const errorHandler = require("./middleware/errorHandler")
const EventRelationship = require("./models/eventRelationship")

// Import routes
const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoute")
const eventRoutes = require("./routes/eventRoutes")
const bookingRoutes = require("./routes/bookingRoutes")
const paymentRoutes = require("./routes/paymentRoutes")
const orderStatisticsRoutes = require("./routes/orderStatisticsRoutes")
const organizerRoutes = require("./routes/organizerRoutes")
const adminRoutes = require("./routes/adminRoute")
const orderRoutes = require("./routes/orderRoutes")
const aiRoutes = require("./routes/aiRoutes")
const calendarRoutes = require("./routes/calendarRoutes")
const notificationRoutes = require("./routes/notificationRoutes")
const recommendationRoutes = require("./routes/recommendationRoutes")
const storageRoutes = require("./routes/storageRoutes")
const ticketRoutes = require("./routes/ticketRoutes")

// Initialize express app
const app = express()
const PORT = process.env.PORT || 3001

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  process.env.FRONTEND_URL
].filter(Boolean); // Remove any undefined values

// Middleware
app.use(
  cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  }),
)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"],
    },
  },
}))
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files
app.use("/uploads", express.static("uploads"))
app.use(express.static(path.join(__dirname, "public")))

// Routes
app.use("/api", eventRoutes)
app.use("/api", authRoutes)
app.use("/api", userRoutes)
app.use("/api", bookingRoutes)
app.use("/api", organizerRoutes)
app.use("/api", adminRoutes)
app.use("/api", orderRoutes)
app.use("/api", aiRoutes)
app.use("/api", paymentRoutes)
app.use("/api", orderStatisticsRoutes)
app.use("/api", ticketRoutes)
app.use("/api/users", calendarRoutes)
app.use("/api/users", notificationRoutes)
app.use("/api/users", recommendationRoutes)
app.use("/api/storage", storageRoutes)

// Root route - serve the welcome page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" })
})

// Error handling middleware
app.use(errorHandler)

// Create missing tables
const createMissingTables = async () => {
  try {
    // Sync EventRelationship table (create if not exists)
    await EventRelationship.sync({ alter: true });
    console.log("EventRelationship table synchronized successfully");

    // Ensure the unique index exists
    await sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS unique_relationship 
      ON event_relationships (eventId, relatedEventId);
    `);
  } catch (error) {
    console.error("Error creating tables:", error);
    // Non-fatal error, continue server startup
  }
};

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate()
    console.log("Database connection has been established successfully.")

    // Create missing tables
    await createMissingTables();

    // Skip full database sync - we've adapted the models to match the existing database
    console.log("Using existing database structure.")

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
      console.log(`Access the API at http://localhost:${PORT}/api`)
    })
  } catch (error) {
    console.error("Unable to connect to the database:", error)
    process.exit(1)
  }
}

startServer()

module.exports = app
