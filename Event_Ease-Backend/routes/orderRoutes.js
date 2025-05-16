// routes/orderRoutes.js
const express = require("express")
const router = express.Router()
const orderController = require("../controllers/orderController")
const { userAuth, checkRole } = require("../middleware/authMiddleware")
const validate = require("../middleware/validate")
const Joi = require("joi")

// Validation schemas
const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid("pending", "completed", "cancelled", "refunded").required(),
})

// Order routes
router.get("/organizers/orders", userAuth, checkRole("organizer"), orderController.getOrders)
router.get("/organizers/orders/:id", userAuth, checkRole("organizer"), orderController.getOrderDetails)
router.put(
  "/organizers/orders/:id/status",
  userAuth,
  checkRole("organizer"),
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus,
)
router.get("/organizers/orders/statistics", userAuth, checkRole("organizer"), orderController.getOrderStatistics)
router.get("/organizers/orders/export", userAuth, checkRole("organizer"), orderController.exportOrders)

module.exports = router
