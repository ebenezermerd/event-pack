// controllers/orderStatisticsController.js
const { Op, Sequelize } = require("sequelize")
const Order = require("../models/order")
const Event = require("../models/event")
const PaymentTransaction = require("../models/paymentTransaction")
const TicketType = require("../models/ticketType")
const OrderItem = require("../models/orderItem")
const User = require("../models/user")
const { getPagination, getPagingData } = require("../utils/pagination")
const ExcelJS = require("exceljs")
const PDFDocument = require("pdfkit")
const fs = require("fs")
const path = require("path")

// Get order statistics
exports.getOrderStatistics = async (req, res) => {
  try {
    const { period = "monthly", startDate, endDate, eventId } = req.query
    const userId = req.user.id

    // Build where clause for events
    const eventWhereClause = {}

    if (req.user.role === "organizer") {
      eventWhereClause.organizerId = userId
    }

    if (eventId) {
      eventWhereClause.id = eventId
    }

    // Get events
    const events = await Event.findAll({
      where: eventWhereClause,
      attributes: ["id"],
    })

    const eventIds = events.map((event) => event.id)

    if (eventIds.length === 0) {
      return res.status(200).json({
        success: true,
        statistics: {
          totalOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          ordersByStatus: {},
          revenueByPeriod: [],
          topEvents: [],
          paymentMethods: [],
        },
      })
    }

    // Build where clause for orders
    const orderWhereClause = {
      eventId: { [Op.in]: eventIds },
    }

    if (startDate && endDate) {
      orderWhereClause.purchaseDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      }
    } else if (startDate) {
      orderWhereClause.purchaseDate = { [Op.gte]: new Date(startDate) }
    } else if (endDate) {
      orderWhereClause.purchaseDate = { [Op.lte]: new Date(endDate) }
    }

    // Get total orders
    const totalOrders = await Order.count({
      where: orderWhereClause,
    })

    // Get total revenue
    const totalRevenue =
      (await Order.sum("totalAmount", {
        where: orderWhereClause,
      })) || 0

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Get orders by status
    const ordersByStatus = await Order.findAll({
      attributes: ["status", [Sequelize.fn("COUNT", Sequelize.col("id")), "count"]],
      where: orderWhereClause,
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
      case "yearly":
        dateFormat = "YYYY"
        break
      case "monthly":
      default:
        dateFormat = "YYYY-MM"
        break
    }

    const revenueByPeriod = await Order.findAll({
      attributes: [
        [Sequelize.fn("DATE_FORMAT", Sequelize.col("purchaseDate"), dateFormat), "period"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "orders"],
        [Sequelize.fn("SUM", Sequelize.col("totalAmount")), "revenue"],
      ],
      where: orderWhereClause,
      group: [Sequelize.fn("DATE_FORMAT", Sequelize.col("purchaseDate"), dateFormat)],
      order: [[Sequelize.fn("DATE_FORMAT", Sequelize.col("purchaseDate"), dateFormat), "ASC"]],
    })

    // Format revenue by period
    const formattedRevenueByPeriod = revenueByPeriod.map((item) => ({
      period: item.getDataValue("period"),
      orders: Number.parseInt(item.getDataValue("orders")),
      revenue: Number.parseFloat(item.getDataValue("revenue")),
    }))

    // Get top events by revenue
    const topEvents = await Order.findAll({
      attributes: [
        "eventId",
        [Sequelize.fn("SUM", Sequelize.col("totalAmount")), "revenue"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "orders"],
      ],
      where: orderWhereClause,
      include: [
        {
          model: Event,
          attributes: ["title"],
        },
      ],
      group: ["eventId"],
      order: [[Sequelize.fn("SUM", Sequelize.col("totalAmount")), "DESC"]],
      limit: 5,
    })

    // Format top events
    const formattedTopEvents = topEvents.map((item) => ({
      id: item.eventId,
      title: item.Event.title,
      orders: Number.parseInt(item.getDataValue("orders")),
      revenue: Number.parseFloat(item.getDataValue("revenue")),
    }))

    // Get payment methods
    const paymentMethods = await Order.findAll({
      attributes: ["paymentMethod", [Sequelize.fn("COUNT", Sequelize.col("id")), "count"]],
      where: orderWhereClause,
      group: ["paymentMethod"],
    })

    // Format payment methods
    const formattedPaymentMethods = paymentMethods.map((item) => {
      const count = Number.parseInt(item.getDataValue("count"))
      return {
        method: item.paymentMethod || "unknown",
        count,
        percentage: (count / totalOrders) * 100,
      }
    })

    res.status(200).json({
      success: true,
      statistics: {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        ordersByStatus: formattedOrdersByStatus,
        revenueByPeriod: formattedRevenueByPeriod,
        topEvents: formattedTopEvents,
        paymentMethods: formattedPaymentMethods,
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

// Get ticket sales statistics
exports.getTicketSalesStatistics = async (req, res) => {
  try {
    const { eventId } = req.params
    const userId = req.user.id

    // Check if event exists and user has permission
    let event

    if (req.user.role === "admin") {
      event = await Event.findByPk(eventId)
    } else if (req.user.role === "organizer") {
      event = await Event.findOne({
        where: {
          id: eventId,
          organizerId: userId,
        },
      })
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or you do not have permission to view it",
      })
    }

    // Get ticket types
    const ticketTypes = await TicketType.findAll({
      where: { eventId },
      attributes: ["id", "name", "price", "quantity", "sold", "available"],
    })

    // Get sales by ticket type
    const salesByTicketType = await OrderItem.findAll({
      attributes: [
        "ticketTypeId",
        [Sequelize.fn("SUM", Sequelize.col("quantity")), "sold"],
        [Sequelize.fn("SUM", Sequelize.col("totalPrice")), "revenue"],
      ],
      include: [
        {
          model: Order,
          where: { eventId, status: { [Op.in]: ["completed", "pending"] } },
          attributes: [],
        },
        {
          model: TicketType,
          attributes: ["name", "price"],
        },
      ],
      group: ["ticketTypeId"],
    })

    // Format sales by ticket type
    const formattedSalesByTicketType = salesByTicketType.map((item) => ({
      ticketTypeId: item.ticketTypeId,
      name: item.TicketType.name,
      price: item.TicketType.price,
      sold: Number.parseInt(item.getDataValue("sold")),
      revenue: Number.parseFloat(item.getDataValue("revenue")),
    }))

    // Get sales by date
    const salesByDate = await Order.findAll({
      attributes: [
        [Sequelize.fn("DATE", Sequelize.col("purchaseDate")), "date"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "orders"],
        [Sequelize.fn("SUM", Sequelize.col("totalAmount")), "revenue"],
      ],
      where: {
        eventId,
        status: { [Op.in]: ["completed", "pending"] },
      },
      group: [Sequelize.fn("DATE", Sequelize.col("purchaseDate"))],
      order: [[Sequelize.fn("DATE", Sequelize.col("purchaseDate")), "ASC"]],
    })

    // Format sales by date
    const formattedSalesByDate = salesByDate.map((item) => ({
      date: item.getDataValue("date"),
      orders: Number.parseInt(item.getDataValue("orders")),
      revenue: Number.parseFloat(item.getDataValue("revenue")),
    }))

    // Calculate total sales and revenue
    const totalSold = formattedSalesByTicketType.reduce((sum, item) => sum + item.sold, 0)
    const totalRevenue = formattedSalesByTicketType.reduce((sum, item) => sum + item.revenue, 0)

    // Calculate total capacity and percentage sold
    const totalCapacity = ticketTypes.reduce((sum, ticket) => sum + ticket.quantity, 0)
    const percentageSold = totalCapacity > 0 ? (totalSold / totalCapacity) * 100 : 0

    res.status(200).json({
      success: true,
      statistics: {
        totalSold,
        totalRevenue,
        totalCapacity,
        percentageSold,
        ticketTypes: formattedSalesByTicketType,
        salesByDate: formattedSalesByDate,
      },
    })
  } catch (error) {
    console.error("Get ticket sales statistics error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Export orders to Excel
exports.exportOrdersToExcel = async (req, res) => {
  try {
    const { startDate, endDate, status, eventId } = req.query
    const userId = req.user.id

    // Build where clause for events
    const eventWhereClause = {}

    if (req.user.role === "organizer") {
      eventWhereClause.organizerId = userId
    }

    if (eventId) {
      eventWhereClause.id = eventId
    }

    // Get events
    const events = await Event.findAll({
      where: eventWhereClause,
      attributes: ["id"],
    })

    const eventIds = events.map((event) => event.id)

    if (eventIds.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No events found",
      })
    }

    // Build where clause for orders
    const orderWhereClause = {
      eventId: { [Op.in]: eventIds },
    }

    if (status) {
      orderWhereClause.status = status
    }

    if (startDate && endDate) {
      orderWhereClause.purchaseDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      }
    } else if (startDate) {
      orderWhereClause.purchaseDate = { [Op.gte]: new Date(startDate) }
    } else if (endDate) {
      orderWhereClause.purchaseDate = { [Op.lte]: new Date(endDate) }
    }

    // Get orders
    const orders = await Order.findAll({
      where: orderWhereClause,
      include: [
        {
          model: Event,
          attributes: ["title", "eventDate"],
        },
        {
          model: User,
          attributes: ["name", "email", "phone"],
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
        {
          model: PaymentTransaction,
          attributes: ["transactionId", "provider", "status", "transactionDate"],
        },
      ],
      order: [["purchaseDate", "DESC"]],
    })

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook()
    workbook.creator = "EventEase"
    workbook.created = new Date()

    // Add orders worksheet
    const worksheet = workbook.addWorksheet("Orders")

    // Define columns
    worksheet.columns = [
      { header: "Order ID", key: "id", width: 36 },
      { header: "Event", key: "event", width: 30 },
      { header: "Event Date", key: "eventDate", width: 15 },
      { header: "Customer", key: "customer", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Purchase Date", key: "purchaseDate", width: 20 },
      { header: "Status", key: "status", width: 12 },
      { header: "Payment Method", key: "paymentMethod", width: 15 },
      { header: "Transaction ID", key: "transactionId", width: 36 },
      { header: "Total Amount", key: "totalAmount", width: 15 },
      { header: "Tickets", key: "tickets", width: 40 },
    ]

    // Add rows
    orders.forEach((order) => {
      // Format tickets
      const tickets = order.OrderItems.map((item) => `${item.quantity}x ${item.TicketType.name}`).join(", ")

      // Format transaction ID
      const transactionId = order.PaymentTransactions.length > 0 ? order.PaymentTransactions[0].transactionId : "N/A"

      worksheet.addRow({
        id: order.id,
        event: order.Event.title,
        eventDate: new Date(order.Event.eventDate).toLocaleDateString(),
        customer: order.User.name,
        email: order.User.email,
        phone: order.User.phone || "N/A",
        purchaseDate: new Date(order.purchaseDate).toLocaleString(),
        status: order.status,
        paymentMethod: order.paymentMethod || "N/A",
        transactionId,
        totalAmount: order.totalAmount,
        tickets,
      })
    })

    // Style the header row
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    }

    // Set filename
    const filename = `orders_export_${new Date().toISOString().split("T")[0]}.xlsx`
    const filepath = path.join(__dirname, "..", "temp", filename)

    // Ensure temp directory exists
    if (!fs.existsSync(path.join(__dirname, "..", "temp"))) {
      fs.mkdirSync(path.join(__dirname, "..", "temp"), { recursive: true })
    }

    // Write to file
    await workbook.xlsx.writeFile(filepath)

    // Send file
    res.download(filepath, filename, (err) => {
      if (err) {
        console.error("Download error:", err)
        return res.status(500).json({
          success: false,
          message: "Error downloading file",
        })
      }

      // Delete file after download
      fs.unlinkSync(filepath)
    })
  } catch (error) {
    console.error("Export orders to Excel error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Generate attendee list PDF
exports.generateAttendeeListPDF = async (req, res) => {
  try {
    const { eventId } = req.params
    const userId = req.user.id

    // Check if event exists and user has permission
    let event

    if (req.user.role === "admin") {
      event = await Event.findByPk(eventId, {
        include: [
          {
            model: Organizer,
            attributes: ["companyName"],
          },
        ],
      })
    } else if (req.user.role === "organizer") {
      event = await Event.findOne({
        where: {
          id: eventId,
          organizerId: userId,
        },
        include: [
          {
            model: Organizer,
            attributes: ["companyName"],
          },
        ],
      })
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or you do not have permission to view it",
      })
    }

    // Get attendees
    const attendees = await OrderItem.findAll({
      attributes: ["id", "attendeeName", "attendeeEmail", "checkInStatus", "checkInTime", "ticketCode"],
      include: [
        {
          model: Order,
          where: {
            eventId,
            status: { [Op.in]: ["completed", "pending"] },
          },
          attributes: ["id", "purchaseDate"],
        },
        {
          model: TicketType,
          attributes: ["name"],
        },
      ],
      order: [["attendeeName", "ASC"]],
    })

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 })

    // Set filename
    const filename = `attendees_${event.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${new Date().toISOString().split("T")[0]}.pdf`
    const filepath = path.join(__dirname, "..", "temp", filename)

    // Ensure temp directory exists
    if (!fs.existsSync(path.join(__dirname, "..", "temp"))) {
      fs.mkdirSync(path.join(__dirname, "..", "temp"), { recursive: true })
    }

    // Pipe to file
    const stream = fs.createWriteStream(filepath)
    doc.pipe(stream)

    // Add content
    doc.fontSize(20).text("Attendee List", { align: "center" })
    doc.moveDown()
    doc.fontSize(16).text(event.title, { align: "center" })
    doc.fontSize(12).text(`Date: ${new Date(event.eventDate).toLocaleDateString()}`, { align: "center" })
    doc.fontSize(12).text(`Location: ${event.location}`, { align: "center" })
    doc.fontSize(12).text(`Organizer: ${event.Organizer.companyName}`, { align: "center" })
    doc.moveDown()
    doc.fontSize(12).text(`Total Attendees: ${attendees.length}`, { align: "left" })
    doc.moveDown()

    // Add table headers
    const tableTop = 200
    const colWidths = [40, 150, 150, 100, 100]

    doc.font("Helvetica-Bold")
    doc.text("#", 50, tableTop)
    doc.text("Attendee Name", 90, tableTop)
    doc.text("Email", 240, tableTop)
    doc.text("Ticket Type", 390, tableTop)
    doc.text("Check-In Status", 490, tableTop)

    doc
      .moveTo(50, tableTop - 10)
      .lineTo(550, tableTop - 10)
      .stroke()

    doc
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke()

    // Add table rows
    let y = tableTop + 30
    doc.font("Helvetica")

    attendees.forEach((attendee, index) => {
      // Add new page if needed
      if (y > 700) {
        doc.addPage()
        y = 50

        // Add table headers to new page
        doc.font("Helvetica-Bold")
        doc.text("#", 50, y)
        doc.text("Attendee Name", 90, y)
        doc.text("Email", 240, y)
        doc.text("Ticket Type", 390, y)
        doc.text("Check-In Status", 490, y)

        doc
          .moveTo(50, y - 10)
          .lineTo(550, y - 10)
          .stroke()

        doc
          .moveTo(50, y + 15)
          .lineTo(550, y + 15)
          .stroke()

        y += 30
        doc.font("Helvetica")
      }

      doc.text((index + 1).toString(), 50, y)
      doc.text(attendee.attendeeName || "N/A", 90, y)
      doc.text(attendee.attendeeEmail || "N/A", 240, y)
      doc.text(attendee.TicketType.name, 390, y)
      doc.text(
        attendee.checkInStatus === 'checked_in' 
          ? `Checked In (${new Date(attendee.checkInTime).toLocaleTimeString()})` 
          : 'Not Checked In', 
        490, 
        y
      )

      y += 20
    })

    // Finalize PDF
    doc.end()

    // Wait for the PDF to be written
    stream.on("finish", () => {
      // Send file
      res.download(filepath, filename, (err) => {
        if (err) {
          console.error("Download error:", err)
          return res.status(500).json({
            success: false,
            message: "Error downloading file",
          })
        }

        // Delete file after download
        fs.unlinkSync(filepath)
      })
    })
  } catch (error) {
    console.error("Generate attendee list PDF error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get revenue report
exports.getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = "month" } = req.query
    const userId = req.user.id

    // Only admins and organizers can access revenue reports
    if (!["admin", "organizer"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      })
    }

    // Build where clause for events
    const eventWhereClause = {}

    if (req.user.role === "organizer") {
      eventWhereClause.organizerId = userId
    }

    // Get events
    const events = await Event.findAll({
      where: eventWhereClause,
      attributes: ["id"],
    })

    const eventIds = events.map((event) => event.id)

    if (eventIds.length === 0) {
      return res.status(200).json({
        success: true,
        report: {
          totalRevenue: 0,
          platformFees: 0,
          netRevenue: 0,
          revenueByPeriod: [],
          revenueByEvent: [],
        },
      })
    }

    // Build where clause for orders
    const orderWhereClause = {
      eventId: { [Op.in]: eventIds },
      status: "completed",
    }

    if (startDate && endDate) {
      orderWhereClause.purchaseDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      }
    } else if (startDate) {
      orderWhereClause.purchaseDate = { [Op.gte]: new Date(startDate) }
    } else if (endDate) {
      orderWhereClause.purchaseDate = { [Op.lte]: new Date(endDate) }
    }

    // Get total revenue
    const totalRevenue =
      (await Order.sum("totalAmount", {
        where: orderWhereClause,
      })) || 0

    // Calculate platform fees (5%)
    const platformFees = totalRevenue * 0.05

    // Calculate net revenue
    const netRevenue = totalRevenue - platformFees

    // Get revenue by period
    let dateFormat
    switch (groupBy) {
      case "day":
        dateFormat = "YYYY-MM-DD"
        break
      case "week":
        dateFormat = "YYYY-WW"
        break
      case "year":
        dateFormat = "YYYY"
        break
      case "month":
      default:
        dateFormat = "YYYY-MM"
        break
    }

    const revenueByPeriod = await Order.findAll({
      attributes: [
        [Sequelize.fn("DATE_FORMAT", Sequelize.col("purchaseDate"), dateFormat), "period"],
        [Sequelize.fn("SUM", Sequelize.col("totalAmount")), "revenue"],
      ],
      where: orderWhereClause,
      group: [Sequelize.fn("DATE_FORMAT", Sequelize.col("purchaseDate"), dateFormat)],
      order: [[Sequelize.fn("DATE_FORMAT", Sequelize.col("purchaseDate"), dateFormat), "ASC"]],
    })

    // Format revenue by period
    const formattedRevenueByPeriod = revenueByPeriod.map((item) => {
      const revenue = Number.parseFloat(item.getDataValue("revenue"))
      const platformFee = revenue * 0.05
      const netRevenue = revenue - platformFee

      return {
        period: item.getDataValue("period"),
        revenue,
        platformFee,
        netRevenue,
      }
    })

    // Get revenue by event
    const revenueByEvent = await Order.findAll({
      attributes: ["eventId", [Sequelize.fn("SUM", Sequelize.col("totalAmount")), "revenue"]],
      where: orderWhereClause,
      include: [
        {
          model: Event,
          attributes: ["title"],
        },
      ],
      group: ["eventId"],
      order: [[Sequelize.fn("SUM", Sequelize.col("totalAmount")), "DESC"]],
    })

    // Format revenue by event
    const formattedRevenueByEvent = revenueByEvent.map((item) => {
      const revenue = Number.parseFloat(item.getDataValue("revenue"))
      const platformFee = revenue * 0.05
      const netRevenue = revenue - platformFee

      return {
        eventId: item.eventId,
        eventTitle: item.Event.title,
        revenue,
        platformFee,
        netRevenue,
      }
    })

    res.status(200).json({
      success: true,
      report: {
        totalRevenue,
        platformFees,
        netRevenue,
        revenueByPeriod: formattedRevenueByPeriod,
        revenueByEvent: formattedRevenueByEvent,
      },
    })
  } catch (error) {
    console.error("Get revenue report error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
