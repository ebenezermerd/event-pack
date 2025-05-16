// routes/adminRoutes.js
const express = require("express")
const router = express.Router()
const adminController = require("../controllers/adminController")
const { userAuth, checkRole } = require("../middleware/authMiddleware")
const validate = require("../middleware/validate")
const Joi = require("joi")

// Validation schemas
const updateOrganizerStatusSchema = Joi.object({
  status: Joi.string().valid("approved", "rejected").required(),
  reason: Joi.when("status", {
    is: "rejected",
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
})

const updateEventStatusSchema = Joi.object({
  status: Joi.string().valid("approved", "rejected").required(),
  reason: Joi.when("status", {
    is: "rejected",
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
})

const systemSettingsSchema = Joi.object({
  platformFeePercentage: Joi.number().min(0).max(100).optional(),
  featuredEventCost: Joi.number().min(0).optional(),
  maintenanceMode: Joi.boolean().optional(),
  allowRegistrations: Joi.boolean().optional(),
  defaultCurrency: Joi.string().optional(),
  supportedPaymentMethods: Joi.array().items(Joi.string()).optional(),
  emailNotifications: Joi.boolean().optional(),
  autoApproveEvents: Joi.boolean().optional(),
  autoApproveOrganizers: Joi.boolean().optional(),
})

// Admin dashboard
router.get("/admin/dashboard", userAuth, checkRole("admin"), adminController.getAdminDashboard)

// User management
router.get("/admin/users", userAuth, checkRole("admin"), adminController.getAllUsers)

// Organizer management
router.get("/admin/organizers", userAuth, checkRole("admin"), adminController.getAllOrganizers)
router.put(
  "/admin/organizers/:id/status",
  userAuth,
  checkRole("admin"),
  validate(updateOrganizerStatusSchema),
  adminController.updateOrganizerStatus,
)

// Event management
router.get("/admin/events", userAuth, checkRole("admin"), adminController.getAllEvents)
router.put(
  "/admin/events/:id/status",
  userAuth,
  checkRole("admin"),
  validate(updateEventStatusSchema),
  adminController.updateEventStatus,
)

// Financial reports
router.get("/admin/reports/financial", userAuth, checkRole("admin"), adminController.getFinancialReports)

// System settings
router.get("/admin/settings", userAuth, checkRole("admin"), adminController.getSystemSettings)
router.put(
  "/admin/settings",
  userAuth,
  checkRole("admin"),
  validate(systemSettingsSchema),
  adminController.updateSystemSettings,
)

module.exports = router
