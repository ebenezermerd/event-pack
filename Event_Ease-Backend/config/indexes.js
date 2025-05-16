// config/indexes.js
const sequelize = require("./database")

async function createIndexes() {
  try {
    const queryInterface = sequelize.getQueryInterface()

    // User indexes
    await queryInterface.addIndex("users", ["email"], {
      name: "idx_users_email",
      unique: true,
    })
    await queryInterface.addIndex("users", ["role"], {
      name: "idx_users_role",
    })
    await queryInterface.addIndex("users", ["status"], {
      name: "idx_users_status",
    })

    // Organizer indexes
    await queryInterface.addIndex("organizers", ["tinNumber"], {
      name: "idx_organizers_tin_number",
      unique: true,
    })
    await queryInterface.addIndex("organizers", ["status"], {
      name: "idx_organizers_status",
    })

    // Event indexes
    await queryInterface.addIndex("events", ["organizerId"], {
      name: "idx_events_organizer_id",
    })
    await queryInterface.addIndex("events", ["status"], {
      name: "idx_events_status",
    })
    await queryInterface.addIndex("events", ["eventDate"], {
      name: "idx_events_date",
    })
    await queryInterface.addIndex("events", ["category"], {
      name: "idx_events_category",
    })
    await queryInterface.addIndex("events", ["featured"], {
      name: "idx_events_featured",
    })

    // TicketType indexes
    await queryInterface.addIndex("ticket_types", ["eventId"], {
      name: "idx_ticket_types_event_id",
    })

    // Order indexes
    await queryInterface.addIndex("orders", ["userId"], {
      name: "idx_orders_user_id",
    })
    await queryInterface.addIndex("orders", ["eventId"], {
      name: "idx_orders_event_id",
    })
    await queryInterface.addIndex("orders", ["status"], {
      name: "idx_orders_status",
    })
    await queryInterface.addIndex("orders", ["purchaseDate"], {
      name: "idx_orders_purchase_date",
    })

    // OrderItem indexes
    await queryInterface.addIndex("order_items", ["orderId"], {
      name: "idx_order_items_order_id",
    })
    await queryInterface.addIndex("order_items", ["ticketTypeId"], {
      name: "idx_order_items_ticket_type_id",
    })
    await queryInterface.addIndex("order_items", ["ticketCode"], {
      name: "idx_order_items_ticket_code",
      unique: true,
    })
    await queryInterface.addIndex("order_items", ["checkInStatus"], {
      name: "idx_order_items_check_in_status",
    })

    // EventSchedule indexes
    await queryInterface.addIndex("event_schedules", ["eventId"], {
      name: "idx_event_schedules_event_id",
    })

    // EventFAQ indexes
    await queryInterface.addIndex("event_faqs", ["eventId"], {
      name: "idx_event_faqs_event_id",
    })

    // Promotion indexes
    await queryInterface.addIndex("promotions", ["eventId"], {
      name: "idx_promotions_event_id",
    })
    await queryInterface.addIndex("promotions", ["code"], {
      name: "idx_promotions_code",
      unique: true,
    })

    // Feedback indexes
    await queryInterface.addIndex("feedback", ["eventId"], {
      name: "idx_feedback_event_id",
    })
    await queryInterface.addIndex("feedback", ["userId"], {
      name: "idx_feedback_user_id",
    })

    // Notification indexes
    await queryInterface.addIndex("notifications", ["userId"], {
      name: "idx_notifications_user_id",
    })
    await queryInterface.addIndex("notifications", ["read"], {
      name: "idx_notifications_read",
    })

    // PaymentTransaction indexes
    await queryInterface.addIndex("payment_transactions", ["orderId"], {
      name: "idx_payment_transactions_order_id",
    })
    await queryInterface.addIndex("payment_transactions", ["transactionId"], {
      name: "idx_payment_transactions_transaction_id",
    })
    await queryInterface.addIndex("payment_transactions", ["status"], {
      name: "idx_payment_transactions_status",
    })

    // SavedEvent indexes
    await queryInterface.addIndex("saved_events", ["userId"], {
      name: "idx_saved_events_user_id",
    })
    await queryInterface.addIndex("saved_events", ["eventId"], {
      name: "idx_saved_events_event_id",
    })
    await queryInterface.addIndex("saved_events", ["userId", "eventId"], {
      name: "idx_saved_events_user_event",
      unique: true,
    })

    // EventReminder indexes
    await queryInterface.addIndex("event_reminders", ["userId"], {
      name: "idx_event_reminders_user_id",
    })
    await queryInterface.addIndex("event_reminders", ["eventId"], {
      name: "idx_event_reminders_event_id",
    })
    await queryInterface.addIndex("event_reminders", ["reminderDate"], {
      name: "idx_event_reminders_date",
    })
    await queryInterface.addIndex("event_reminders", ["reminderSent"], {
      name: "idx_event_reminders_sent",
    })

    // UserEventInteraction indexes
    await queryInterface.addIndex("user_event_interactions", ["userId"], {
      name: "idx_user_event_interactions_user_id",
    })
    await queryInterface.addIndex("user_event_interactions", ["eventId"], {
      name: "idx_user_event_interactions_event_id",
    })
    await queryInterface.addIndex("user_event_interactions", ["interactionType"], {
      name: "idx_user_event_interactions_type",
    })

    // Calendar indexes
    await queryInterface.addIndex("calendars", ["userId"], {
      name: "idx_calendars_user_id",
    })

    // CalendarEvent indexes
    await queryInterface.addIndex("calendar_events", ["calendarId"], {
      name: "idx_calendar_events_calendar_id",
    })
    await queryInterface.addIndex("calendar_events", ["eventId"], {
      name: "idx_calendar_events_event_id",
    })
    await queryInterface.addIndex("calendar_events", ["startDate"], {
      name: "idx_calendar_events_start_date",
    })

    // EventTemplate indexes
    await queryInterface.addIndex("event_templates", ["userId"], {
      name: "idx_event_templates_user_id",
    })
    await queryInterface.addIndex("event_templates", ["eventType"], {
      name: "idx_event_templates_event_type",
    })

    // AIGenerationLog indexes
    await queryInterface.addIndex("ai_generation_logs", ["userId"], {
      name: "idx_ai_generation_logs_user_id",
    })
    await queryInterface.addIndex("ai_generation_logs", ["status"], {
      name: "idx_ai_generation_logs_status",
    })
    await queryInterface.addIndex("ai_generation_logs", ["createdAt"], {
      name: "idx_ai_generation_logs_created_at",
    })

    console.log("All indexes created successfully")
  } catch (error) {
    console.error("Error creating indexes:", error)
    throw error
  }
}

module.exports = { createIndexes }
