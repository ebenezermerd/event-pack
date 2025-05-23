const express = require("express")
const router = express.Router()
const organizerController = require("../controllers/organizerController")
const { userAuth, checkRole } = require("../middleware/authMiddleware")
const validate = require("../middleware/validate")
const Joi = require("joi")

// Apply to become an organizer
router.post("/organizers/apply", userAuth, organizerController.applyToBeOrganizer)
router.post("/organizer/apply", userAuth, organizerController.applyToBeOrganizer) // Singular alternative

// Organizer profile routes
router.get("/organizers/profile", userAuth, checkRole("organizer"), organizerController.getOrganizerProfile)
router.put("/organizers/profile", userAuth, checkRole("organizer"), organizerController.updateOrganizerProfile)
router.get("/organizer/profile", userAuth, checkRole("organizer"), organizerController.getOrganizerProfile) // Singular alternative
router.put("/organizer/profile", userAuth, checkRole("organizer"), organizerController.updateOrganizerProfile) // Singular alternative

// Organizer events routes
router.get("/organizers/events", userAuth, checkRole("organizer"), organizerController.getOrganizerEvents)
router.get("/organizers/dashboard", userAuth, checkRole("organizer"), organizerController.getOrganizerDashboard)
router.get("/organizers/events/:eventId/attendees", userAuth, checkRole("organizer"), organizerController.getEventAttendees)
router.put("/organizers/events/:eventId/attendees/:attendeeId/check-in", userAuth, checkRole("organizer"), organizerController.checkInAttendee)
router.get("/organizers/events/:id/analytics", userAuth, checkRole("organizer"), organizerController.getEventAnalytics)

// Singular alternatives for organizer event routes
router.get("/organizer/events", userAuth, checkRole("organizer"), organizerController.getOrganizerEvents)
router.get("/organizer/dashboard", userAuth, checkRole("organizer"), organizerController.getOrganizerDashboard)
router.get("/organizer/events/:eventId/attendees", userAuth, checkRole("organizer"), organizerController.getEventAttendees)
router.put("/organizer/events/:eventId/attendees/:attendeeId/check-in", userAuth, checkRole("organizer"), organizerController.checkInAttendee)
router.get("/organizer/events/:id/analytics", userAuth, checkRole("organizer"), organizerController.getEventAnalytics)

module.exports = router
