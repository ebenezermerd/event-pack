// create-relationship-table.js
const sequelize = require("./config/database");
const EventRelationship = require("./models/eventRelationship");

async function createTable() {
  try {
    // This will create the table, dropping it first if it exists
    await EventRelationship.sync({ force: true });
    console.log("EventRelationship table has been created!");
    
    // Also create indexes manually in case sync doesn't handle them correctly
    await sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS unique_relationship 
      ON event_relationships (eventId, relatedEventId);
    `);
    
    console.log("Indexes created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error creating EventRelationship table:", error);
    process.exit(1);
  }
}

createTable(); 