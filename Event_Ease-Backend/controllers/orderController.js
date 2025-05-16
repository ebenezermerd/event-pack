// controllers/orderController.js
const { Op } = require("sequelize")
const { v4: uuidv4 } = require("uuid")
const Order = require("../models/order")
const OrderItem = require("../models/orderItem")
const Event = require("../models/event")
const User = require("../models/user")
const TicketType = require("../models/ticketType")
const PaymentTransaction = require("../models/paymentTransaction")
const { getPagination, getPagingData } = require("../utils/pagination")

// Get Orders
exports.getOrders = async (req, res) => {
  try {
    const userId = req.user.id
    const { page = 1, limit = 10, status, startDate, endDate, search } = req.query
    const { offset, limit: limitValue } = getPagination(page, limit)

    // Get organizer's events
    const events = await Event.findAll({
      where: { organizerId: userId },
      attributes: ["id"],
    })

    const eventIds = events.map((event) => event.id)

    if (eventIds.length === 0) {
      return res.status(200).json({
        success: true,
        orders: [],
        pagination: {
          total: 0,
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          pages: 0,
        },
      })
    }

    // Build where clause
    const whereClause = { eventId: { [Op.in]: eventIds } }
    if (status) {
      whereClause.status = status
    }
    if (startDate && endDate) {
      whereClause.purchaseDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      }
    } else if (startDate) {
      whereClause.purchaseDate = { [Op.gte]: new Date(startDate) }
    } else if (endDate) {
      whereClause.purchaseDate = { [Op.lte]: new Date(endDate) }
    }

    // Add search filter
    if (search) {
      whereClause[Op.or] = [
        { billingName: { [Op.like]: `%${search}%` } },
        { billingEmail: { [Op.like]: `%${search}%` } },
      ]
    }

    // Get orders
    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Event,
          attributes: ["title", "eventDate"],
        },
        {
          model: User,
          attributes: ["name", "email"],
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
      userName: order.User.name,
      userEmail: order.User.email,
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
    console.error("Get orders error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get Order Details
exports.getOrderDetails = async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params

    // Get organizer's events
    const events = await Event.findAll({
      where: { organizerId: userId },
      attributes: ["id"],
    })

    const eventIds = events.map((event) => event.id)

    // Get order
    const order = await Order.findOne({
      where: {
        id,
        eventId: { [Op.in]: eventIds },
      },
      include: [
        {
          model: Event,
          attributes: ["id", "title", "eventDate", "location", "image"],
        },
        {
          model: User,
          attributes: ["id", "name", "email", "phone"],
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
        {
          model: PaymentTransaction,
          attributes: ["id", "amount", "status", "paymentMethod", "transactionDate"],
        },
      ],
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or you don't have permission to view it",
      })
    }

    // Format order
    const formattedOrder = {
      id: order.id,
      event: {
        id: order.Event.id,
        title: order.Event.title,
        date: order.Event.eventDate,
        location: order.Event.location,
        image: order.Event.image,
      },
      user: {
        id: order.User.id,
        name: order.User.name,
        email: order.User.email,
        phone: order.User.phone,
      },
      billing: {
        name: order.billingName,
        email: order.billingEmail,
        address: order.billingAddress,
      },
      totalAmount: order.totalAmount,
      discountAmount: order.discountAmount,
      currency: order.currency,
      status: order.status,
      purchaseDate: order.purchaseDate,
      items: order.OrderItems.map((item) => ({
        id: item.id,
        ticketType: item.TicketType.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        attendeeName: item.attendeeName,
        attendeeEmail: item.attendeeEmail,
        checkInStatus: item.checkInStatus,
        checkInTime: item.checkInTime,
        ticketCode: item.ticketCode,
      })),
      payment: order.PaymentTransactions.map((transaction) => ({
        id: transaction.id,
        amount: transaction.amount,
        status: transaction.status,
        paymentMethod: transaction.paymentMethod,
        transactionDate: transaction.transactionDate,
      })),
    }

    res.status(200).json({
      success: true,
      order: formattedOrder,
    })
  } catch (error) {
    console.error("Get order details error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Update Order Status
exports.updateOrderStatus = async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    const { status } = req.body

    if (!["pending", "completed", "cancelled", "refunded"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'pending', 'completed', 'cancelled', or 'refunded'",
      })
    }

    // Get organizer's events
    const events = await Event.findAll({
      where: { organizerId: userId },
      attributes: ["id"],
    })

    const eventIds = events.map((event) => event.id)

    // Get order
    const order = await Order.findOne({
      where: {
        id,
        eventId: { [Op.in]: eventIds },
      },
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: TicketType,
            },
          ],
        },
      ],
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or you don't have permission to update it",
      })
    }

    // Update order status
    await order.update({ status })

    // If cancelled or refunded, update ticket type sold count
    if (status === "cancelled" || status === "refunded") {
      for (const item of order.OrderItems) {
        await item.TicketType.update({
          sold: item.TicketType.sold - item.quantity,
        })
      }
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: {
        id: order.id,
        status: order.status,
      },
    })
  } catch (error) {
    console.error("Update order status error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get Order Statistics
exports.getOrderStatistics = async (req, res) => {
  try {
    const userId = req.user.id
    const { period = "monthly", eventId } = req.query

    // Get organizer's events
    let eventIds
    if (eventId) {
      // Check if event belongs to organizer
      const event = await Event.findOne({
        where: { id: eventId, organizerId: userId },
      })

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found or you don't have permission to view its statistics",
        })
      }

      eventIds = [eventId]
    } else {
      const events = await Event.findAll({
        where: { organizerId: userId },
        attributes: ["id"],
      })

      eventIds = events.map((event) => event.id)
    }

    if (eventIds.length === 0) {
      return res.status(200).json({
        success: true,
        statistics: {
          totalOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          ordersByStatus: {},
          revenueByPeriod: [],
        },
      })
    }

    // Get total orders
    const totalOrders = await Order.count({
      where: { eventId: { [Op.in]: eventIds } },
    })

    // Get total revenue
    const totalRevenue =
      (await Order.sum("totalAmount", {
        where: { eventId: { [Op.in]: eventIds } },
      })) || 0

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Get orders by status
    const ordersByStatus = await Order.findAll({
      attributes: ["status", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
      where: { eventId: { [Op.in]: eventIds } },
      group: ["status"],
    })

    // Format orders by status
    const formattedOrdersByStatus = {}
    ordersByStatus.forEach((item) => {
      formattedOrdersByStatus[item.status] = Number.parseInt(item.getDataValue("count"))
    })

    // Get revenue by period
    let dateFormat
    switch (period) {
      case "daily":
        dateFormat = "YYYY-MM-DD"
        break
      case "weekly":
        dateFormat = "YYYY-WW"
        break
      case "monthly":
      default:
        dateFormat = "YYYY-MM"
        break
    }

    const revenueByPeriod = await Order.findAll({
      attributes: [
        [sequelize.fn("DATE_FORMAT", sequelize.col("purchaseDate"), dateFormat), "period"],
        [sequelize.fn("COUNT", sequelize.col("id")), "orders"],
        [sequelize.fn("SUM", sequelize.col("totalAmount")), "revenue"],
      ],
      where: { eventId: { [Op.in]: eventIds } },
      group: [sequelize.fn("DATE_FORMAT", sequelize.col("purchaseDate"), dateFormat)],
      order: [[sequelize.fn("DATE_FORMAT", sequelize.col("purchaseDate"), dateFormat), "ASC"]],
    })

    // Format revenue by period
    const formattedRevenueByPeriod = revenueByPeriod.map((item) => ({
      period: item.getDataValue("period"),
      orders: Number.parseInt(item.getDataValue("orders")),
      revenue: Number.parseFloat(item.getDataValue("revenue")),
    }))

    res.status(200).json({
      success: true,
      statistics: {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        ordersByStatus: formattedOrdersByStatus,
        revenueByPeriod: formattedRevenueByPeriod,
      },
    })
  } catch (error) {
    console.error("Get order statistics error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Export Orders
exports.exportOrders = async (req, res) => {
  try {
    const userId = req.user.id
    const { format = "csv", startDate, endDate, status } = req.query

    // Get organizer's events
    const events = await Event.findAll({
      where: { organizerId: userId },
      attributes: ["id"],
    })

    const eventIds = events.map((event) => event.id)

    if (eventIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No events found for this organizer",
      })
    }

    // Build where clause
    const whereClause = { eventId: { [Op.in]: eventIds } }
    if (status) {
      whereClause.status = status
    }
    if (startDate && endDate) {
      whereClause.purchaseDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      }
    } else if (startDate) {
      whereClause.purchaseDate = { [Op.gte]: new Date(startDate) }
    } else if (endDate) {
      whereClause.purchaseDate = { [Op.lte]: new Date(endDate) }
    }

    // Get orders
    const orders = await Order.findAll({
      where: whereClause,
      include: [
        {
          model: Event,
          attributes: ["title", "eventDate"],
        },
        {
          model: User,
          attributes: ["name", "email"],
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
      order: [["purchaseDate", "DESC"]],
    })

    // Format orders for export
    const formattedOrders = orders.map((order) => ({
      orderId: order.id,
      eventTitle: order.Event.title,
      eventDate: order.Event.eventDate,
      userName: order.User.name,
      userEmail: order.User.email,
      totalAmount: order.totalAmount,
      status: order.status,
      purchaseDate: order.purchaseDate,
      tickets: order.OrderItems.reduce((acc, item) => {
        return acc + `${item.quantity} x ${item.TicketType.name}, `
      }, "").slice(0, -2),
    }))

    // For this example, we'll just return the formatted orders
    // In a real application, you would generate a CSV or Excel file
    res.status(200).json({
      success: true,
      message: `Orders exported as ${format}`,
      data: formattedOrders,
    })
  } catch (error) {
    console.error("Export orders error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
