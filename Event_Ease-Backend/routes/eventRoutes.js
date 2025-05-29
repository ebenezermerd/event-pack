// routes/eventRoutes.js
const express = require("express")
const router = express.Router()
const eventController = require("../controllers/eventController")
const { userAuth, checkRole } = require("../middleware/authMiddleware")
const validate = require("../middleware/validate")
const Joi = require("joi")

// Validation schemas
const createEventSchema = Joi.object({
  title: Joi.string().required(),
  caption: Joi.string().optional(),
  description: Joi.string().required(),
  longDescription: Joi.string().optional(),
  date: Joi.date().required(),
  time: Joi.string().required(),
  location: Joi.string().required(),
  address: Joi.string().required(),
  region: Joi.string().required(),
  category: Joi.string().required(),
  image: Joi.string().optional(),
  gallery: Joi.array().items(Joi.string()).optional(),
  maxAttendees: Joi.number().integer().min(1).optional(),
  // Additional fields from frontend
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  isFree: Joi.boolean().optional(),
  price: Joi.number().optional(),
  ticketInfo: Joi.object({
    name: Joi.string().optional(),
    description: Joi.string().optional(),
    price: Joi.any().optional()
  }).optional(),
  additionalInfo: Joi.string().optional()
})

const updateEventSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  longDescription: Joi.string().optional(),
  date: Joi.date().optional(),
  time: Joi.string().optional(),
  location: Joi.string().optional(),
  address: Joi.string().optional(),
  region: Joi.string().optional(),
  category: Joi.string().optional(),
  image: Joi.string().optional(),
  gallery: Joi.array().items(Joi.string()).optional(),
  maxAttendees: Joi.number().integer().min(1).optional(),
  featured: Joi.boolean().optional(),
})

const createOrderSchema = Joi.object({
  tickets: Joi.array()
    .items(
      Joi.object({
        ticketTypeId: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
        attendeeName: Joi.string().optional(),
        attendeeEmail: Joi.string().email().optional(),
      }),
    )
    .required(),
  promotionCode: Joi.string().optional(),
  billingName: Joi.string().required(),
  billingEmail: Joi.string().email().required(),
  billingAddress: Joi.string().optional(),
})

// Public routes
router.get("/events/categories", eventController.getEventCategories)
router.get("/events/filters", eventController.getEventFilters)
router.get("/events", eventController.getEvents)
router.get("/events/:id", eventController.getEventById)
router.get("/events/:id/tickets", eventController.getEventTickets)

// Test route with explicit authentication check
router.get("/test-events", (req, res) => {
  res.status(200).json({
    success: true,
    message: "This is a test endpoint that works without authentication",
  });
});

// Protected routes
router.post("/events", userAuth, validate(createEventSchema), eventController.createEvent)
router.put("/events/:id", userAuth, validate(updateEventSchema), eventController.updateEvent)
router.delete("/events/:id", userAuth, eventController.deleteEvent)
router.post("/events/:id/orders", userAuth, validate(createOrderSchema), eventController.createOrder)

module.exports = router
