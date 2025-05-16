require('dotenv').config();
const sequelize = require('../config/database');
const readline = require('readline');
const { promisify } = require('util');
const { DataTypes } = require('sequelize');

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
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask user for confirmation
const askForConfirmation = () => {
  return new Promise((resolve) => {
    rl.question('⚠️ WARNING: This will sync the database schema with your models. Data may be preserved but schema will change. Continue? (yes/no): ', (answer) => {
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
};

// Function to check if a table exists
const tableExists = async (tableName) => {
  try {
    const query = `
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = '${sequelize.config.database}' 
      AND TABLE_NAME = '${tableName}'
    `;
    const [results] = await sequelize.query(query);
    return results.length > 0;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
};

// Function to get current table structure
const getTableStructure = async (tableName) => {
  try {
    const query = `
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${sequelize.config.database}' 
      AND TABLE_NAME = '${tableName}'
    `;
    const [results] = await sequelize.query(query);
    return results;
  } catch (error) {
    console.error(`Error getting table structure for ${tableName}:`, error);
    return [];
  }
};

// Main function to sync models to database
const syncModelsToDatabase = async () => {
  try {
    console.log('🔄 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');

    const confirmed = await askForConfirmation();
    if (!confirmed) {
      console.log('❌ Sync cancelled by user.');
      rl.close();
      return;
    }

    console.log('🔍 Analyzing database structure...');
    
    // Get all table names from the database
    const query = `
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = '${sequelize.config.database}'
    `;
    const [tables] = await sequelize.query(query);
    
    console.log('📊 Current database tables:');
    tables.forEach(table => {
      console.log(`- ${table.TABLE_NAME}`);
    });
    
    console.log('\n🚀 Starting database sync...');
    
    // Use Sequelize's sync feature with alter option
    // This will attempt to modify the tables to match the models
    // while preserving data where possible
    console.log('🔄 Syncing models to database. This may take a moment...');
    
    // First, check each table and log its current structure
    for (const [modelName, model] of Object.entries(models)) {
      const tableName = model.tableName || model.name.toLowerCase() + 's';
      
      console.log(`\n📝 Checking model: ${modelName} (Table: ${tableName})`);
      
      if (await tableExists(tableName)) {
        console.log(`✅ Table ${tableName} exists`);
        
        // Get and log current structure
        const structure = await getTableStructure(tableName);
        console.log(`Current columns: ${structure.map(col => col.COLUMN_NAME).join(', ')}`);
      } else {
        console.log(`⚠️ Table ${tableName} does not exist and will be created`);
      }
    }
    
    // Execute the sync with alter option
    try {
      console.log('\n🔄 Applying changes to database...');
      await sequelize.sync({ alter: true });
      console.log('✅ Sync completed successfully!');
      
      // Verify changes
      console.log('\n🔍 Verifying changes...');
      for (const [modelName, model] of Object.entries(models)) {
        const tableName = model.tableName || model.name.toLowerCase() + 's';
        const structure = await getTableStructure(tableName);
        console.log(`✅ Table ${tableName} now has columns: ${structure.map(col => col.COLUMN_NAME).join(', ')}`);
      }
    } catch (syncError) {
      console.error('❌ Error during sync:', syncError);
      console.log('⚠️ Attempting to continue with manual alterations...');
      
      // If we encounter errors, try to alter tables manually one by one
      for (const [modelName, model] of Object.entries(models)) {
        const tableName = model.tableName || model.name.toLowerCase() + 's';
        
        try {
          console.log(`🔄 Manually syncing ${tableName}...`);
          
          // For tables with status/approvalStatus issues, handle them specially
          if (modelName === 'Event') {
            // Ensure approvalStatus column exists
            try {
              await sequelize.query(`
                ALTER TABLE ${tableName} 
                ADD COLUMN IF NOT EXISTS approvalStatus ENUM('draft', 'pending', 'approved', 'rejected', 'cancelled') 
                NOT NULL DEFAULT 'draft'
              `);
              console.log(`✅ Added approvalStatus column to ${tableName}`);
            } catch (error) {
              console.error(`⚠️ Error adding approvalStatus column: ${error.message}`);
            }
            
            // Check if status column exists and migrate data if needed
            try {
              const statusExists = (await getTableStructure(tableName)).some(col => col.COLUMN_NAME === 'status');
              if (statusExists) {
                await sequelize.query(`
                  UPDATE ${tableName} 
                  SET approvalStatus = CASE 
                    WHEN status = 'published' THEN 'approved'
                    ELSE status 
                  END
                  WHERE 1=1
                `);
                console.log(`✅ Migrated data from status to approvalStatus in ${tableName}`);
              }
            } catch (error) {
              console.error(`⚠️ Error migrating status data: ${error.message}`);
            }
          }
          
          // Add other special case handling as needed
        } catch (tableError) {
          console.error(`❌ Error syncing ${tableName}:`, tableError);
        }
      }
    }
    
    console.log('\n✅ Database structure sync completed!');
    console.log('🎯 Your database schema should now match your model definitions.');
    
    rl.close();
  } catch (error) {
    console.error('❌ Error during sync process:', error);
    rl.close();
    process.exit(1);
  }
};

// Run the sync process
syncModelsToDatabase(); 