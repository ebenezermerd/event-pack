const { TicketType, Event } = require("../models/association")
const { generateRandomString } = require("../utils/helpers")

// Get all ticket types for an event
exports.getEventTicketTypes = async (req, res) => {
  try {
    const { eventId } = req.params

    // Check if the event exists
    const event = await Event.findByPk(eventId)
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" })
    }

    const ticketTypes = await TicketType.findAll({
      where: { eventId },
      order: [["price", "ASC"]],
    })

    res.status(200).json({ success: true, ticketTypes })
  } catch (error) {
    console.error("Error fetching ticket types:", error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// Create a new ticket type for an event (organizer only)
exports.createTicketType = async (req, res) => {
  try {
    const { eventId } = req.params
    const organizerId = req.user.id

    // Check if the event exists and belongs to the organizer
    const event = await Event.findOne({
      where: { id: eventId, organizerId },
    })

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or you do not have permission to manage this event",
      })
    }

    // Create the ticket type
    const ticketType = await TicketType.create({
      ...req.body,
      eventId,
    })

    res.status(201).json({
      success: true,
      message: "Ticket type created successfully",
      ticketType,
    })
  } catch (error) {
    console.error("Error creating ticket type:", error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// Update a ticket type (organizer only)
exports.updateTicketType = async (req, res) => {
  try {
    const { id } = req.params
    const organizerId = req.user.id

    // Find the ticket type
    const ticketType = await TicketType.findByPk(id, {
      include: [{ model: Event }],
    })

    if (!ticketType) {
      return res.status(404).json({ success: false, message: "Ticket type not found" })
    }

    // Check if the event belongs to the organizer
    if (ticketType.Event.organizerId !== organizerId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this ticket type",
      })
    }

    // Update the ticket type
    await ticketType.update(req.body)

    res.status(200).json({
      success: true,
      message: "Ticket type updated successfully",
      ticketType,
    })
  } catch (error) {
    console.error("Error updating ticket type:", error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// Delete a ticket type (organizer only)
exports.deleteTicketType = async (req, res) => {
  try {
    const { id } = req.params
    const organizerId = req.user.id

    // Find the ticket type
    const ticketType = await TicketType.findByPk(id, {
      include: [{ model: Event }],
    })

    if (!ticketType) {
      return res.status(404).json({ success: false, message: "Ticket type not found" })
    }

    // Check if the event belongs to the organizer
    if (ticketType.Event.organizerId !== organizerId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this ticket type",
      })
    }

    // Delete the ticket type
    await ticketType.destroy()

    res.status(200).json({
      success: true,
      message: "Ticket type deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting ticket type:", error)
    res.status(500).json({ success: false, message: error.message })
  }
}
