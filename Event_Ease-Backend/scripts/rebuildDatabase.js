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
  EventRelationship: require('../models/eventRelationship'),
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

// Function to drop all foreign key constraints
const dropAllForeignKeys = async () => {
  try {
    // Get all tables in the database
    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = '${sequelize.config.database}'
    `);

    // For each table, get and drop its foreign key constraints
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      const [constraints] = await sequelize.query(`
        SELECT CONSTRAINT_NAME
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
        WHERE TABLE_SCHEMA = '${sequelize.config.database}'
        AND TABLE_NAME = '${tableName}'
        AND CONSTRAINT_TYPE = 'FOREIGN KEY'
      `);

      for (const constraint of constraints) {
        const constraintName = constraint.CONSTRAINT_NAME;
        await sequelize.query(`ALTER TABLE \`${tableName}\` DROP FOREIGN KEY \`${constraintName}\``);
        console.log(`Dropped foreign key constraint ${constraintName} from ${tableName}`);
      }
    }
  } catch (error) {
    console.error('Error dropping foreign key constraints:', error);
    throw error;
  }
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
    
    // First drop all foreign key constraints
    console.log('🔄 Dropping all foreign key constraints...');
    await dropAllForeignKeys();
    
    // Then drop all tables and recreate them
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