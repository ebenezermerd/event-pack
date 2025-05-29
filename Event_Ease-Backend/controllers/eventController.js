// controllers/eventController.js
const { Op } = require("sequelize")
const { v4: uuidv4 } = require("uuid")
const Event = require("../models/event")
const Organizer = require("../models/organizer")
const TicketType = require("../models/ticketType")
const EventSchedule = require("../models/eventSchedule")
const EventFAQ = require("../models/eventFAQ")
const Order = require("../models/order")
const OrderItem = require("../models/orderItem")
const User = require("../models/user")
const Promotion = require("../models/promotion")
const UserEventInteraction = require("../models/userEventInteraction")
const { getPagination, getPagingData } = require("../utils/pagination")
const sequelize = require("../config/database")
const EventRelationship = require("../models/eventRelationship")

// Get Events
exports.getEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, location, date, featured, sort } = req.query
    const { offset, limit: limitValue } = getPagination(page, limit)

    // Build where clause
    const whereClause = { approvalStatus: "approved" }
    if (search) {
      whereClause[Op.or] = [{ title: { [Op.like]: `%${search}%` } }, { description: { [Op.like]: `%${search}%` } }]
    }
    if (category) {
      whereClause.category = category
    }
    if (location) {
      whereClause[Op.or] = [
        { location: { [Op.like]: `%${location}%` } },
        { address: { [Op.like]: `%${location}%` } },
        { region: { [Op.like]: `%${location}%` } },
      ]
    }
    if (featured === "true") {
      whereClause.featured = true
    }

    // Handle date filter
    if (date) {
      const now = new Date()
      if (date === "upcoming") {
        whereClause.eventDate = { [Op.gte]: now }
      } else {
        // Assume date is in YYYY-MM-DD format
        const selectedDate = new Date(date)
        const nextDay = new Date(selectedDate)
        nextDay.setDate(nextDay.getDate() + 1)
        whereClause.eventDate = { [Op.between]: [selectedDate, nextDay] }
      }
    }

    // Determine order
    let order = [["eventDate", "ASC"]]
    if (sort === "popularity") {
      order = [["attendees", "DESC"]]
    } else if (sort === "price") {
      order = [["price", "ASC"]]
    }

    // Get events
    const { count, rows: events } = await Event.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Organizer,
          attributes: ["userId", "companyName", "logo"],
          include: [
            {
              model: User,
              attributes: ["name"],
            },
          ],
        },
      ],
      order,
      offset,
      limit: limitValue,
    })

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
      image: event.image,
      attendees: event.attendees,
      organizer: {
        id: event.Organizer.userId,
        name: event.Organizer.User.name,
        companyName: event.Organizer.companyName,
        logo: event.Organizer.logo,
      },
    }))

    const pagination = getPagingData(count, page, limitValue)

    res.status(200).json({
      success: true,
      events: formattedEvents,
      pagination,
    })
  } catch (error) {
    console.error("Get events error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get Event by ID
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    // Get event
    const event = await Event.findOne({
      where: { id, approvalStatus: "approved" },
      include: [
        {
          model: Organizer,
          attributes: ["userId", "companyName", "logo", "description", "website"],
          include: [
            {
              model: User,
              attributes: ["name", "email", "phone"],
            },
          ],
        },
        {
          model: TicketType,
          attributes: [
            "id",
            "name",
            "description",
            "price",
            "quantity",
            "sold",
            "available",
            "benefits",
            "requirements",
          ],
        },
        {
          model: EventSchedule,
          attributes: ["time", "title", "description", "location", "speaker"],
        },
        {
          model: EventFAQ,
          attributes: ["question", "answer"],
        },
        {
          model: EventRelationship,
          as: 'RelatedEvents',
          include: [{
            model: Event,
            as: 'RelatedEvent',
            where: { approvalStatus: "approved" },
            include: [{
              model: Organizer,
              attributes: ["userId", "companyName", "logo"],
              include: [{
                model: User,
                attributes: ["name"],
              }],
            }],
          }],
        },
      ],
    })

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      })
    }

    // Log interaction if user is logged in
    if (userId) {
      await UserEventInteraction.create({
        id: uuidv4(),
        userId,
        eventId: id,
        interactionType: "view",
        interactionDate: new Date(),
      })
    }

    // Format date and time for better display
    const eventDate = new Date(event.eventDate)
    const formattedDate = eventDate.toISOString().split('T')[0] // YYYY-MM-DD format

    // Format event
    const formattedEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      longDescription: event.longDescription,
      date: formattedDate,
      startDate: formattedDate, // For frontend compatibility
      endDate: formattedDate, // For frontend compatibility
      time: event.time,
      location: event.location,
      address: event.address,
      price: event.price,
      category: event.category,
      image: event.image,
      gallery: event.gallery || [],
      attendees: event.attendees,
      maxAttendees: event.maxAttendees,
      capacity: event.maxAttendees || 0, // For frontend compatibility
      isPublic: true, // Assuming all viewable events are public
      approvalStatus: event.approvalStatus,
      isFree: !event.price || event.price === "0" || event.price === "Free",
      organizer: {
        id: event.Organizer.userId,
        name: event.Organizer.User.name,
        companyName: event.Organizer.companyName,
        logo: event.Organizer.logo,
        description: event.Organizer.description,
        website: event.Organizer.website,
        email: event.Organizer.User.email,
        phone: event.Organizer.User.phone,
      },
      ticketTypes: event.TicketTypes.map((ticketType) => ({
        id: ticketType.id,
        name: ticketType.name,
        description: ticketType.description,
        price: ticketType.price,
        available: ticketType.available,
        benefits: ticketType.benefits || [],
        requirements: ticketType.requirements,
      })),
      schedule: event.EventSchedules.map((schedule) => ({
        time: schedule.time,
        title: schedule.title,
        description: schedule.description,
        location: schedule.location,
        speaker: schedule.speaker,
      })),
      faqs: event.EventFAQs.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
      })),
    }

    // First, check if we have explicit relationships defined
    let explicitRelatedEvents = [];
    
    if (event.RelatedEvents && event.RelatedEvents.length > 0) {
      explicitRelatedEvents = event.RelatedEvents.map(relationship => {
        const relatedEvent = relationship.RelatedEvent;
        const relatedEventDate = new Date(relatedEvent.eventDate);
        const relatedFormattedDate = relatedEventDate.toISOString().split('T')[0];
        
        return {
          id: relatedEvent.id,
          title: relatedEvent.title,
          description: relatedEvent.description,
          date: relatedFormattedDate,
          time: relatedEvent.time,
          location: relatedEvent.location,
          price: relatedEvent.price,
          category: relatedEvent.category,
          image: relatedEvent.image,
          attendees: relatedEvent.attendees,
          relationshipType: relationship.relationshipType,
          strength: relationship.strength,
          organizer: {
            id: relatedEvent.Organizer.userId,
            name: relatedEvent.Organizer.User.name,
            logo: relatedEvent.Organizer.logo,
          },
        };
      });
    }

    // If we don't have enough explicit relationships, find more related events by category
    let categoryRelatedEvents = [];
    if (explicitRelatedEvents.length < 3) {
      const relatedEvents = await Event.findAll({
        where: {
          id: { [Op.ne]: id },
          category: event.category,
          approvalStatus: "approved",
          eventDate: { [Op.gte]: new Date() },
        },
        include: [
          {
            model: Organizer,
            attributes: ["userId", "companyName", "logo"],
            include: [
              {
                model: User,
                attributes: ["name"],
              },
            ],
          },
        ],
        limit: 3,
      });

      // Format related events
      categoryRelatedEvents = relatedEvents.map((relatedEvent) => {
        const relatedEventDate = new Date(relatedEvent.eventDate);
        const relatedFormattedDate = relatedEventDate.toISOString().split('T')[0];
        
        return {
          id: relatedEvent.id,
          title: relatedEvent.title,
          description: relatedEvent.description,
          date: relatedFormattedDate,
          time: relatedEvent.time,
          location: relatedEvent.location,
          price: relatedEvent.price,
          category: relatedEvent.category,
          image: relatedEvent.image,
          attendees: relatedEvent.attendees,
          relationshipType: "category",
          strength: 5,
          organizer: {
            id: relatedEvent.Organizer.userId,
            name: relatedEvent.Organizer.User.name,
            logo: relatedEvent.Organizer.logo,
          },
        };
      });
    }

    // Get organizer's other events
    const organizerOtherEvents = await Event.findAll({
      where: {
        id: { [Op.ne]: id },
        organizerId: event.organizerId,
        approvalStatus: "approved",
        eventDate: { [Op.gte]: new Date() },
      },
      include: [
        {
          model: Organizer,
          attributes: ["userId", "companyName", "logo"],
          include: [
            {
              model: User,
              attributes: ["name"],
            },
          ],
        },
      ],
      limit: 3,
    });

    // Format organizer's other events
    const formattedOrganizerEvents = organizerOtherEvents.map((otherEvent) => {
      const otherEventDate = new Date(otherEvent.eventDate)
      const otherFormattedDate = otherEventDate.toISOString().split('T')[0]
      
      return {
        id: otherEvent.id,
        title: otherEvent.title,
        date: otherFormattedDate,
        time: otherEvent.time,
        location: otherEvent.location,
        price: otherEvent.price,
        category: otherEvent.category,
        image: otherEvent.image,
        relationshipType: "organizer",
        strength: 8,
        organizer: {
          id: otherEvent.Organizer.userId,
          name: otherEvent.Organizer.User.name,
          logo: otherEvent.Organizer.logo,
        },
      }
    });

    // Combine all related events, prioritizing explicit relationships
    const allRelatedEvents = [
      ...explicitRelatedEvents,
      ...categoryRelatedEvents.filter(
        // Filter out duplicates that might already be in explicit relationships
        (catEvent) => !explicitRelatedEvents.some((expEvent) => expEvent.id === catEvent.id)
      ),
      ...formattedOrganizerEvents.filter(
        // Filter out duplicates that might already be in other lists
        (orgEvent) => !explicitRelatedEvents.some((expEvent) => expEvent.id === orgEvent.id) &&
                     !categoryRelatedEvents.some((catEvent) => catEvent.id === orgEvent.id)
      )
    ];

    // Sort related events by strength and limit to a reasonable number
    const sortedRelatedEvents = allRelatedEvents
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 6);

    // If there are any explicit relationships and this is a new event being viewed,
    // create "reverse" relationships for better recommendations
    if (explicitRelatedEvents.length > 0 && userId) {
      // Auto-create relationships for events that don't already have them
      for (const related of sortedRelatedEvents) {
        // Check if a relationship already exists in the opposite direction
        const existingRelationship = await EventRelationship.findOne({
          where: {
            eventId: related.id,
            relatedEventId: id,
          }
        });

        // If no relationship exists, create one
        if (!existingRelationship) {
          await EventRelationship.create({
            id: uuidv4(),
            eventId: related.id,
            relatedEventId: id,
            relationshipType: related.relationshipType,
            strength: related.strength - 1, // Slightly weaker in reverse
            createdBy: userId,
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      event: formattedEvent,
      relatedEvents: sortedRelatedEvents,
    });
  } catch (error) {
    console.error("Get event by ID error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Create Event
exports.createEvent = async (req, res) => {
  try {
    const userId = req.user.id
    const {
      title,
      caption,
      description,
      longDescription,
      date,
      time,
      location,
      address,
      region,
      category,
      image,
      gallery,
      maxAttendees,
      // Additional fields from frontend
      startDate,
      endDate,
      isFree,
      price,
      ticketInfo
    } = req.body

    // Find the organizer profile for this user
    const organizer = await Organizer.findOne({
      where: { userId }
    });

    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: "Organizer profile not found",
      });
    }

    // Create event
    const event = await Event.create({
      id: uuidv4(),
      title,
      caption: caption || null,
      description,
      longDescription: longDescription || description,
      eventDate: date,
      time,
      location,
      address,
      region,
      category,
      image,
      gallery,
      organizerId: organizer.id, // Using organizer.id instead of userId
      maxAttendees,
      price: price || 0,
      approvalStatus: "pending", // Events need admin approval
    })

    // If ticket info is provided and this is a paid event, create a ticket type
    if (!isFree && ticketInfo && ticketInfo.name) {
      await TicketType.create({
        id: uuidv4(),
        eventId: event.id,
        name: ticketInfo.name,
        description: ticketInfo.description || "",
        price: parseFloat(ticketInfo.price) || 0,
        quantity: maxAttendees || 100,
        sold: 0,
        available: maxAttendees || 100,
        currency: "ETB", // Default currency
      });
    }

    res.status(201).json({
      success: true,
      message: "Event created successfully and pending approval",
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.eventDate,
        time: event.time,
        location: event.location,
        category: event.category,
        approvalStatus: event.approvalStatus,
      },
    })
  } catch (error) {
    console.error("Create event error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Update Event
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const userRole = req.user.role

    // Check if event exists and belongs to the organizer or user is admin
    let event
    if (userRole === "admin") {
      event = await Event.findByPk(id)
    } else {
      event = await Event.findOne({
        where: { id },
        include: [
          {
            model: Organizer,
            where: { userId },
          },
        ],
      })
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or you don't have permission to update it",
      })
    }

    // Update event
    await event.update(req.body)

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.eventDate,
        time: event.time,
        location: event.location,
        category: event.category,
        approvalStatus: event.approvalStatus,
      },
    })
  } catch (error) {
    console.error("Update event error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Delete Event
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const userRole = req.user.role

    // Check if event exists and belongs to the organizer or user is admin
    let event
    if (userRole === "admin") {
      event = await Event.findByPk(id)
    } else {
      event = await Event.findOne({
        where: { id },
        include: [
          {
            model: Organizer,
            where: { userId },
          },
        ],
      })
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or you don't have permission to delete it",
      })
    }

    // Check if event has orders
    const ordersCount = await Order.count({
      where: { eventId: id },
    })

    if (ordersCount > 0) {
      // If event has orders, just update status to cancelled
      await event.update({ approvalStatus: "cancelled" })
      return res.status(200).json({
        success: true,
        message: "Event has existing orders and has been cancelled instead of deleted",
      })
    }

    // Delete event
    await event.destroy()

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    })
  } catch (error) {
    console.error("Delete event error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get Event Tickets
exports.getEventTickets = async (req, res) => {
  try {
    const { id } = req.params

    // Check if event exists
    const event = await Event.findOne({
      where: { id, approvalStatus: "approved" },
    })

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      })
    }

    // Get ticket types
    const ticketTypes = await TicketType.findAll({
      where: { eventId: id },
      order: [["price", "ASC"]],
    })

    // Format ticket types
    const formattedTicketTypes = ticketTypes.map((ticketType) => ({
      id: ticketType.id,
      name: ticketType.name,
      description: ticketType.description,
      price: ticketType.price,
      currency: ticketType.currency,
      available: ticketType.available,
      benefits: ticketType.benefits,
      requirements: ticketType.requirements,
    }))

    res.status(200).json({
      success: true,
      tickets: formattedTicketTypes,
    })
  } catch (error) {
    console.error("Get event tickets error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Create Order (Purchase Tickets)
exports.createOrder = async (req, res) => {
  try {
    const { id: eventId } = req.params
    const userId = req.user.id
    const { tickets, promotionCode, billingName, billingEmail, billingAddress } = req.body

    // Check if event exists
    const event = await Event.findOne({
      where: { id: eventId, approvalStatus: "approved" },
    })

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      })
    }

    // Validate tickets
    if (!tickets || !Array.isArray(tickets) || tickets.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid tickets data",
      })
    }

    // Get ticket types
    const ticketTypeIds = tickets.map((ticket) => ticket.ticketTypeId)
    const ticketTypes = await TicketType.findAll({
      where: { id: { [Op.in]: ticketTypeIds }, eventId },
    })

    if (ticketTypes.length !== ticketTypeIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more ticket types are invalid",
      })
    }

    // Check ticket availability
    for (const ticket of tickets) {
      const ticketType = ticketTypes.find((tt) => tt.id === ticket.ticketTypeId)
      if (ticketType.available < ticket.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough tickets available for ${ticketType.name}`,
        })
      }
    }

    // Check promotion code if provided
    let promotion = null
    let discountAmount = 0
    if (promotionCode) {
      promotion = await Promotion.findOne({
        where: {
          eventId,
          code: promotionCode,
          startDate: { [Op.lte]: new Date() },
          endDate: { [Op.gte]: new Date() },
          [Op.or]: [{ maxUses: null }, { available: { [Op.gt]: 0 } }],
        },
      })

      if (!promotion) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired promotion code",
        })
      }
    }

    // Calculate total amount
    let totalAmount = 0
    const orderItems = []

    for (const ticket of tickets) {
      const ticketType = ticketTypes.find((tt) => tt.id === ticket.ticketTypeId)
      const itemTotal = ticketType.price * ticket.quantity
      totalAmount += itemTotal

      orderItems.push({
        ticketTypeId: ticket.ticketTypeId,
        quantity: ticket.quantity,
        unitPrice: ticketType.price,
        totalPrice: itemTotal,
        attendeeName: ticket.attendeeName,
        attendeeEmail: ticket.attendeeEmail,
      })
    }

    // Apply promotion if valid
    if (promotion) {
      if (promotion.discountType === "percentage") {
        discountAmount = (totalAmount * promotion.discountValue) / 100
      } else {
        discountAmount = promotion.discountValue
      }
      totalAmount -= discountAmount
      if (totalAmount < 0) totalAmount = 0

      // Update promotion usage
      if (promotion.maxUses) {
        await promotion.update({
          used: promotion.used + 1,
          available: promotion.available - 1,
        })
      }
    }

    // Create order
    const order = await Order.create({
      id: uuidv4(),
      userId,
      eventId,
      totalAmount,
      currency: "ETB", // Default currency
      approvalStatus: "pending",
      promotionId: promotion?.id,
      discountAmount,
      purchaseDate: new Date(),
      billingName,
      billingEmail,
      billingAddress,
    })

    // Create order items
    for (const item of orderItems) {
      await OrderItem.create({
        id: uuidv4(),
        orderId: order.id,
        ticketTypeId: item.ticketTypeId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        attendeeName: item.attendeeName,
        attendeeEmail: item.attendeeEmail,
        checkInStatus: "not_checked",
        ticketCode: `TKT-${uuidv4().substring(0, 8).toUpperCase()}`,
      })

      // Update ticket type sold count
      const ticketType = ticketTypes.find((tt) => tt.id === item.ticketTypeId)
      await ticketType.update({
        sold: ticketType.sold + item.quantity,
      })
    }

    // Log interaction
    await UserEventInteraction.create({
      id: uuidv4(),
      userId,
      eventId,
      interactionType: "purchase",
      interactionDate: new Date(),
    })

    // Generate payment URL (implementation depends on payment gateway)
    const paymentUrl = `${process.env.BASE_URL}/payment/${order.id}`

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: {
        id: order.id,
        totalAmount: order.totalAmount,
        approvalStatus: order.approvalStatus,
      },
      paymentUrl,
    })
  } catch (error) {
    console.error("Create order error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get Event Categories
exports.getEventCategories = async (req, res) => {
  try {
    // Get all categories with count
    const categories = await Event.findAll({
      attributes: ["category", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
      where: { approvalStatus: "approved" },
      group: ["category"],
      order: [[sequelize.literal("count"), "DESC"]],
    })

    // Format categories
    const formattedCategories = categories.map((category) => ({
      id: category.category,
      name: category.category,
      count: Number.parseInt(category.getDataValue("count")),
    }))

    res.status(200).json({
      success: true,
      categories: formattedCategories,
    })
  } catch (error) {
    console.error("Get event categories error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get Event Filters
exports.getEventFilters = async (req, res) => {
  try {
    // Get all categories
    const categories = await Event.findAll({
      attributes: ["category"],
      where: { approvalStatus: "approved" },
      group: ["category"],
      order: [["category", "ASC"]],
    })

    // Get all locations (regions)
    const locations = await Event.findAll({
      attributes: ["region"],
      where: { approvalStatus: "approved" },
      group: ["region"],
      order: [["region", "ASC"]],
    })

    // Get date filters
    const dates = ["upcoming", "today", "tomorrow", "weekend", "week"]

    res.status(200).json({
      success: true,
      filters: {
        categories: categories.map((category) => category.category),
        locations: locations.map((location) => location.region),
        dates,
      },
    })
  } catch (error) {
    console.error("Get event filters error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
