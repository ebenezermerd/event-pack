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
const locationRoutes = require("./routes/locationRoutes")
const categoryRoutes = require("./routes/categoryRoutes")

// Initialize express app
const app = express()
const PORT = process.env.PORT || 3000

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

// Configure multer for file uploads
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';
    
    // Create separate folders for different file types
    if (file.fieldname === 'logo') {
      uploadPath += 'logos/';
    } else if (file.fieldname === 'verificationDocuments') {
      uploadPath += 'documents/';
    }
    
    // Make sure directory exists
    const fs = require('fs');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = file.originalname.split('.').pop();
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + extension);
  }
});

// File filter to validate uploads
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'logo') {
    // Accept only image files for logos
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed for logo!'), false);
    }
  } else if (file.fieldname === 'verificationDocuments') {
    // Accept images and PDFs for verification documents
    if (!file.mimetype.startsWith('image/') && file.mimetype !== 'application/pdf') {
      return cb(new Error('Only images and PDF files are allowed for verification documents!'), false);
    }
  }
  cb(null, true);
};

// Configure the upload middleware
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  }
});

// Create a middleware to handle multipart/form-data requests
app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  
  // Only process multipart requests going to the organizer registration endpoint
  if (contentType.includes('multipart/form-data') && req.path.includes('organizer/register')) {
    console.log('Processing organizer registration with file upload');
    
    // Use multer fields to handle both text fields and file uploads
    const uploadFields = [
      { name: 'logo', maxCount: 1 },
      { name: 'verificationDocuments', maxCount: 5 }
    ];
    
    upload.fields(uploadFields)(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({
          success: false,
          message: 'Error processing file upload',
          error: err.message
        });
      }
      
      // Log successful parsing
      console.log('Form data and files parsed successfully');
      
      // Process file paths for the controller
      if (req.files) {
        // If logo is uploaded, add its path to the request body
        if (req.files.logo && req.files.logo.length > 0) {
          req.body.logo = req.files.logo[0].path;
        }
        
        // If verification documents are uploaded, add their paths to the request body
        if (req.files.verificationDocuments && req.files.verificationDocuments.length > 0) {
          // Store as actual array instead of JSON string
          req.body.verificationDocuments = req.files.verificationDocuments.map(file => file.path);
        }
      }
      
      next();
    });
  } else if (contentType.includes('multipart/form-data')) {
    // For other multipart requests, just parse the text fields
    upload.none()(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({
          success: false,
          message: 'Error processing form data',
          error: err.message
        });
      }
      next();
    });
  } else {
    next();
  }
});

// Serve static files
app.use("/uploads", express.static("uploads"))
app.use(express.static(path.join(__dirname, "public")))

// Routes
app.use("/api", eventRoutes)
app.use("/api/auth", authRoutes)
app.use("/api", userRoutes)
app.use("/api", bookingRoutes)
app.use("/api", organizerRoutes)
app.use("/api", adminRoutes)
app.use("/api", orderRoutes)
app.use("/api", aiRoutes)
app.use("/api", paymentRoutes)
app.use("/api", orderStatisticsRoutes)
app.use("/api", ticketRoutes)
app.use("/api/locations", locationRoutes)
app.use("/api/categories", categoryRoutes)
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
    try {
      // First try to drop the index if it exists
      await sequelize.query(`
        DROP INDEX IF EXISTS unique_relationship ON event_relationships;
      `);
      
      // Then create the index
      await sequelize.query(`
        CREATE UNIQUE INDEX unique_relationship 
        ON event_relationships (eventId, relatedEventId);
      `);
    } catch (indexError) {
      console.warn("Note: Index may already exist or couldn't be created:", indexError.message);
      // Non-fatal error, continue server startup
    }
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
