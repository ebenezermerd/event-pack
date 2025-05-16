require('dotenv').config();
const sequelize = require('../config/database');
const readline = require('readline');

// Import all models to register them with Sequelize
const Event = require('../models/event');
const User = require('../models/user');
const Organizer = require('../models/organizer');
const TicketType = require('../models/ticketType');
const EventSchedule = require('../models/eventSchedule');
const EventFAQ = require('../models/eventFAQ');
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const Promotion = require('../models/promotion');
const UserEventInteraction = require('../models/userEventInteraction');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask user for confirmation
const askForConfirmation = () => {
  return new Promise((resolve) => {
    rl.question('⚠️ WARNING: This will DROP ALL TABLES and recreate them. ALL DATA WILL BE LOST. Continue? (yes/no): ', (answer) => {
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
};

// Main function to initialize database
const initializeDatabase = async () => {
  try {
    console.log('🔄 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');

    const confirmed = await askForConfirmation();
    if (!confirmed) {
      console.log('❌ Database initialization cancelled by user.');
      rl.close();
      return;
    }

    console.log('🚀 Starting database initialization...');
    
    // Force sync - this will drop all tables and recreate them
    console.log('🔄 Dropping all tables and recreating based on models...');
    await sequelize.sync({ force: true });
    
    console.log('✅ Database initialization completed successfully!');
    console.log('🎯 Your database now exactly matches your model definitions.');
    
    rl.close();
  } catch (error) {
    console.error('❌ Error during database initialization:', error);
    rl.close();
    process.exit(1);
  }
};

// Run the initialization process
initializeDatabase(); 