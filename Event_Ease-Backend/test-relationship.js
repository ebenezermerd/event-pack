// test-relationship.js
const sequelize = require("./config/database");
const { v4: uuidv4 } = require("uuid");
const Event = require("./models/event");
const Organizer = require("./models/organizer");
const User = require("./models/user");
const EventRelationship = require("./models/eventRelationship");

async function testEventRelationship() {
  try {
    console.log("Testing EventRelationship functionality...");
    
    // 1. Check if the table exists
    try {
      const result = await sequelize.query("SHOW TABLES LIKE 'event_relationships'");
      console.log("Table check result:", result[0].length > 0 ? "Table exists" : "Table does not exist");
    } catch (error) {
      console.error("Error checking table:", error.message);
    }
    
    // 2. Get two events to create a relationship between them
    const events = await Event.findAll({ limit: 2 });
    if (events.length < 2) {
      console.log("Not enough events to test relationships. Need at least 2 events.");
      process.exit(0);
    }
    
    // 3. Try to create a relationship
    const relationship = await EventRelationship.create({
      id: uuidv4(),
      eventId: events[0].id,
      relatedEventId: events[1].id,
      relationshipType: "custom",
      strength: 7,
      createdBy: null
    });
    
    console.log("Created relationship:", {
      id: relationship.id,
      eventId: relationship.eventId,
      relatedEventId: relationship.relatedEventId,
      relationshipType: relationship.relationshipType,
      strength: relationship.strength
    });
    
    // 4. Test fetching an event with relationships
    const eventWithRelations = await Event.findOne({
      where: { id: events[0].id },
      include: [
        {
          model: EventRelationship,
          as: 'RelatedEvents',
          include: [{
            model: Event,
            as: 'RelatedEvent',
            include: [{
              model: Organizer,
              include: [{
                model: User,
                attributes: ["name"],
              }],
            }],
          }],
        },
      ],
    });
    
    if (eventWithRelations && eventWithRelations.RelatedEvents) {
      console.log(`Event has ${eventWithRelations.RelatedEvents.length} related events.`);
      
      eventWithRelations.RelatedEvents.forEach((rel, index) => {
        console.log(`Relationship ${index + 1}:`, {
          relationshipType: rel.relationshipType,
          strength: rel.strength,
          relatedEventId: rel.relatedEventId,
          relatedEventTitle: rel.RelatedEvent ? rel.RelatedEvent.title : "N/A"
        });
      });
    } else {
      console.log("Failed to retrieve relationships.");
    }
    
    // 5. Clean up the test relationship
    await relationship.destroy();
    console.log("Test relationship deleted successfully");
    
    console.log("EventRelationship testing completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error testing EventRelationship:", error);
    process.exit(1);
  }
}

testEventRelationship(); 