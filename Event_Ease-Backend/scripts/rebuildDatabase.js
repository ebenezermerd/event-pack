require('dotenv').config();
const sequelize = require('../config/database');
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
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask user for confirmation
const askForConfirmation = () => {
  return new Promise((resolve) => {
    rl.question('⚠️ WARNING: This will DROP all tables and recreate the database from scratch. All data will be lost! Are you absolutely sure you want to continue? (yes/no): ', (answer) => {
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
};

// Main function to rebuild database
const rebuildDatabase = async () => {
  try {
    console.log('🔄 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');

    const confirmed = await askForConfirmation();
    if (!confirmed) {
      console.log('❌ Database rebuild cancelled by user.');
      rl.close();
      return;
    }

    console.log('🚀 Starting database rebuild...');
    
    // Drop all tables and recreate them
    console.log('🔄 Dropping all tables and recreating from model definitions...');
    await sequelize.sync({ force: true });
    
    console.log('✅ Database rebuild completed successfully!');
    console.log('🎉 All tables have been recreated according to the current model definitions.');
    rl.close();
  } catch (error) {
    console.error('❌ Error during database rebuild:', error);
    rl.close();
    process.exit(1);
  }
};

// Run the migration
rebuildDatabase(); 