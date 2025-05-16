const { Booking, User, Event, TicketType } = require("../models/association")
const { Op } = require("sequelize")
const sequelize = require("../config/database")
const crypto = require("crypto")

// Generate a random booking reference
const generateBookingReference = () => {
  return crypto.randomBytes(5).toString("hex").toUpperCase()
}

// Book an event with a specific ticket type
exports.bookEvent = async (req, res) => {
  const transaction = await sequelize.transaction()

  try {
    const { eventId, ticketTypeId, quantity } = req.body
    const userId = req.user.id

    // Validate input
    if (!eventId || !ticketTypeId || !quantity || quantity < 1) {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        message: "Invalid booking details. Please provide eventId, ticketTypeId, and a valid quantity.",
      })
    }

    // Check if the event exists
    const event = await Event.findByPk(eventId, { transaction })
    if (!event) {
      await transaction.rollback()
      return res.status(404).json({ success: false, message: "Event not found" })
    }

    // Check if the ticket type exists and belongs to the event
    const ticketType = await TicketType.findOne({
      where: { id: ticketTypeId, eventId },
      transaction,
    })

    if (!ticketType) {
      await transaction.rollback()
      return res.status(404).json({ success: false, message: "Ticket type not found for this event" })
    }

    // Check if there are enough tickets available
    if (ticketType.quantity - ticketType.sold < quantity) {
      await transaction.rollback()
      return res.status(400).json({ success: false, message: "Not enough tickets available" })
    }

    // Check if the user is exceeding the max per user limit
    if (ticketType.maxPerUser) {
      const userBookingsCount =
        (await Booking.sum("quantity", {
          where: {
            userId,
            eventId,
            ticketTypeId,
            status: {
              [Op.notIn]: ["cancelled"],
            },
          },
          transaction,
        })) || 0

      if (userBookingsCount + quantity > ticketType.maxPerUser) {
        await transaction.rollback()
        return res.status(400).json({
          success: false,
          message: `You can only book a maximum of ${ticketType.maxPerUser} tickets of this type`,
        })
      }
    }

    // Calculate total price
    const totalPrice = ticketType.isFree ? 0 : ticketType.price * quantity

    // Generate a unique booking reference
    const bookingReference = generateBookingReference()

    // Create the booking
    const booking = await Booking.create(
      {
        userId,
        eventId,
        ticketTypeId,
        quantity,
        totalPrice,
        status: "confirmed",
        bookingReference,
      },
      { transaction },
    )

    // Update the sold count for the ticket type
    await ticketType.update(
      {
        sold: ticketType.sold + quantity,
      },
      { transaction },
    )

    // Commit the transaction
    await transaction.commit()

    // Fetch the complete booking with related data
    const completeBooking = await Booking.findByPk(booking.id, {
      include: [
        {
          model: Event,
          attributes: ["title", "startDate", "endDate", "location", "image"],
        },
        {
          model: TicketType,
          attributes: ["name", "description", "price", "isFree"],
        },
        {
          model: User,
          attributes: ["firstName", "lastName", "email", "phone"],
        },
      ],
    })

    res.status(201).json({
      success: true,
      message: "Event booked successfully",
      booking: completeBooking,
    })
  } catch (error) {
    // Rollback the transaction in case of error
    await transaction.rollback()
    console.error("Error booking event:", error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get all bookings for the logged-in user
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id

    const bookings = await Booking.findAll({
      where: { userId },
      include: [
        {
          model: Event,
          attributes: ["title", "startDate", "endDate", "location", "image"],
        },
        {
          model: TicketType,
          attributes: ["name", "description", "price", "isFree"],
        },
      ],
      order: [["createdAt", "DESC"]],
    })

    res.status(200).json({ success: true, bookings })
  } catch (error) {
    console.error("Error fetching user bookings:", error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get a single booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const booking = await Booking.findOne({
      where: { id, userId },
      include: [
        {
          model: Event,
          attributes: ["title", "startDate", "endDate", "location", "image"],
        },
        {
          model: TicketType,
          attributes: ["name", "description", "price", "isFree"],
        },
        {
          model: User,
          attributes: ["firstName", "lastName", "email", "phone"],
        },
      ],
    })

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" })
    }

    res.status(200).json({ success: true, booking })
  } catch (error) {
    console.error("Error fetching booking:", error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get booking by reference number (public)
exports.getBookingByReference = async (req, res) => {
  try {
    const { reference } = req.params

    const booking = await Booking.findOne({
      where: { bookingReference: reference },
      include: [
        {
          model: Event,
          attributes: ["title", "startDate", "endDate", "location", "image"],
        },
        {
          model: TicketType,
          attributes: ["name", "description", "price", "isFree"],
        },
        {
          model: User,
          attributes: ["firstName", "lastName", "email", "phone"],
        },
      ],
    })

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" })
    }

    res.status(200).json({ success: true, booking })
  } catch (error) {
    console.error("Error fetching booking by reference:", error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// Cancel a booking
exports.cancelBooking = async (req, res) => {
  const transaction = await sequelize.transaction()

  try {
    const { id } = req.params
    const userId = req.user.id

    // Find the booking
    const booking = await Booking.findOne({
      where: { id, userId },
      include: [{ model: TicketType }],
      transaction,
    })

    if (!booking) {
      await transaction.rollback()
      return res.status(404).json({ success: false, message: "Booking not found" })
    }

    // Check if the booking can be cancelled
    if (booking.status === "cancelled") {
      await transaction.rollback()
      return res.status(400).json({ success: false, message: "Booking is already cancelled" })
    }

    if (booking.status === "checked-in") {
      await transaction.rollback()
      return res.status(400).json({ success: false, message: "Cannot cancel a checked-in booking" })
    }

    // Update the booking status
    await booking.update({ status: "cancelled" }, { transaction })

    // Update the ticket type sold count
    await booking.TicketType.update(
      {
        sold: booking.TicketType.sold - booking.quantity,
      },
      { transaction },
    )

    // Commit the transaction
    await transaction.commit()

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
    })
  } catch (error) {
    // Rollback the transaction in case of error
    await transaction.rollback()
    console.error("Error cancelling booking:", error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get all bookings for an event (organizer only)
exports.getEventBookings = async (req, res) => {
  try {
    const { eventId } = req.params
    const organizerId = req.user.id

    // Check if the event belongs to the organizer
    const event = await Event.findOne({
      where: { id: eventId, organizerId },
    })

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or you do not have permission to view its bookings",
      })
    }

    // Get all bookings for the event
    const bookings = await Booking.findAll({
      where: { eventId },
      include: [
        {
          model: User,
          attributes: ["firstName", "lastName", "email", "phone"],
        },
        {
          model: TicketType,
          attributes: ["name", "price", "isFree"],
        },
      ],
      order: [["createdAt", "DESC"]],
    })

    res.status(200).json({ success: true, bookings })
  } catch (error) {
    console.error("Error fetching event bookings:", error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// Check in a booking (organizer only)
exports.checkInBooking = async (req, res) => {
  try {
    const { bookingId } = req.params
    const organizerId = req.user.id

    // Find the booking with its event
    const booking = await Booking.findByPk(bookingId, {
      include: [{ model: Event }],
    })

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" })
    }

    // Check if the event belongs to the organizer
    if (booking.Event.organizerId !== organizerId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to check in attendees for this event",
      })
    }

    // Check if the booking is already checked in
    if (booking.status === "checked-in") {
      return res.status(400).json({ success: false, message: "Booking is already checked in" })
    }

    // Check if the booking is cancelled
    if (booking.status === "cancelled") {
      return res.status(400).json({ success: false, message: "Cannot check in a cancelled booking" })
    }

    // Update the booking status
    await booking.update({ status: "checked-in" })

    res.status(200).json({
      success: true,
      message: "Attendee checked in successfully",
    })
  } catch (error) {
    console.error("Error checking in booking:", error)
    res.status(500).json({ success: false, message: error.message })
  }
}
