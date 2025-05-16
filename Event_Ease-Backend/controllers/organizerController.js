// controllers/organizerController.js
const { Op } = require("sequelize")
const { v4: uuidv4 } = require("uuid")
const User = require("../models/user")
const Organizer = require("../models/organizer")
const Event = require("../models/event")
const Order = require("../models/order")
const OrderItem = require("../models/orderItem")
const TicketType = require("../models/ticketType")
const { getPagination, getPagingData } = require("../utils/pagination")

// Apply to become an Organizer
exports.applyToBeOrganizer = async (req, res) => {
  try {
    const userId = req.user.id
    const { companyName, description, logo, website, address, region, tinNumber, verificationDocuments } = req.body

    // Check if user is already an organizer
    const existingOrganizer = await Organizer.findOne({
      where: { userId },
    })

    if (existingOrganizer) {
      return res.status(400).json({
        success: false,
        message: "User is already an organizer",
      })
    }

    // Check if TIN number is already used
    const organizerWithTin = await Organizer.findOne({
      where: { tinNumber },
    })

    if (organizerWithTin) {
      return res.status(400).json({
        success: false,
        message: "TIN number is already registered",
      })
    }

    // Create organizer
    const organizer = await Organizer.create({
      userId,
      companyName,
      description,
      logo,
      website,
      address,
      region,
      tinNumber,
      verificationDocuments,
      approvalStatus: "pending",
    })

    res.status(201).json({
      success: true,
      message: "Organizer application submitted successfully",
      organizer: {
        userId: organizer.userId,
        companyName: organizer.companyName,
        status: organizer.status,
      },
    })
  } catch (error) {
    console.error("Apply to be organizer error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get Organizer Profile
exports.getOrganizerProfile = async (req, res) => {
  try {
    const userId = req.user.id

    const organizer = await Organizer.findOne({
      where: { userId },
      include: [
        {
          model: User,
          attributes: ["name", "email", "phone"],
        },
      ],
    })

    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: "Organizer profile not found",
      })
    }

    res.status(200).json({
      success: true,
      organizer: {
        userId: organizer.userId,
        companyName: organizer.companyName,
        description: organizer.description,
        logo: organizer.logo,
        website: organizer.website,
        socialMedia: organizer.socialMedia,
        address: organizer.address,
        region: organizer.region,
        tinNumber: organizer.tinNumber,
        verified: organizer.verified,
        status: organizer.status,
        followers: organizer.followers,
        totalEvents: organizer.totalEvents,
        user: {
          name: organizer.User.name,
          email: organizer.User.email,
          phone: organizer.User.phone,
        },
      },
    })
  } catch (error) {
    console.error("Get organizer profile error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Update Organizer Profile
exports.updateOrganizerProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const { companyName, description, logo, website, socialMedia, address, region } = req.body

    const organizer = await Organizer.findOne({
      where: { userId },
    })

    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: "Organizer profile not found",
      })
    }

    // Update organizer
    await organizer.update({
      companyName: companyName || organizer.companyName,
      description: description !== undefined ? description : organizer.description,
      logo: logo !== undefined ? logo : organizer.logo,
      website: website !== undefined ? website : organizer.website,
      socialMedia: socialMedia || organizer.socialMedia,
      address: address !== undefined ? address : organizer.address,
      region: region !== undefined ? region : organizer.region,
    })

    res.status(200).json({
      success: true,
      message: "Organizer profile updated successfully",
      organizer: {
        userId: organizer.userId,
        companyName: organizer.companyName,
        description: organizer.description,
        logo: organizer.logo,
        website: organizer.website,
        socialMedia: organizer.socialMedia,
        address: organizer.address,
        region: organizer.region,
      },
    })
  } catch (error) {
    console.error("Update organizer profile error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get Organizer Events
exports.getOrganizerEvents = async (req, res) => {
  try {
    const userId = req.user.id
    const { page = 1, limit = 10, status } = req.query
    const { offset, limit: limitValue } = getPagination(page, limit)

    // Build where clause
    const whereClause = { organizerId: userId }
    if (status) {
      whereClause.status = status
    }

    // Get events
    const { count, rows: events } = await Event.findAndCountAll({
      where: whereClause,
      order: [["eventDate", "ASC"]],
      offset,
      limit: limitValue,
    })

    // Format events
    const formattedEvents = events.map((event) => ({
      id: event.id,
      title: event.title,
      date: event.eventDate,
      location: event.location,
      status: event.status,
      attendees: event.attendees,
      revenue: event.revenue,
      image: event.image,
    }))

    const pagination = getPagingData(count, page, limitValue)

    res.status(200).json({
      success: true,
      events: formattedEvents,
      pagination,
    })
  } catch (error) {
    console.error("Get organizer events error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get Organizer Dashboard Stats
exports.getOrganizerDashboard = async (req, res) => {
  try {
    const userId = req.user.id

    // Get total events
    const totalEvents = await Event.count({
      where: { organizerId: userId },
    })

    // Get total attendees
    const totalAttendees =
      (await Event.sum("attendees", {
        where: { organizerId: userId },
      })) || 0

    // Get total revenue
    const totalRevenue =
      (await Event.sum("revenue", {
        where: { organizerId: userId },
      })) || 0

    // Get upcoming events
    const upcomingEvents = await Event.count({
      where: {
        organizerId: userId,
        eventDate: { [Op.gte]: new Date() },
      },
    })

    // Get pending approvals
    const pendingApprovals = await Event.count({
      where: {
        organizerId: userId,
        approvalStatus: "pending",
      },
    })

    // Get recent events
    const recentEvents = await Event.findAll({
      where: { organizerId: userId },
      order: [["createdAt", "DESC"]],
      limit: 5,
    })

    // Get recent orders
    const eventIds = await Event.findAll({
      attributes: ["id"],
      where: { organizerId: userId },
    }).map((event) => event.id)

    const recentOrders = await Order.findAll({
      where: {
        eventId: { [Op.in]: eventIds },
      },
      include: [
        {
          model: Event,
          attributes: ["title"],
        },
        {
          model: User,
          attributes: ["name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 5,
    })

    // Format recent events
    const formattedRecentEvents = recentEvents.map((event) => ({
      id: event.id,
      title: event.title,
      date: event.eventDate,
      status: event.status,
      attendees: event.attendees,
    }))

    // Format recent orders
    const formattedRecentOrders = recentOrders.map((order) => ({
      id: order.id,
      eventTitle: order.Event.title,
      userName: order.User.name,
      userEmail: order.User.email,
      totalAmount: order.totalAmount,
      status: order.status,
      purchaseDate: order.purchaseDate,
    }))

    res.status(200).json({
      success: true,
      stats: {
        totalEvents,
        totalAttendees,
        totalRevenue,
        upcomingEvents,
        pendingApprovals,
      },
      recentEvents: formattedRecentEvents,
      recentOrders: formattedRecentOrders,
    })
  } catch (error) {
    console.error("Get organizer dashboard error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get Event Attendees
exports.getEventAttendees = async (req, res) => {
  try {
    const userId = req.user.id
    const { eventId } = req.params
    const { page = 1, limit = 10, search } = req.query
    const { offset, limit: limitValue } = getPagination(page, limit)

    // Check if event belongs to organizer
    const event = await Event.findOne({
      where: { id: eventId, organizerId: userId },
    })

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or you don't have permission to view its attendees",
      })
    }

    // Build where clause for order items
    const orderItemWhereClause = {}
    if (search) {
      orderItemWhereClause[Op.or] = [
        { attendeeName: { [Op.like]: `%${search}%` } },
        { attendeeEmail: { [Op.like]: `%${search}%` } },
      ]
    }

    // Get attendees
    const { count, rows: orderItems } = await OrderItem.findAndCountAll({
      where: orderItemWhereClause,
      include: [
        {
          model: Order,
          where: { eventId },
          attributes: ["id", "purchaseDate"],
        },
        {
          model: TicketType,
          attributes: ["name"],
        },
      ],
      order: [["createdAt", "DESC"]],
      offset,
      limit: limitValue,
    })

    // Format attendees
    const attendees = orderItems.map((item) => ({
      id: item.id,
      name: item.attendeeName,
      email: item.attendeeEmail,
      ticketType: item.TicketType.name,
      orderId: item.Order.id,
      orderDate: item.Order.purchaseDate,
      checkInStatus: item.checkInStatus,
      checkInTime: item.checkInTime,
    }))

    const pagination = getPagingData(count, page, limitValue)

    res.status(200).json({
      success: true,
      attendees,
      pagination,
    })
  } catch (error) {
    console.error("Get event attendees error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Check In Attendee
exports.checkInAttendee = async (req, res) => {
  try {
    const userId = req.user.id
    const { eventId, attendeeId } = req.params

    // Check if event belongs to organizer
    const event = await Event.findOne({
      where: { id: eventId, organizerId: userId },
    })

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or you don't have permission to check in attendees",
      })
    }

    // Find order item
    const orderItem = await OrderItem.findOne({
      where: { id: attendeeId },
      include: [
        {
          model: Order,
          where: { eventId },
        },
      ],
    })

    if (!orderItem) {
      return res.status(404).json({
        success: false,
        message: "Attendee not found",
      })
    }

    // Check if already checked in
    if (orderItem.checkInStatus === "checked_in") {
      return res.status(400).json({
        success: false,
        message: "Attendee already checked in",
      })
    }

    // Check if cancelled
    if (orderItem.checkInStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot check in a cancelled ticket",
      })
    }

    // Update check-in status
    await orderItem.update({
      checkInStatus: "checked_in",
      checkInTime: new Date(),
    })

    res.status(200).json({
      success: true,
      message: "Attendee checked in successfully",
      attendee: {
        id: orderItem.id,
        checkInStatus: orderItem.checkInStatus,
        checkInTime: orderItem.checkInTime,
      },
    })
  } catch (error) {
    console.error("Check in attendee error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get Event Analytics
exports.getEventAnalytics = async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params

    // Check if event belongs to organizer
    const event = await Event.findOne({
      where: { id, organizerId: userId },
    })

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or you don't have permission to view its analytics",
      })
    }

    // Get attendee stats
    const totalAttendees = event.attendees
    const checkedInCount = await OrderItem.count({
      include: [
        {
          model: Order,
          where: { eventId: id },
        },
      ],
      where: { checkInStatus: "checked_in" },
    })
    const percentCheckedIn = totalAttendees > 0 ? (checkedInCount / totalAttendees) * 100 : 0

    // Get ticket stats
    const ticketTypes = await TicketType.findAll({
      where: { eventId: id },
    })

    const ticketStats = {
      totalSold: ticketTypes.reduce((sum, tt) => sum + tt.sold, 0),
      totalAvailable: ticketTypes.reduce((sum, tt) => sum + tt.quantity, 0),
      percentSold: 0,
      byType: ticketTypes.map((tt) => ({
        name: tt.name,
        sold: tt.sold,
        available: tt.quantity,
        revenue: tt.revenue,
      })),
    }

    ticketStats.percentSold =
      ticketStats.totalAvailable > 0 ? (ticketStats.totalSold / ticketStats.totalAvailable) * 100 : 0

    // Get financial stats
    const financialStats = {
      totalRevenue: event.revenue,
      totalExpenses: event.expenses,
      profit: event.profit,
      averageTicketPrice: ticketStats.totalSold > 0 ? event.revenue / ticketStats.totalSold : 0,
    }

    // Get time stats (sales by day)
    const orders = await Order.findAll({
      where: { eventId: id },
      attributes: [
        [sequelize.fn("DATE", sequelize.col("purchaseDate")), "date"],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [sequelize.fn("SUM", sequelize.col("totalAmount")), "revenue"],
      ],
      group: [sequelize.fn("DATE", sequelize.col("purchaseDate"))],
      order: [[sequelize.fn("DATE", sequelize.col("purchaseDate")), "ASC"]],
    })

    const salesByDay = orders.map((order) => ({
      date: order.getDataValue("date"),
      count: Number.parseInt(order.getDataValue("count")),
      revenue: Number.parseFloat(order.getDataValue("revenue")),
    }))

    res.status(200).json({
      success: true,
      analytics: {
        attendeeStats: {
          total: totalAttendees,
          checkedIn: checkedInCount,
          percentCheckedIn,
        },
        ticketStats,
        financialStats,
        timeStats: {
          salesByDay,
        },
      },
    })
  } catch (error) {
    console.error("Get event analytics error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
