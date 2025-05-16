// controllers/userController.js
const { Op } = require("sequelize")
const { v4: uuidv4 } = require("uuid")
const User = require("../models/user")
const Order = require("../models/order")
const Event = require("../models/event")
const Notification = require("../models/notification")
const SavedEvent = require("../models/savedEvent")
const OrderItem = require("../models/orderItem")
const TicketType = require("../models/ticketType")
const Calendar = require("../models/calendar")
const CalendarEvent = require("../models/calendarEvent")
const EventReminder = require("../models/eventReminder")
const UserEventInteraction = require("../models/userEventInteraction")
const { getPagination, getPagingData } = require("../utils/pagination")

// Get User Profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password", "resetPasswordToken", "resetPasswordExpires"] },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Update User Profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const { name, phone, avatar, bio, address } = req.body

    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Update user
    await user.update({
      name: name || user.name,
      phone: phone || user.phone,
      avatar: avatar || user.avatar,
      bio: bio || user.bio,
      address: address || user.address,
    })

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        bio: user.bio,
        address: user.address,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get User Orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id
    const { page = 1, limit = 10, status } = req.query
    const { offset, limit: limitValue } = getPagination(page, limit)

    // Build where clause
    const whereClause = { userId }
    if (status) {
      whereClause.status = status
    }

    // Get orders
    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Event,
          attributes: ["id", "title", "eventDate", "location", "image"],
        },
        {
          model: OrderItem,
          include: [
            {
              model: TicketType,
              attributes: ["name", "price"],
            },
          ],
        },
      ],
      order: [["purchaseDate", "DESC"]],
      offset,
      limit: limitValue,
    })

    // Format orders
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      eventId: order.eventId,
      eventTitle: order.Event.title,
      eventDate: order.Event.eventDate,
      eventLocation: order.Event.location,
      eventImage: order.Event.image,
      totalAmount: order.totalAmount,
      status: order.status,
      purchaseDate: order.purchaseDate,
      items: order.OrderItems.map((item) => ({
        id: item.id,
        ticketType: item.TicketType.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
    }))

    const pagination = getPagingData(count, page, limitValue)

    res.status(200).json({
      success: true,
      orders: formattedOrders,
      pagination,
    })
  } catch (error) {
    console.error("Get user orders error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get User Events (events user is attending)
exports.getUserEvents = async (req, res) => {
  try {
    const userId = req.user.id
    const { page = 1, limit = 10, upcoming, past } = req.query
    const { offset, limit: limitValue } = getPagination(page, limit)

    // Build where clause for orders
    const orderWhereClause = {
      userId,
      status: { [Op.in]: ["completed", "pending"] },
    }

    // Build where clause for events
    const eventWhereClause = {}
    if (upcoming === "true") {
      eventWhereClause.eventDate = { [Op.gte]: new Date() }
    } else if (past === "true") {
      eventWhereClause.eventDate = { [Op.lt]: new Date() }
    }

    // Get orders with events
    const { count, rows: orders } = await Order.findAndCountAll({
      where: orderWhereClause,
      include: [
        {
          model: Event,
          where: eventWhereClause,
          attributes: ["id", "title", "eventDate", "time", "location", "image"],
        },
        {
          model: OrderItem,
          include: [
            {
              model: TicketType,
              attributes: ["name"],
            },
          ],
        },
      ],
      order: [[Event, "eventDate", upcoming === "true" ? "ASC" : "DESC"]],
      offset,
      limit: limitValue,
    })

    // Format events
    const formattedEvents = orders.map((order) => ({
      id: order.Event.id,
      title: order.Event.title,
      date: order.Event.eventDate,
      time: order.Event.time,
      location: order.Event.location,
      image: order.Event.image,
      ticketType: order.OrderItems[0]?.TicketType.name,
      orderId: order.id,
      orderStatus: order.status,
    }))

    const pagination = getPagingData(count, page, limitValue)

    res.status(200).json({
      success: true,
      events: formattedEvents,
      pagination,
    })
  } catch (error) {
    console.error("Get user events error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get User Notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id
    const { page = 1, limit = 10, unreadOnly } = req.query
    const { offset, limit: limitValue } = getPagination(page, limit)

    // Build where clause
    const whereClause = { userId }
    if (unreadOnly === "true") {
      whereClause.read = false
    }

    // Get notifications
    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      offset,
      limit: limitValue,
    })

    // Get unread count
    const unreadCount = await Notification.count({
      where: { userId, read: false },
    })

    const pagination = getPagingData(count, page, limitValue)

    res.status(200).json({
      success: true,
      notifications,
      unreadCount,
      pagination,
    })
  } catch (error) {
    console.error("Get user notifications error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Mark Notification as Read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params

    const notification = await Notification.findOne({
      where: { id, userId },
    })

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      })
    }

    await notification.update({ read: true })

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
    })
  } catch (error) {
    console.error("Mark notification as read error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Mark All Notifications as Read
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id

    const result = await Notification.update({ read: true }, { where: { userId, read: false } })

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      count: result[0],
    })
  } catch (error) {
    console.error("Mark all notifications as read error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Delete Notification
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params

    const notification = await Notification.findOne({
      where: { id, userId },
    })

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      })
    }

    await notification.destroy()

    res.status(200).json({
      success: true,
      message: "Notification deleted",
    })
  } catch (error) {
    console.error("Delete notification error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Clear Read Notifications
exports.clearReadNotifications = async (req, res) => {
  try {
    const userId = req.user.id

    const result = await Notification.destroy({
      where: { userId, read: true },
    })

    res.status(200).json({
      success: true,
      message: "Read notifications cleared",
      count: result,
    })
  } catch (error) {
    console.error("Clear read notifications error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get User Saved Events
exports.getSavedEvents = async (req, res) => {
  try {
    const userId = req.user.id
    const { page = 1, limit = 10, category, sortBy = "date" } = req.query
    const { offset, limit: limitValue } = getPagination(page, limit)

    // Build where clause for events
    const eventWhereClause = {}
    if (category) {
      eventWhereClause.category = category
    }

    // Determine order
    let order = [["savedAt", "DESC"]]
    if (sortBy === "date") {
      order = [[Event, "eventDate", "ASC"]]
    } else if (sortBy === "title") {
      order = [[Event, "title", "ASC"]]
    }

    // Get saved events
    const { count, rows: savedEvents } = await SavedEvent.findAndCountAll({
      where: { userId },
      include: [
        {
          model: Event,
          where: eventWhereClause,
          attributes: ["id", "title", "eventDate", "location", "price", "category", "image"],
        },
      ],
      order,
      offset,
      limit: limitValue,
    })

    // Format saved events
    const formattedSavedEvents = savedEvents.map((savedEvent) => ({
      id: savedEvent.id,
      eventId: savedEvent.Event.id,
      title: savedEvent.Event.title,
      date: savedEvent.Event.eventDate,
      location: savedEvent.Event.location,
      price: savedEvent.Event.price,
      category: savedEvent.Event.category,
      image: savedEvent.Event.image,
      savedAt: savedEvent.savedAt,
      notes: savedEvent.notes,
    }))

    const pagination = getPagingData(count, page, limitValue)

    res.status(200).json({
      success: true,
      savedEvents: formattedSavedEvents,
      pagination,
    })
  } catch (error) {
    console.error("Get saved events error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Save Event
exports.saveEvent = async (req, res) => {
  try {
    const userId = req.user.id
    const { eventId, notes } = req.body

    // Check if event exists
    const event = await Event.findByPk(eventId)
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      })
    }

    // Check if already saved
    const existingSavedEvent = await SavedEvent.findOne({
      where: { userId, eventId },
    })

    if (existingSavedEvent) {
      return res.status(400).json({
        success: false,
        message: "Event already saved",
      })
    }

    // Save event
    const savedEvent = await SavedEvent.create({
      id: uuidv4(),
      userId,
      eventId,
      savedAt: new Date(),
      notes,
    })

    // Log interaction
    await UserEventInteraction.create({
      id: uuidv4(),
      userId,
      eventId,
      interactionType: "bookmark",
      interactionDate: new Date(),
    })

    res.status(201).json({
      success: true,
      message: "Event saved successfully",
      savedEvent: {
        id: savedEvent.id,
        eventId: savedEvent.eventId,
        savedAt: savedEvent.savedAt,
        notes: savedEvent.notes,
      },
    })
  } catch (error) {
    console.error("Save event error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Remove Saved Event
exports.removeSavedEvent = async (req, res) => {
  try {
    const userId = req.user.id
    const { eventId } = req.params

    const savedEvent = await SavedEvent.findOne({
      where: { userId, eventId },
    })

    if (!savedEvent) {
      return res.status(404).json({
        success: false,
        message: "Saved event not found",
      })
    }

    await savedEvent.destroy()

    res.status(200).json({
      success: true,
      message: "Event removed from saved events",
    })
  } catch (error) {
    console.error("Remove saved event error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Clear All Saved Events
exports.clearSavedEvents = async (req, res) => {
  try {
    const userId = req.user.id

    const result = await SavedEvent.destroy({
      where: { userId },
    })

    res.status(200).json({
      success: true,
      message: "All saved events cleared",
      count: result,
    })
  } catch (error) {
    console.error("Clear saved events error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get User Tickets
exports.getUserTickets = async (req, res) => {
  try {
    const userId = req.user.id
    const { status } = req.query

    // Build where clause for orders
    const orderWhereClause = { userId }

    // Build where clause for events
    const eventWhereClause = {}
    if (status === "upcoming") {
      eventWhereClause.eventDate = { [Op.gte]: new Date() }
      orderWhereClause.status = { [Op.in]: ["completed", "pending"] }
    } else if (status === "past") {
      eventWhereClause.eventDate = { [Op.lt]: new Date() }
      orderWhereClause.status = { [Op.in]: ["completed", "pending"] }
    } else if (status === "cancelled") {
      orderWhereClause.status = "cancelled"
    }

    // Get orders with tickets
    const orders = await Order.findAll({
      where: orderWhereClause,
      include: [
        {
          model: Event,
          where: eventWhereClause,
          attributes: ["id", "title", "eventDate", "location", "image"],
        },
        {
          model: OrderItem,
          include: [
            {
              model: TicketType,
              attributes: ["name", "price"],
            },
          ],
        },
      ],
      order: [[Event, "eventDate", status === "upcoming" ? "ASC" : "DESC"]],
    })

    // Format tickets
    const tickets = []
    orders.forEach((order) => {
      order.OrderItems.forEach((item) => {
        tickets.push({
          id: item.id,
          eventId: order.eventId,
          eventTitle: order.Event.title,
          eventDate: order.Event.eventDate,
          eventLocation: order.Event.location,
          ticketType: item.TicketType.name,
          price: item.TicketType.price,
          quantity: item.quantity,
          status: order.status,
          checkInStatus: item.checkInStatus,
          ticketCode: item.ticketCode,
          purchaseDate: order.purchaseDate,
        })
      })
    })

    res.status(200).json({
      success: true,
      tickets,
    })
  } catch (error) {
    console.error("Get user tickets error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Download Ticket
exports.downloadTicket = async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params

    const orderItem = await OrderItem.findOne({
      where: { id },
      include: [
        {
          model: Order,
          where: { userId },
          include: [
            {
              model: Event,
              attributes: ["title", "eventDate", "time", "location", "address"],
            },
          ],
        },
        {
          model: TicketType,
          attributes: ["name"],
        },
      ],
    })

    if (!orderItem) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      })
    }

    // Generate PDF ticket (implementation depends on your PDF generation library)
    // For this example, we'll just return the ticket data
    res.status(200).json({
      success: true,
      message: "Ticket download functionality will be implemented with a PDF generation library",
      ticket: {
        id: orderItem.id,
        eventTitle: orderItem.Order.Event.title,
        eventDate: orderItem.Order.Event.eventDate,
        eventTime: orderItem.Order.Event.time,
        eventLocation: orderItem.Order.Event.location,
        eventAddress: orderItem.Order.Event.address,
        ticketType: orderItem.TicketType.name,
        attendeeName: orderItem.attendeeName,
        attendeeEmail: orderItem.attendeeEmail,
        ticketCode: orderItem.ticketCode,
        quantity: orderItem.quantity,
      },
    })
  } catch (error) {
    console.error("Download ticket error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Cancel Ticket
exports.cancelTicket = async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    const { reason } = req.body

    const orderItem = await OrderItem.findOne({
      where: { id },
      include: [
        {
          model: Order,
          where: { userId, status: { [Op.in]: ["pending", "completed"] } },
        },
        {
          model: TicketType,
        },
      ],
    })

    if (!orderItem) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found or cannot be cancelled",
      })
    }

    // Check if ticket is already checked in
    if (orderItem.checkInStatus === "checked_in") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a checked-in ticket",
      })
    }

    // Update order item status
    await orderItem.update({ checkInStatus: "cancelled" })

    // If all items in the order are cancelled, update order status
    const remainingItems = await OrderItem.count({
      where: {
        orderId: orderItem.orderId,
        checkInStatus: { [Op.ne]: "cancelled" },
      },
    })

    if (remainingItems === 0) {
      await orderItem.Order.update({ status: "cancelled" })
    }

    // Update ticket type sold count
    await orderItem.TicketType.update({
      sold: orderItem.TicketType.sold - orderItem.quantity,
    })

    res.status(200).json({
      success: true,
      message: "Ticket cancelled successfully",
      ticket: {
        id: orderItem.id,
        checkInStatus: "cancelled",
      },
    })
  } catch (error) {
    console.error("Cancel ticket error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get Ticket QR Code
exports.getTicketQRCode = async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params

    const orderItem = await OrderItem.findOne({
      where: { id },
      include: [
        {
          model: Order,
          where: { userId },
        },
      ],
    })

    if (!orderItem) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      })
    }

    // Generate QR code (implementation depends on your QR code generation library)
    // For this example, we'll just return the ticket reference
    res.status(200).json({
      success: true,
      qrCodeData: "QR code data will be generated with a QR code library",
      ticketReference: orderItem.ticketCode,
    })
  } catch (error) {
    console.error("Get ticket QR code error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get User Calendar
exports.getUserCalendar = async (req, res) => {
  try {
    const userId = req.user.id
    const { month, year } = req.query

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Month and year are required",
      })
    }

    // Get user calendars
    const calendars = await Calendar.findAll({
      where: { userId },
    })

    if (calendars.length === 0) {
      return res.status(200).json({
        success: true,
        events: [],
      })
    }

    const calendarIds = calendars.map((calendar) => calendar.id)

    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    // Get calendar events
    const calendarEvents = await CalendarEvent.findAll({
      where: {
        calendarId: { [Op.in]: calendarIds },
        [Op.or]: [
          {
            startDate: { [Op.between]: [startDate, endDate] },
          },
          {
            endDate: { [Op.between]: [startDate, endDate] },
          },
          {
            [Op.and]: [{ startDate: { [Op.lte]: startDate } }, { endDate: { [Op.gte]: endDate } }],
          },
        ],
      },
      include: [
        {
          model: Calendar,
          attributes: ["name", "color"],
        },
        {
          model: Event,
          attributes: ["id", "title", "location"],
          required: false,
        },
      ],
    })

    // Format calendar events
    const formattedEvents = calendarEvents.map((event) => ({
      id: event.id,
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      isAllDay: event.isAllDay,
      location: event.location,
      eventId: event.eventId,
      calendarId: event.calendarId,
      calendarName: event.Calendar.name,
      calendarColor: event.Calendar.color,
    }))

    res.status(200).json({
      success: true,
      events: formattedEvents,
    })
  } catch (error) {
    console.error("Get user calendar error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Create Calendar Event
exports.createCalendarEvent = async (req, res) => {
  try {
    const userId = req.user.id
    const { calendarId, eventId, title, description, startDate, endDate, location, isAllDay, recurrence, reminder } =
      req.body

    // Check if calendar belongs to user
    const calendar = await Calendar.findOne({
      where: { id: calendarId, userId },
    })

    if (!calendar) {
      return res.status(404).json({
        success: false,
        message: "Calendar not found",
      })
    }

    // If eventId is provided, check if event exists
    if (eventId) {
      const event = await Event.findByPk(eventId)
      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        })
      }
    }

    // Create calendar event
    const calendarEvent = await CalendarEvent.create({
      id: uuidv4(),
      calendarId,
      eventId,
      title,
      description,
      startDate,
      endDate,
      location,
      isAllDay: isAllDay || false,
      recurrence,
      reminder,
    })

    // If reminder is set, create event reminder
    if (reminder && eventId) {
      const reminderDate = new Date(startDate)
      reminderDate.setMinutes(reminderDate.getMinutes() - reminder)

      await EventReminder.create({
        id: uuidv4(),
        userId,
        eventId,
        reminderDate,
        reminderSent: false,
        reminderType: "email",
      })
    }

    res.status(201).json({
      success: true,
      message: "Calendar event created successfully",
      calendarEvent,
    })
  } catch (error) {
    console.error("Create calendar event error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Update Calendar Event
exports.updateCalendarEvent = async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    const { title, description, startDate, endDate, location, isAllDay, recurrence, reminder } = req.body

    // Check if calendar event exists and belongs to user
    const calendarEvent = await CalendarEvent.findOne({
      where: { id },
      include: [
        {
          model: Calendar,
          where: { userId },
        },
      ],
    })

    if (!calendarEvent) {
      return res.status(404).json({
        success: false,
        message: "Calendar event not found",
      })
    }

    // Update calendar event
    await calendarEvent.update({
      title: title || calendarEvent.title,
      description: description !== undefined ? description : calendarEvent.description,
      startDate: startDate || calendarEvent.startDate,
      endDate: endDate || calendarEvent.endDate,
      location: location !== undefined ? location : calendarEvent.location,
      isAllDay: isAllDay !== undefined ? isAllDay : calendarEvent.isAllDay,
      recurrence: recurrence !== undefined ? recurrence : calendarEvent.recurrence,
      reminder: reminder !== undefined ? reminder : calendarEvent.reminder,
    })

    // If reminder is updated and event is linked, update event reminder
    if (reminder !== undefined && calendarEvent.eventId) {
      // Delete existing reminder
      await EventReminder.destroy({
        where: {
          userId,
          eventId: calendarEvent.eventId,
        },
      })

      // Create new reminder if needed
      if (reminder) {
        const reminderDate = new Date(calendarEvent.startDate)
        reminderDate.setMinutes(reminderDate.getMinutes() - reminder)

        await EventReminder.create({
          id: uuidv4(),
          userId,
          eventId: calendarEvent.eventId,
          reminderDate,
          reminderSent: false,
          reminderType: "email",
        })
      }
    }

    res.status(200).json({
      success: true,
      message: "Calendar event updated successfully",
      calendarEvent,
    })
  } catch (error) {
    console.error("Update calendar event error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Delete Calendar Event
exports.deleteCalendarEvent = async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params

    // Check if calendar event exists and belongs to user
    const calendarEvent = await CalendarEvent.findOne({
      where: { id },
      include: [
        {
          model: Calendar,
          where: { userId },
        },
      ],
    })

    if (!calendarEvent) {
      return res.status(404).json({
        success: false,
        message: "Calendar event not found",
      })
    }

    // Delete event reminder if exists
    if (calendarEvent.eventId) {
      await EventReminder.destroy({
        where: {
          userId,
          eventId: calendarEvent.eventId,
        },
      })
    }

    // Delete calendar event
    await calendarEvent.destroy()

    res.status(200).json({
      success: true,
      message: "Calendar event deleted successfully",
    })
  } catch (error) {
    console.error("Delete calendar event error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get User Calendars
exports.getUserCalendars = async (req, res) => {
  try {
    const userId = req.user.id

    const calendars = await Calendar.findAll({
      where: { userId },
      order: [
        ["isDefault", "DESC"],
        ["name", "ASC"],
      ],
    })

    res.status(200).json({
      success: true,
      calendars,
    })
  } catch (error) {
    console.error("Get user calendars error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Create Calendar
exports.createCalendar = async (req, res) => {
  try {
    const userId = req.user.id
    const { name, color, isDefault } = req.body

    // If setting as default, update existing default calendar
    if (isDefault) {
      await Calendar.update({ isDefault: false }, { where: { userId, isDefault: true } })
    }

    // Create calendar
    const calendar = await Calendar.create({
      id: uuidv4(),
      userId,
      name,
      color: color || "#3788d8",
      isDefault: isDefault || false,
    })

    res.status(201).json({
      success: true,
      message: "Calendar created successfully",
      calendar,
    })
  } catch (error) {
    console.error("Create calendar error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Connect External Calendar
exports.connectExternalCalendar = async (req, res) => {
  try {
    const userId = req.user.id
    const { calendarId, externalCalendarType, authCode } = req.body

    // Check if calendar exists and belongs to user
    const calendar = await Calendar.findOne({
      where: { id: calendarId, userId },
    })

    if (!calendar) {
      return res.status(404).json({
        success: false,
        message: "Calendar not found",
      })
    }

    // Connect to external calendar (implementation depends on the external calendar provider)
    // For this example, we'll just update the calendar with external info
    await calendar.update({
      externalCalendarType,
      externalCalendarId: `external-${Date.now()}`, // This would be the actual ID from the external provider
    })

    res.status(200).json({
      success: true,
      message: "External calendar connected successfully",
      calendar,
    })
  } catch (error) {
    console.error("Connect external calendar error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Sync Calendar
exports.syncCalendar = async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params

    // Check if calendar exists and belongs to user
    const calendar = await Calendar.findOne({
      where: { id, userId },
    })

    if (!calendar) {
      return res.status(404).json({
        success: false,
        message: "Calendar not found",
      })
    }

    if (!calendar.externalCalendarId || !calendar.externalCalendarType) {
      return res.status(400).json({
        success: false,
        message: "Calendar is not connected to an external calendar",
      })
    }

    // Sync with external calendar (implementation depends on the external calendar provider)
    // For this example, we'll just return a success message
    res.status(200).json({
      success: true,
      message: "Calendar synced successfully",
      eventsAdded: 0,
      eventsUpdated: 0,
      eventsRemoved: 0,
    })
  } catch (error) {
    console.error("Sync calendar error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get Event Feed
exports.getEventFeed = async (req, res) => {
  try {
    const userId = req.user.id
    const { page = 1, limit = 10, search, category, date } = req.query
    const { offset, limit: limitValue } = getPagination(page, limit)

    // Build where clause
    const whereClause = {}
    if (search) {
      whereClause[Op.or] = [{ title: { [Op.like]: `%${search}%` } }, { description: { [Op.like]: `%${search}%` } }]
    }
    if (category) {
      whereClause.category = category
    }

    // Handle date filter
    if (date) {
      const now = new Date()
      switch (date) {
        case "upcoming":
          whereClause.eventDate = { [Op.gte]: now }
          break
        case "today":
          const today = new Date(now.setHours(0, 0, 0, 0))
          const tomorrow = new Date(today)
          tomorrow.setDate(tomorrow.getDate() + 1)
          whereClause.eventDate = { [Op.between]: [today, tomorrow] }
          break
        case "tomorrow":
          const tomorrowStart = new Date(now)
          tomorrowStart.setDate(tomorrowStart.getDate() + 1)
          tomorrowStart.setHours(0, 0, 0, 0)
          const dayAfterTomorrow = new Date(tomorrowStart)
          dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)
          whereClause.eventDate = { [Op.between]: [tomorrowStart, dayAfterTomorrow] }
          break
        case "weekend":
          const today2 = new Date(now.setHours(0, 0, 0, 0))
          const daysUntilWeekend = (6 - today2.getDay() + 7) % 7
          const weekend = new Date(today2)
          weekend.setDate(weekend.getDate() + daysUntilWeekend)
          const weekendEnd = new Date(weekend)
          weekendEnd.setDate(weekendEnd.getDate() + 2)
          whereClause.eventDate = { [Op.between]: [weekend, weekendEnd] }
          break
        case "week":
          const startOfWeek = new Date(now)
          startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
          startOfWeek.setHours(0, 0, 0, 0)
          const endOfWeek = new Date(startOfWeek)
          endOfWeek.setDate(endOfWeek.getDate() + 7)
          whereClause.eventDate = { [Op.between]: [startOfWeek, endOfWeek] }
          break
      }
    }

    // Add status filter
    whereClause.status = "published"

    // Get events
    const { count, rows: events } = await Event.findAndCountAll({
      where: whereClause,
      order: [["eventDate", "ASC"]],
      offset,
      limit: limitValue,
    })

    // Check which events are saved by the user
    const savedEvents = await SavedEvent.findAll({
      where: { userId, eventId: { [Op.in]: events.map((event) => event.id) } },
    })
    const savedEventIds = savedEvents.map((savedEvent) => savedEvent.eventId)

    // Format events
    const formattedEvents = events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.eventDate,
      time: event.time,
      location: event.location,
      price: event.price,
      category: event.category,
      attendees: event.attendees,
      image: event.image,
      isSaved: savedEventIds.includes(event.id),
    }))

    const pagination = getPagingData(count, page, limitValue)

    res.status(200).json({
      success: true,
      events: formattedEvents,
      pagination,
    })
  } catch (error) {
    console.error("Get event feed error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get User Recommendations
exports.getUserRecommendations = async (req, res) => {
  try {
    const userId = req.user.id
    const { limit = 6 } = req.query

    // Get user preferences
    const user = await User.findByPk(userId)
    const preferences = user.preferences || {}

    // Get user interactions to determine interests
    const userInteractions = await UserEventInteraction.findAll({
      where: { userId },
      include: [
        {
          model: Event,
          attributes: ["category"],
        },
      ],
    })

    // Count interactions by category
    const categoryInteractions = {}
    userInteractions.forEach((interaction) => {
      const category = interaction.Event.category
      categoryInteractions[category] = (categoryInteractions[category] || 0) + 1
    })

    // Get preferred categories from interactions and preferences
    const preferredCategories = [
      ...Object.keys(categoryInteractions).sort((a, b) => categoryInteractions[b] - categoryInteractions[a]),
      ...(preferences.categories || []),
    ]

    // Get upcoming events in preferred categories
    const events = await Event.findAll({
      where: {
        status: "published",
        eventDate: { [Op.gte]: new Date() },
        category: { [Op.in]: preferredCategories.length > 0 ? preferredCategories : [""] },
      },
      order: [["eventDate", "ASC"]],
      limit: Number.parseInt(limit),
    })

    // Format recommendations
    const recommendations = events.map((event) => {
      const matchReason = preferredCategories.includes(event.category)
        ? `Based on your interest in ${event.category} events`
        : "You might be interested in this event"

      return {
        id: event.id,
        title: event.title,
        date: event.eventDate,
        location: event.location,
        price: event.price,
        category: event.category,
        image: event.image,
        matchScore: preferredCategories.indexOf(event.category) !== -1 ? 0.8 : 0.5,
        matchReason,
      }
    })

    res.status(200).json({
      success: true,
      events: recommendations,
    })
  } catch (error) {
    console.error("Get user recommendations error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Update Notification Settings
exports.updateNotificationSettings = async (req, res) => {
  try {
    const userId = req.user.id
    const { email, push, sms } = req.body

    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Get current preferences or initialize
    const preferences = user.preferences || {}

    // Update notification settings
    preferences.notificationSettings = {
      email: email !== undefined ? email : preferences.notificationSettings?.email || true,
      push: push !== undefined ? push : preferences.notificationSettings?.push || false,
      sms: sms !== undefined ? sms : preferences.notificationSettings?.sms || false,
    }

    // Save preferences
    await user.update({ preferences })

    res.status(200).json({
      success: true,
      message: "Notification settings updated successfully",
      settings: preferences.notificationSettings,
    })
  } catch (error) {
    console.error("Update notification settings error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Update User Preferences
exports.updateUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id
    const { categories, locations, calendarSync } = req.body

    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Get current preferences or initialize
    const preferences = user.preferences || {}

    // Update preferences
    if (categories !== undefined) {
      preferences.categories = categories
    }
    if (locations !== undefined) {
      preferences.locations = locations
    }
    if (calendarSync !== undefined) {
      preferences.calendarSync = calendarSync
    }

    // Save preferences
    await user.update({ preferences })

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      preferences,
    })
  } catch (error) {
    console.error("Update user preferences error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
