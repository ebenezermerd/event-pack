// routes/paymentRoutes.js
const express = require("express")
const router = express.Router()
const paymentController = require("../controllers/paymentController")
const { userAuth, checkRole } = require("../middleware/authMiddleware")
const validate = require("../middleware/validate")
const Joi = require("joi")

// Validation schemas
const initializePaymentSchema = Joi.object({
  orderId: Joi.string().required(),
  paymentMethod: Joi.string().valid("chapa", "bankTransfer", "mobileMoney").required(),
})

const verifyManualPaymentSchema = Joi.object({
  txRef: Joi.string().required(),
  verificationData: Joi.object({
    receiptNumber: Joi.string().optional(),
    paymentDate: Joi.date().optional(),
    payerName: Joi.string().optional(),
    payerAccount: Joi.string().optional(),
    notes: Joi.string().optional(),
  }).required(),
})

const processRefundSchema = Joi.object({
  orderId: Joi.string().required(),
  amount: Joi.number().positive().optional(),
  reason: Joi.string().required(),
})

// Payment routes
router.post("/payments/initialize", userAuth, validate(initializePaymentSchema), paymentController.initializePayment)
router.get("/payments/chapa/callback", paymentController.chapaCallback)
router.post("/payments/chapa/webhook", paymentController.chapaWebhook)
router.post(
  "/payments/manual/verify",
  userAuth,
  checkRole(["admin", "organizer"]),
  validate(verifyManualPaymentSchema),
  paymentController.verifyManualPayment,
)
router.post(
  "/payments/refund",
  userAuth,
  checkRole(["admin", "organizer"]),
  validate(processRefundSchema),
  paymentController.processRefund,
)
router.get("/payments/methods", paymentController.getPaymentMethods)
router.get(
  "/payments/transactions",
  userAuth,
  checkRole(["admin", "organizer"]),
  paymentController.getPaymentTransactions,
)
router.get("/payments/transactions/:id", userAuth, paymentController.getPaymentTransaction)

module.exports = router
