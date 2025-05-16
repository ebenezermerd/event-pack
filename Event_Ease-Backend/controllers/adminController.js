// controllers/adminController.js
const { Op } = require("sequelize")
const sequelize = require("../config/database")
const User = require("../models/user")
const Organizer = require("../models/organizer")
const Event = require("../models/event")
const Order = require("../models/order")
const SystemSetting = require("../models/systemSetting")
const { getPagination, getPagingData } = require("../utils/pagination")

// Get Admin Dashboard Stats
exports.getAdminDashboard = async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.count()

    // Get total organizers
    const totalOrganizers = await Organizer.count()

    // Get total events
    const totalEvents = await Event.count()

    // Get total revenue
    const totalRevenue = (await Order.sum("totalAmount")) || 0

    // Get pending approvals
    const pendingOrganizers = await Organizer.count({
      where: { approvalStatus: "pending" },
    })

    const pendingEvents = await Event.count({
      where: { approvalStatus: "pending" },
    })

    // Get recent users
    const recentUsers = await User.findAll({
      attributes: ["id", "name", "email", "role", "joinDate"],
      order: [["joinDate", "DESC"]],
      limit: 5,
    })

    // Get recent events
    const recentEvents = await Event.findAll({
      include: [
        {
          model: Organizer,
          attributes: ["companyName"],
          include: [
            {
              model: User,
              attributes: ["name"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 5,
    })

    // Format recent events
    const formattedRecentEvents = recentEvents.map((event) => ({
      id: event.id,
      title: event.title,
      organizer: {
        id: event.organizerId,
        name: event.Organizer.User.name,
        companyName: event.Organizer.companyName,
      },
      date: event.eventDate,
      approvalStatus: event.approvalStatus,
    }))

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalOrganizers,
        totalEvents,
        totalRevenue,
        pendingApprovals: {
          organizers: pendingOrganizers,
          events: pendingEvents,
        },
      },
      recentUsers,
      recentEvents: formattedRecentEvents,
    })
  } catch (error) {
    console.error("Get admin dashboard error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query
    const { offset, limit: limitValue } = getPagination(page, limit)

    // Build where clause
    const whereClause = {}
    if (search) {
      whereClause[Op.or] = [{ name: { [Op.like]: `%${search}%` } }, { email: { [Op.like]: `%${search}%` } }]
    }
    if (role) {
      whereClause.role = role
    }
    if (status) {
      whereClause.status = status
    }

    // Get users
    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ["password", "resetPasswordToken", "resetPasswordExpires"] },
      order: [["joinDate", "DESC"]],
      offset,
      limit: limitValue,
    })

    const pagination = getPagingData(count, page, limitValue)

    res.status(200).json({
      success: true,
      users,
      pagination,
    })
  } catch (error) {
    console.error("Get all users error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get All Organizers
exports.getAllOrganizers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query
    const { offset, limit: limitValue } = getPagination(page, limit)

    // Build where clause
    const whereClause = {}
    if (status) {
      whereClause.approvalStatus = status
    }

    // Build user where clause for search
    const userWhereClause = {}
    if (search) {
      userWhereClause[Op.or] = [{ name: { [Op.like]: `%${search}%` } }, { email: { [Op.like]: `%${search}%` } }]
    }

    // Get organizers
    const { count, rows: organizers } = await Organizer.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          where: userWhereClause,
          attributes: ["name", "email", "joinDate"],
        },
      ],
      order: [["createdAt", "DESC"]],
      offset,
      limit: limitValue,
    })

    // Format organizers
    const formattedOrganizers = organizers.map((organizer) => ({
      userId: organizer.userId,
      name: organizer.User.name,
      email: organizer.User.email,
      companyName: organizer.companyName,
      approvalStatus: organizer.approvalStatus,
      joinDate: organizer.User.joinDate,
      verified: organizer.verified,
      totalEvents: organizer.totalEvents,
    }))

    const pagination = getPagingData(count, page, limitValue)

    res.status(200).json({
      success: true,
      organizers: formattedOrganizers,
      pagination,
    })
  } catch (error) {
    console.error("Get all organizers error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Approve/Reject Organizer
exports.updateOrganizerStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, reason } = req.body

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'approved' or 'rejected'",
      })
    }

    if (status === "rejected" && !reason) {
      return res.status(400).json({
        success: false,
        message: "Reason is required when rejecting an organizer",
      })
    }

    const organizer = await Organizer.findOne({
      where: { userId: id },
      include: [
        {
          model: User,
          attributes: ["name", "email"],
        },
      ],
    })

    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: "Organizer not found",
      })
    }

    // Update organizer status
    await organizer.update({
      approvalStatus: status,
      verified: status === "approved",
    })

    // Update user role if approved
    if (status === "approved") {
      await User.update({ role: "organizer" }, { where: { id: organizer.userId } })
    }

    // Send notification email (implementation depends on your email service)
    // ...

    res.status(200).json({
      success: true,
      message: `Organizer ${status === "approved" ? "approved" : "rejected"} successfully`,
      organizer: {
        userId: organizer.userId,
        companyName: organizer.companyName,
        status: organizer.approvalStatus,
        verified: organizer.verified,
      },
    })
  } catch (error) {
    console.error("Update organizer status error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get All Events
exports.getAllEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query
    const { offset, limit: limitValue } = getPagination(page, limit)

    // Build where clause
    const whereClause = {}
    if (search) {
      whereClause[Op.or] = [{ title: { [Op.like]: `%${search}%` } }, { description: { [Op.like]: `%${search}%` } }]
    }
    if (status) {
      whereClause.status = status
    }

    // Get events
    const { count, rows: events } = await Event.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Organizer,
          attributes: ["companyName"],
          include: [
            {
              model: User,
              attributes: ["name"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      offset,
      limit: limitValue,
    })

    // Format events
    const formattedEvents = events.map((event) => ({
      id: event.id,
      title: event.title,
      organizer: {
        id: event.organizerId,
        name: event.Organizer.User.name,
        companyName: event.Organizer.companyName,
      },
      date: event.eventDate,
      location: event.location,
      status: event.approvalStatus,
    }))

    const pagination = getPagingData(count, page, limitValue)

    res.status(200).json({
      success: true,
      events: formattedEvents,
      pagination,
    })
  } catch (error) {
    console.error("Get all events error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Approve/Reject Event
exports.updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, reason } = req.body

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'approved' or 'rejected'",
      })
    }

    if (status === "rejected" && !reason) {
      return res.status(400).json({
        success: false,
        message: "Reason is required when rejecting an event",
      })
    }

    const event = await Event.findOne({
      where: { id },
      include: [
        {
          model: Organizer,
          include: [
            {
              model: User,
              attributes: ["email"],
            },
          ],
        },
      ],
    })

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      })
    }

    // Update event status
    await event.update({ approvalStatus: status })

    // Send notification email (implementation depends on your email service)
    // ...

    res.status(200).json({
      success: true,
      message: `Event ${status === "approved" ? "approved" : "rejected"} successfully`,
      event: {
        id: event.id,
        title: event.title,
        status: event.approvalStatus
      },
    })
  } catch (error) {
    console.error("Update event status error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get Financial Reports
exports.getFinancialReports = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = "month" } = req.query

    // Build where clause for date range
    const whereClause = {}
    if (startDate && endDate) {
      whereClause.purchaseDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      }
    } else if (startDate) {
      whereClause.purchaseDate = { [Op.gte]: new Date(startDate) }
    } else if (endDate) {
      whereClause.purchaseDate = { [Op.lte]: new Date(endDate) }
    }

    // Calculate total revenue
    const totalRevenue =
      (await Order.sum("totalAmount", {
        where: whereClause,
      })) || 0

    // Calculate platform fees (assuming 10% fee)
    const platformFees = totalRevenue * 0.1

    // Calculate payouts
    const payouts = totalRevenue - platformFees

    // Calculate pending payouts (assuming 20% of total payouts)
    const pendingPayouts = payouts * 0.2

    // Get revenue by period
    let dateFormat
    switch (groupBy) {
      case "day":
        dateFormat = "YYYY-MM-DD"
        break
      case "week":
        dateFormat = "YYYY-WW"
        break
      case "month":
      default:
        dateFormat = "YYYY-MM"
        break
    }

    const revenueByPeriod = await Order.findAll({
      attributes: [
        [sequelize.fn("DATE_FORMAT", sequelize.col("purchaseDate"), dateFormat), "period"],
        [sequelize.fn("SUM", sequelize.col("totalAmount")), "revenue"],
      ],
      where: whereClause,
      group: [sequelize.fn("DATE_FORMAT", sequelize.col("purchaseDate"), dateFormat)],
      order: [[sequelize.fn("DATE_FORMAT", sequelize.col("purchaseDate"), dateFormat), "ASC"]],
    })

    // Format revenue by period
    const formattedRevenueByPeriod = revenueByPeriod.map((item) => {
      const revenue = Number.parseFloat(item.getDataValue("revenue"))
      return {
        period: item.getDataValue("period"),
        revenue,
        fees: revenue * 0.1,
        payouts: revenue * 0.9,
      }
    })

    // Get revenue by category
    const revenueByCategory = await Order.findAll({
      attributes: [
        [sequelize.col("Event.category"), "category"],
        [sequelize.fn("SUM", sequelize.col("Order.totalAmount")), "revenue"],
      ],
      include: [
        {
          model: Event,
          attributes: [],
        },
      ],
      where: whereClause,
      group: ["Event.category"],
      order: [[sequelize.fn("SUM", sequelize.col("Order.totalAmount")), "DESC"]],
    })

    // Format revenue by category
    const formattedRevenueByCategory = revenueByCategory.map((item) => {
      const revenue = Number.parseFloat(item.getDataValue("revenue"))
      return {
        category: item.getDataValue("category"),
        revenue,
        percentage: (revenue / totalRevenue) * 100,
      }
    })

    res.status(200).json({
      success: true,
      summary: {
        totalRevenue,
        platformFees,
        payouts,
        pendingPayouts,
      },
      revenueByPeriod: formattedRevenueByPeriod,
      revenueByCategory: formattedRevenueByCategory,
    })
  } catch (error) {
    console.error("Get financial reports error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get System Settings
exports.getSystemSettings = async (req, res) => {
  try {
    // Get all settings from the database
    const settingsRecords = await SystemSetting.findAll();
    
    // Convert to a key-value object
    const settings = {};
    
    // Default settings in case they don't exist in the database yet
    const defaultSettings = {
      platformFeePercentage: 10,
      featuredEventCost: 1000,
      maintenanceMode: false,
      allowRegistrations: true,
      defaultCurrency: "ETB",
      supportedPaymentMethods: ["credit_card", "bank_transfer", "mobile_money"],
      emailNotifications: true,
      autoApproveEvents: false,
      autoApproveOrganizers: false,
    };
    
    // Process settings from database
    for (const record of settingsRecords) {
      let value = record.value;
      
      // Convert to appropriate type
      switch (record.type) {
        case 'number':
          value = Number(value);
          break;
        case 'boolean':
          value = value === 'true';
          break;
        case 'json':
          value = JSON.parse(value);
          break;
      }
      
      settings[record.key] = value;
    }
    
    // Use defaults for any missing settings
    const finalSettings = { ...defaultSettings, ...settings };

    res.status(200).json({
      success: true,
      settings: finalSettings,
    });
  } catch (error) {
    console.error("Get system settings error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update System Settings
exports.updateSystemSettings = async (req, res) => {
  try {
    const updatedSettings = req.body;
    
    // Update each setting in the database
    for (const [key, value] of Object.entries(updatedSettings)) {
      // Determine the type
      let type = 'string';
      if (typeof value === 'number') {
        type = 'number';
      } else if (typeof value === 'boolean') {
        type = 'boolean';
      } else if (typeof value === 'object') {
        type = 'json';
      }
      
      // Convert value to string for storage
      const stringValue = type === 'json' ? JSON.stringify(value) : String(value);
      
      // Upsert the setting (update if exists, create if not)
      await SystemSetting.upsert({
        key,
        value: stringValue,
        type
      });
    }

    res.status(200).json({
      success: true,
      message: "System settings updated successfully",
      settings: updatedSettings,
    });
  } catch (error) {
    console.error("Update system settings error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
