// models/association.js
const User = require("./user")
const Organizer = require("./organizer")
const Event = require("./event")
const TicketType = require("./ticketType")
const Order = require("./order")
const OrderItem = require("./orderItem")
const Booking = require("./booking")
const EventSchedule = require("./eventSchedule")
const EventFAQ = require("./eventFAQ")
const EventReview = require("./eventReview")
const EventAttendee = require("./eventAttendee")
const EventSpeaker = require("./eventSpeaker")
const EventCategory = require("./eventCategory")
const EventTag = require("./eventTag")
const EventSponsor = require("./eventSponsor")
const Payment = require("./payment")
const AIGenerationLog = require("./aiGenerationLog")
const EventTemplate = require("./eventTemplate")
const Promotion = require("./promotion")
const Feedback = require("./feedback")
const Notification = require("./notification")
const PaymentTransaction = require("./paymentTransaction")
const SavedEvent = require("./savedEvent")
const EventReminder = require("./eventReminder")
const UserEventInteraction = require("./userEventInteraction")
const Calendar = require("./calendar")
const CalendarEvent = require("./calendarEvent")
const EventRelationship = require("./eventRelationship")

// User and Organizer associations
User.hasOne(Organizer, { foreignKey: "userId" })
Organizer.belongsTo(User, { foreignKey: "userId" })

// Event associations
Event.belongsTo(Organizer, { foreignKey: "organizerId" })
Organizer.hasMany(Event, { foreignKey: "organizerId" })

// TicketType associations
TicketType.belongsTo(Event, { foreignKey: "eventId" })
Event.hasMany(TicketType, { foreignKey: "eventId" })

// Order associations
Order.belongsTo(User, { foreignKey: "userId" })
User.hasMany(Order, { foreignKey: "userId" })

Order.belongsTo(Event, { foreignKey: "eventId" })
Event.hasMany(Order, { foreignKey: "eventId" })

Order.belongsTo(Promotion, { foreignKey: "promotionId" })
Promotion.hasMany(Order, { foreignKey: "promotionId" })

// OrderItem associations
OrderItem.belongsTo(Order, { foreignKey: "orderId" })
Order.hasMany(OrderItem, { foreignKey: "orderId" })

OrderItem.belongsTo(TicketType, { foreignKey: "ticketTypeId" })
TicketType.hasMany(OrderItem, { foreignKey: "ticketTypeId" })

// Booking associations
Booking.belongsTo(Order, { foreignKey: "orderId" })
Order.hasMany(Booking, { foreignKey: "orderId" })

// Event Schedule associations
EventSchedule.belongsTo(Event, { foreignKey: "eventId" })
Event.hasMany(EventSchedule, { foreignKey: "eventId" })

// Event FAQ associations
EventFAQ.belongsTo(Event, { foreignKey: "eventId" })
Event.hasMany(EventFAQ, { foreignKey: "eventId" })

// Event Review associations
EventReview.belongsTo(Event, { foreignKey: "eventId" })
Event.hasMany(EventReview, { foreignKey: "eventId" })

EventReview.belongsTo(User, { foreignKey: "userId" })
User.hasMany(EventReview, { foreignKey: "userId" })

// Event Attendee associations
EventAttendee.belongsTo(Event, { foreignKey: "eventId" })
Event.hasMany(EventAttendee, { foreignKey: "eventId" })

EventAttendee.belongsTo(User, { foreignKey: "userId" })
User.hasMany(EventAttendee, { foreignKey: "userId" })

// Event Speaker associations
EventSpeaker.belongsTo(Event, { foreignKey: "eventId" })
Event.hasMany(EventSpeaker, { foreignKey: "eventId" })

// Event Category associations
EventCategory.belongsTo(Event, { foreignKey: "eventId" })
Event.hasMany(EventCategory, { foreignKey: "eventId" })

// Event Tag associations
EventTag.belongsTo(Event, { foreignKey: "eventId" })
Event.hasMany(EventTag, { foreignKey: "eventId" })

// Event Sponsor associations
EventSponsor.belongsTo(Event, { foreignKey: "eventId" })
Event.hasMany(EventSponsor, { foreignKey: "eventId" })

// Payment associations
Payment.belongsTo(Order, { foreignKey: "orderId" })
Order.hasOne(Payment, { foreignKey: "orderId" })

// Promotion associations
Promotion.belongsTo(Event, { foreignKey: "eventId" })
Event.hasMany(Promotion, { foreignKey: "eventId" })

// Feedback associations
Feedback.belongsTo(Event, { foreignKey: "eventId" })
Event.hasMany(Feedback, { foreignKey: "eventId" })

Feedback.belongsTo(User, { foreignKey: "userId" })
User.hasMany(Feedback, { foreignKey: "userId" })

// Notification associations
Notification.belongsTo(User, { foreignKey: "userId" })
User.hasMany(Notification, { foreignKey: "userId" })

// PaymentTransaction associations
PaymentTransaction.belongsTo(Order, { foreignKey: "orderId" })
Order.hasMany(PaymentTransaction, { foreignKey: "orderId" })

// SavedEvent associations
SavedEvent.belongsTo(User, { foreignKey: "userId" })
User.hasMany(SavedEvent, { foreignKey: "userId" })

SavedEvent.belongsTo(Event, { foreignKey: "eventId" })
Event.hasMany(SavedEvent, { foreignKey: "eventId" })

// EventReminder associations
EventReminder.belongsTo(User, { foreignKey: "userId" })
User.hasMany(EventReminder, { foreignKey: "userId" })

EventReminder.belongsTo(Event, { foreignKey: "eventId" })
Event.hasMany(EventReminder, { foreignKey: "eventId" })

// UserEventInteraction associations
UserEventInteraction.belongsTo(User, { foreignKey: "userId" })
User.hasMany(UserEventInteraction, { foreignKey: "userId" })

UserEventInteraction.belongsTo(Event, { foreignKey: "eventId" })
Event.hasMany(UserEventInteraction, { foreignKey: "eventId" })

// Calendar associations
Calendar.belongsTo(User, { foreignKey: "userId" })
User.hasMany(Calendar, { foreignKey: "userId" })

// CalendarEvent associations
CalendarEvent.belongsTo(Calendar, { foreignKey: "calendarId" })
Calendar.hasMany(CalendarEvent, { foreignKey: "calendarId" })

CalendarEvent.belongsTo(Event, { foreignKey: "eventId" })
Event.hasMany(CalendarEvent, { foreignKey: "eventId" })

// EventTemplate associations
EventTemplate.belongsTo(User, { foreignKey: "userId" })
User.hasMany(EventTemplate, { foreignKey: "userId" })

// AIGenerationLog associations
AIGenerationLog.belongsTo(User, { foreignKey: "userId" })
User.hasMany(AIGenerationLog, { foreignKey: "userId" })

// We don't need to redefine the EventRelationship associations here since they are defined in the model file

module.exports = {
  User,
  Organizer,
  Event,
  TicketType,
  Order,
  OrderItem,
  Booking,
  EventSchedule,
  EventFAQ,
  EventReview,
  EventAttendee,
  EventSpeaker,
  EventCategory,
  EventTag,
  EventSponsor,
  Payment,
  Promotion,
  Feedback,
  Notification,
  PaymentTransaction,
  SavedEvent,
  EventReminder,
  UserEventInteraction,
  Calendar,
  CalendarEvent,
  EventTemplate,
  AIGenerationLog,
  EventRelationship,
}
