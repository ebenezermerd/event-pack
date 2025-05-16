// routes/orderStatisticsRoutes.js
const express = require("express")
const router = express.Router()
const orderStatisticsController = require("../controllers/orderStatisticsController")
const { userAuth, checkRole } = require("../middleware/authMiddleware")

// Order statistics routes
router.get(
  "/orders/statistics",
  userAuth,
  checkRole(["admin", "organizer"]),
  orderStatisticsController.getOrderStatistics,
)
router.get(
  "/events/:eventId/ticket-sales",
  userAuth,
  checkRole(["admin", "organizer"]),
  orderStatisticsController.getTicketSalesStatistics,
)
router.get(
  "/orders/export/excel",
  userAuth,
  checkRole(["admin", "organizer"]),
  orderStatisticsController.exportOrdersToExcel,
)
router.get(
  "/events/:eventId/attendees/pdf",
  userAuth,
  checkRole(["admin", "organizer"]),
  orderStatisticsController.generateAttendeeListPDF,
)
router.get("/revenue/report", userAuth, checkRole(["admin", "organizer"]), orderStatisticsController.getRevenueReport)

module.exports = router
