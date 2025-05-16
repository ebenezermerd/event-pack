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
    rl.question('⚠️ WARNING: This will modify database columns. Continue? (yes/no): ', (answer) => {
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

// Function to modify column if it exists
const modifyColumnIfExists = async (tableName, columnName, columnDefinition) => {
  try {
    const exists = await columnExists(tableName, columnName);
    if (exists) {
      const query = `ALTER TABLE ${tableName} MODIFY COLUMN ${columnName} ${columnDefinition}`;
      await sequelize.query(query);
      console.log(`✅ Modified column ${columnName} in ${tableName}`);
      return true;
    } else {
      console.log(`⚠️ Column ${columnName} does not exist in ${tableName}`);
      return false;
    }
  } catch (error) {
    console.error(`Error modifying column ${columnName} in ${tableName}:`, error);
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
      console.log(`⚠️ Neither column ${oldColumnName} nor ${newColumnName} exist in ${tableName}`);
      return false;
    } else if (newExists) {
      console.log(`⏩ Column ${newColumnName} already exists in ${tableName}`);
      return false;
    }
  } catch (error) {
    console.error(`Error renaming column ${oldColumnName} to ${newColumnName} in ${tableName}:`, error);
    return false;
  }
};

// Function to fix the organizers table structure
const fixOrganizersTable = async () => {
  try {
    console.log('🔄 Fixing organizers table structure...');
    
    // Add organizer_id column if missing
    await addColumnIfNotExists('organizers', 'id', 'CHAR(36) NOT NULL PRIMARY KEY');
    
    // Ensure the userId column exists
    await addColumnIfNotExists('organizers', 'userId', 'CHAR(36) NOT NULL');
    
    // Create index on userId if not exists
    try {
      await sequelize.query(`CREATE INDEX idx_organizers_userId ON organizers (userId)`);
      console.log('✅ Created index on organizers.userId');
    } catch (error) {
      if (error.message.includes('Duplicate key name') || error.message.includes('already exists')) {
        console.log('⏩ Index on organizers.userId already exists');
      } else {
        console.error('❌ Error creating index on organizers.userId:', error);
      }
    }
    
    console.log('✅ Organizers table structure fixed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error fixing organizers table structure:', error);
    return false;
  }
};

// Function to fix the events table structure
const fixEventsTable = async () => {
  try {
    console.log('🔄 Fixing events table structure...');
    
    // Ensure the correct columns exist
    await addColumnIfNotExists('events', 'approvalStatus', "ENUM('draft', 'pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'draft'");
    
    // Add or rename date column to eventDate
    const dateExists = await columnExists('events', 'date');
    const eventDateExists = await columnExists('events', 'eventDate');
    
    if (dateExists && !eventDateExists) {
      // Rename date to eventDate
      await sequelize.query(`ALTER TABLE events CHANGE COLUMN date eventDate DATETIME NOT NULL`);
      console.log('✅ Renamed column date to eventDate in events');
    } else if (!dateExists && !eventDateExists) {
      // Add eventDate column
      await addColumnIfNotExists('events', 'eventDate', 'DATETIME NOT NULL DEFAULT NOW()');
    }
    
    // Add other missing columns
    await addColumnIfNotExists('events', 'time', 'VARCHAR(255) NULL');
    await addColumnIfNotExists('events', 'address', 'VARCHAR(255) NULL');
    await addColumnIfNotExists('events', 'region', 'VARCHAR(255) NULL');
    await addColumnIfNotExists('events', 'category', 'VARCHAR(255) NULL');
    await addColumnIfNotExists('events', 'gallery', 'JSON NULL');
    await addColumnIfNotExists('events', 'attendees', 'INT NOT NULL DEFAULT 0');
    await addColumnIfNotExists('events', 'maxAttendees', 'INT NULL');
    
    // If status column exists, migrate data from status to approvalStatus
    const statusExists = await columnExists('events', 'status');
    if (statusExists) {
      // Move data from status to approvalStatus
      await sequelize.query(`
        UPDATE events 
        SET approvalStatus = CASE 
          WHEN status = 'published' THEN 'approved'
          ELSE status 
        END
        WHERE 1=1
      `);
      console.log('✅ Migrated data from status to approvalStatus');
    }
    
    console.log('✅ Events table structure fixed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error fixing events table structure:', error);
    return false;
  }
};

// Main function to fix database structure
const fixDatabaseStructure = async () => {
  try {
    console.log('🔄 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');

    const confirmed = await askForConfirmation();
    if (!confirmed) {
      console.log('❌ Database fix cancelled by user.');
      rl.close();
      return;
    }

    console.log('🚀 Starting database structure fix...');
    
    // Fix table structures
    await fixOrganizersTable();
    await fixEventsTable();
    
    console.log('✅ Database structure fixes completed successfully!');
    rl.close();
  } catch (error) {
    console.error('❌ Error during database structure fix:', error);
    rl.close();
    process.exit(1);
  }
};

// Run the fixes
fixDatabaseStructure(); 