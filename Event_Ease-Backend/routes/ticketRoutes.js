const express = require("express")
const router = express.Router()
const ticketController = require("../controllers/ticketController")
const { userAuth, checkRole } = require("../middleware/authMiddleware")

// Public route to get ticket types for an event
router.get("/events/:eventId/ticket-types", ticketController.getEventTicketTypes)

// Organizer routes for ticket type management
router.post(
  "/organizer/events/:eventId/ticket-types",
  userAuth,
  checkRole("organizer"),
  ticketController.createTicketType,
)

router.put("/organizer/ticket-types/:id", userAuth, checkRole("organizer"), ticketController.updateTicketType)

router.delete("/organizer/ticket-types/:id", userAuth, checkRole("organizer"), ticketController.deleteTicketType)

module.exports = router
