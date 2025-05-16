require('dotenv').config();
const sequelize = require('../config/database');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask user for confirmation
const askForConfirmation = () => {
  return new Promise((resolve) => {
    rl.question('⚠️ WARNING: This will update the events table structure. Are you sure you want to continue? (yes/no): ', (answer) => {
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

// Function to update the events table structure
const updateEventsTable = async () => {
  try {
    console.log('🔄 Updating events table structure...');
    
    // Add missing column for longDescription
    await addColumnIfNotExists('events', 'longDescription', 'TEXT NULL');
    
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
    
    // Update events table structure
    await updateEventsTable();
    
    console.log('✅ Database update completed successfully!');
    rl.close();
  } catch (error) {
    console.error('❌ Error during database update:', error);
    rl.close();
    process.exit(1);
  }
};

// Run the migration
updateDatabase(); 