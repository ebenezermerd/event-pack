require('dotenv').config();
const { Sequelize } = require('sequelize');
const config = require('../config/config');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask for MySQL root password
const askForRootPassword = () => {
  return new Promise((resolve) => {
    rl.question('Enter MySQL root password to grant privileges (leave empty if not needed): ', (password) => {
      resolve(password);
    });
  });
};

// Function to execute SQL queries
const executeQuery = async (sequelize, query) => {
  try {
    await sequelize.query(query);
    console.log(`✅ SQL executed successfully: ${query}`);
    return true;
  } catch (error) {
    console.error(`❌ Error executing SQL: ${query}`);
    console.error(error.message);
    return false;
  }
};

// Main function
const setupDatabase = async () => {
  console.log('🔄 Starting database setup...');
  
  // Get DB config from environment
  const dbName = config.DB_CONFIG.database;
  const dbUser = config.DB_CONFIG.user;
  const dbHost = config.DB_CONFIG.host;
  
  console.log(`📊 Database: ${dbName}`);
  console.log(`👤 User: ${dbUser}`);
  
  // Ask for root password
  const rootPassword = await askForRootPassword();
  
  // Create root connection to MySQL
  let rootSequelize;
  try {
    rootSequelize = new Sequelize('mysql', 'root', rootPassword, {
      host: dbHost,
      dialect: 'mysql',
      logging: false
    });
    
    await rootSequelize.authenticate();
    console.log('✅ Connected to MySQL as root');
    
    // Grant all privileges to the user
    const grantQuery = `GRANT ALL PRIVILEGES ON ${dbName}.* TO '${dbUser}'@'${dbHost}';`;
    const flushQuery = 'FLUSH PRIVILEGES;';
    
    if (await executeQuery(rootSequelize, grantQuery) && 
        await executeQuery(rootSequelize, flushQuery)) {
      console.log(`✅ Granted all privileges to ${dbUser} on ${dbName}`);
    } else {
      console.log('⚠️ Could not grant full privileges. Continuing with limited permissions.');
    }
    
    await rootSequelize.close();
  } catch (error) {
    console.error('❌ Could not connect as root:', error.message);
    console.log('⚠️ Continuing with regular user permissions...');
  }
  
  // Test connection with application user
  try {
    const appSequelize = new Sequelize(
      dbName,
      dbUser,
      config.DB_CONFIG.password,
      {
        host: dbHost,
        dialect: config.DB_CONFIG.dialect,
        logging: false
      }
    );
    
    await appSequelize.authenticate();
    console.log(`✅ Connected to ${dbName} as ${dbUser}`);
    
    // Check what tables exist
    const [tables] = await appSequelize.query('SHOW TABLES;');
    console.log('\n📋 Existing tables:');
    tables.forEach(table => {
      console.log(`- ${Object.values(table)[0]}`);
    });
    
    // Ask if user wants to continue with migration
    rl.question('\n🚨 Do you want to run the migration script now? This will update database structure. (yes/no): ', async (answer) => {
      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        console.log('🚀 Running migration script...');
        require('./migrateDatabase');
      } else {
        console.log('❌ Migration cancelled by user.');
        rl.close();
      }
    });
    
  } catch (error) {
    console.error('❌ Error connecting to database:', error.message);
    rl.close();
    process.exit(1);
  }
};

// Run the setup
setupDatabase(); 