require('dotenv').config();
const sequelize = require('../config/database');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Import all models
const models = {
  Event: require('../models/event'),
  User: require('../models/user'),
  Organizer: require('../models/organizer'),
  TicketType: require('../models/ticketType'),
  EventSchedule: require('../models/eventSchedule'),
  EventFAQ: require('../models/eventFAQ'),
  Order: require('../models/order'),
  OrderItem: require('../models/orderItem'),
  Promotion: require('../models/promotion'),
  UserEventInteraction: require('../models/userEventInteraction'),
  Booking: require('../models/booking'),
  Calendar: require('../models/calendar'),
  CalendarEvent: require('../models/calendarEvent'),
  Feedback: require('../models/feedback'),
  Notification: require('../models/notification'),
  SavedEvent: require('../models/savedEvent'),
  FileUpload: require('../models/fileUpload'),
  PaymentTransaction: require('../models/paymentTransaction'),
  // Include other models
};

// Import the Event model
const Event = require('../models/event');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask user for confirmation
const askForConfirmation = () => {
  return new Promise((resolve) => {
    rl.question('⚠️ WARNING: This will update the database structure. Are you sure you want to continue? (yes/no): ', (answer) => {
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
};

// Function to check if a column exists in a table
const columnExists = async (tableName, columnName) => {
  try {
    const query = `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${sequelize.config.database}' 
      AND TABLE_NAME = '${tableName}' 
      AND COLUMN_NAME = '${columnName}'
    `;
    const [results] = await sequelize.query(query);
    return results.length > 0;
  } catch (error) {
    console.error(`Error checking if column ${columnName} exists in ${tableName}:`, error);
    return false;
  }
};

// Function to add column if it doesn't exist
const addColumnIfNotExists = async (tableName, columnName, columnDefinition) => {
  try {
    const exists = await columnExists(tableName, columnName);
    if (!exists) {
      const query = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`;
      await sequelize.query(query);
      console.log(`✅ Added column ${columnName} to ${tableName}`);
      return true;
    } else {
      console.log(`⏩ Column ${columnName} already exists in ${tableName}`);
      return false;
    }
  } catch (error) {
    console.error(`Error adding column ${columnName} to ${tableName}:`, error);
    return false;
  }
};

// Function to rename column if it exists
const renameColumnIfExists = async (tableName, oldColumnName, newColumnName, columnDefinition) => {
  try {
    const oldExists = await columnExists(tableName, oldColumnName);
    const newExists = await columnExists(tableName, newColumnName);
    
    if (oldExists && !newExists) {
      const query = `ALTER TABLE ${tableName} CHANGE COLUMN ${oldColumnName} ${newColumnName} ${columnDefinition}`;
      await sequelize.query(query);
      console.log(`✅ Renamed column ${oldColumnName} to ${newColumnName} in ${tableName}`);
      return true;
    } else if (!oldExists && !newExists) {
      const query = `ALTER TABLE ${tableName} ADD COLUMN ${newColumnName} ${columnDefinition}`;
      await sequelize.query(query);
      console.log(`✅ Added column ${newColumnName} to ${tableName}`);
      return true;
    } else {
      console.log(`⏩ Column ${newColumnName} already exists in ${tableName}`);
      return false;
    }
  } catch (error) {
    console.error(`Error renaming column ${oldColumnName} to ${newColumnName} in ${tableName}:`, error);
    return false;
  }
};

// Function to update the events table structure
const updateEventsTable = async () => {
  try {
    console.log('🔄 Updating events table structure...');
    
    // Add missing columns based on Event model
    await addColumnIfNotExists('events', 'longDescription', 'TEXT NULL');
    await renameColumnIfExists('events', 'startDate', 'eventDate', 'DATETIME NOT NULL');
    await addColumnIfNotExists('events', 'time', 'VARCHAR(255) NOT NULL DEFAULT "00:00"');
    await addColumnIfNotExists('events', 'address', 'VARCHAR(255) NULL');
    await addColumnIfNotExists('events', 'region', 'VARCHAR(255) NULL');
    await addColumnIfNotExists('events', 'category', 'VARCHAR(255) NULL');
    await renameColumnIfExists('events', 'image', 'image', 'VARCHAR(255) NULL');
    await renameColumnIfExists('events', 'images', 'gallery', 'JSON NULL');
    await renameColumnIfExists('events', 'approvalStatus', 'status', 'ENUM("draft", "pending", "published", "cancelled") DEFAULT "draft"');
    await addColumnIfNotExists('events', 'attendees', 'INT NOT NULL DEFAULT 0');
    await renameColumnIfExists('events', 'capacity', 'maxAttendees', 'INT NULL');
    await addColumnIfNotExists('events', 'revenue', 'DECIMAL(10,2) NOT NULL DEFAULT 0.00');
    await addColumnIfNotExists('events', 'expenses', 'DECIMAL(10,2) NOT NULL DEFAULT 0.00');
    await addColumnIfNotExists('events', 'profit', 'DECIMAL(10,2) NOT NULL DEFAULT 0.00');
    await addColumnIfNotExists('events', 'featured', 'BOOLEAN NOT NULL DEFAULT FALSE');
    
    console.log('✅ Events table structure updated successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error updating events table structure:', error);
    return false;
  }
};

// Main function to update database
const updateDatabase = async () => {
  try {
    console.log('🔄 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');

    const confirmed = await askForConfirmation();
    if (!confirmed) {
      console.log('❌ Migration cancelled by user.');
      rl.close();
      return;
    }

    console.log('🚀 Starting database update...');
    
    // Update tables structure
    await updateEventsTable();
    
    console.log('✅ Database update completed successfully!');
    rl.close();
  } catch (error) {
    console.error('❌ Error during database update:', error);
    rl.close();
    process.exit(1);
  }
};

// Check if this script is being run directly
if (require.main === module) {
  // Run the migration
  updateDatabase();
} else {
  // Export for use in other scripts
  module.exports = { updateDatabase };
} 