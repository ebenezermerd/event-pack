// controllers/paymentController.js
const { v4: uuidv4 } = require("uuid")
const paymentService = require("../services/payment.service")
const Order = require("../models/order")
const PaymentTransaction = require("../models/paymentTransaction")
const User = require("../models/user")
const Event = require("../models/event")
const { Op } = require("sequelize")
const crypto = require("crypto")
const paymentConfig = require("../config/payment.config")

// Initialize payment
exports.initializePayment = async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body
    const userId = req.user.id

    // Find the order
    const order = await Order.findOne({
      where: { id: orderId, userId },
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Order is already ${order.status}`,
      })
    }

    // Get user
    const user = await User.findByPk(userId)

    // Process payment based on method
    let paymentResult

    if (paymentMethod === "chapa") {
      paymentResult = await paymentService.initializeChapa(order, user)
    } else if (["bankTransfer", "mobileMoney"].includes(paymentMethod)) {
      paymentResult = await paymentService.initializeManual(order, user, paymentMethod)
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      })
    }

    res.status(200).json({
      success: true,
      ...paymentResult,
    })
  } catch (error) {
    console.error("Initialize payment error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Chapa payment callback
exports.chapaCallback = async (req, res) => {
  try {
    const { tx_ref, status, transaction_id } = req.query

    // Verify the payment
    if (status === "successful") {
      const verificationResult = await paymentService.verifyChapa(tx_ref)

      // Redirect to success page
      return res.redirect(`${process.env.FRONTEND_URL}/payment/success?orderId=${verificationResult.order.id}`)
    } else {
      // Payment failed
      // Find the transaction
      const transaction = await PaymentTransaction.findOne({
        where: { transactionId: tx_ref },
        include: [{ model: Order }],
      })

      if (transaction) {
        // Update transaction status
        await transaction.update({
          status: "failed",
          metadata: {
            ...transaction.metadata,
            chapaStatus: status,
            chapaTransactionId: transaction_id,
          },
        })
      }

      // Redirect to failure page
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?tx_ref=${tx_ref}`)
    }
  } catch (error) {
    console.error("Chapa callback error:", error)
    res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=${encodeURIComponent(error.message)}`)
  }
}

// Chapa webhook
exports.chapaWebhook = async (req, res) => {
  try {
    const signature = req.headers["chapa-signature"]
    const payload = req.body

    // Verify webhook signature
    const isValidSignature = verifyWebhookSignature(
      signature,
      JSON.stringify(payload),
      paymentConfig.gateways.chapa.webhookSecret,
    )

    if (!isValidSignature) {
      return res.status(401).json({
        success: false,
        message: "Invalid signature",
      })
    }

    // Process the webhook
    const { event, data } = payload

    if (event === "charge.completed") {
      // Payment successful
      await paymentService.verifyChapa(data.tx_ref)
    } else if (event === "charge.failed") {
      // Payment failed
      const transaction = await PaymentTransaction.findOne({
        where: { transactionId: data.tx_ref },
        include: [{ model: Order }],
      })

      if (transaction) {
        // Update transaction status
        await transaction.update({
          status: "failed",
          metadata: {
            ...transaction.metadata,
            webhookData: data,
          },
        })

        // Update order status
        await transaction.Order.update({
          status: "failed",
        })
      }
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error("Chapa webhook error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Verify manual payment
exports.verifyManualPayment = async (req, res) => {
  try {
    const { txRef, verificationData } = req.body
    const adminId = req.user.id

    // Only admins and organizers can verify payments
    if (!["admin", "organizer"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      })
    }

    // Add admin ID to verification data
    const verificationInfo = {
      ...verificationData,
      adminId,
      verificationDate: new Date(),
    }

    // Verify the payment
    const verificationResult = await paymentService.verifyManual(txRef, verificationInfo)

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      order: verificationResult.order,
    })
  } catch (error) {
    console.error("Verify manual payment error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Process refund
exports.processRefund = async (req, res) => {
  try {
    const { orderId, amount, reason } = req.body
    const userId = req.user.id

    // Only admins and organizers can process refunds
    if (!["admin", "organizer"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      })
    }

    // If organizer, check if the order belongs to their event
    if (req.user.role === "organizer") {
      const order = await Order.findByPk(orderId, {
        include: [
          {
            model: Event,
            where: { organizerId: userId },
          },
        ],
      })

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found or you do not have permission to refund it",
        })
      }
    }

    // Process the refund
    const refundResult = await paymentService.processRefund(orderId, amount, reason)

    res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      refund: refundResult.refundTransaction,
      order: refundResult.order,
    })
  } catch (error) {
    console.error("Process refund error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get payment methods
exports.getPaymentMethods = async (req, res) => {
  try {
    const activeMethods = []

    // Add Chapa if active
    if (paymentConfig.gateways.chapa.active) {
      activeMethods.push({
        id: "chapa",
        name: "Chapa",
        description: "Pay securely with credit/debit card or mobile money",
        type: "online",
        icon: "credit-card",
      })
    }

    // Add manual payment methods if active
    if (paymentConfig.gateways.manual.active) {
      activeMethods.push({
        id: "bankTransfer",
        name: "Bank Transfer",
        description: "Pay via bank transfer to our account",
        type: "manual",
        icon: "bank",
        instructions: paymentConfig.gateways.manual.paymentInstructions.bankTransfer,
      })

      activeMethods.push({
        id: "mobileMoney",
        name: "Mobile Money",
        description: "Pay using TeleBirr mobile money",
        type: "manual",
        icon: "phone",
        instructions: paymentConfig.gateways.manual.paymentInstructions.mobileMoney,
      })
    }

    res.status(200).json({
      success: true,
      paymentMethods: activeMethods,
    })
  } catch (error) {
    console.error("Get payment methods error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get payment transactions
exports.getPaymentTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate } = req.query
    const userId = req.user.id

    // Only admins and organizers can view all transactions
    if (!["admin", "organizer"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      })
    }

    // Build where clause
    const whereClause = {}

    if (status) {
      whereClause.status = status
    }

    if (startDate && endDate) {
      whereClause.transactionDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      }
    } else if (startDate) {
      whereClause.transactionDate = { [Op.gte]: new Date(startDate) }
    } else if (endDate) {
      whereClause.transactionDate = { [Op.lte]: new Date(endDate) }
    }

    // If organizer, only show transactions for their events
    let orderInclude = { model: Order }

    if (req.user.role === "organizer") {
      orderInclude = {
        model: Order,
        include: [
          {
            model: Event,
            where: { organizerId: userId },
          },
        ],
      }
    }

    // Calculate pagination
    const offset = (page - 1) * limit

    // Get transactions
    const { count, rows: transactions } = await PaymentTransaction.findAndCountAll({
      where: whereClause,
      include: [
        orderInclude,
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["transactionDate", "DESC"]],
      offset,
      limit: Number.parseInt(limit),
    })

    // Format transactions
    const formattedTransactions = transactions.map((transaction) => ({
      id: transaction.id,
      transactionId: transaction.transactionId,
      orderId: transaction.orderId,
      provider: transaction.provider,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      transactionDate: transaction.transactionDate,
      user: transaction.User
        ? {
            id: transaction.User.id,
            name: transaction.User.name,
            email: transaction.User.email,
          }
        : null,
      event: transaction.Order?.Event
        ? {
            id: transaction.Order.Event.id,
            title: transaction.Order.Event.title,
          }
        : null,
    }))

    // Calculate pagination data
    const totalPages = Math.ceil(count / limit)

    res.status(200).json({
      success: true,
      transactions: formattedTransactions,
      pagination: {
        total: count,
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        pages: totalPages,
      },
    })
  } catch (error) {
    console.error("Get payment transactions error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get payment transaction by ID
exports.getPaymentTransaction = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    // Find the transaction
    let transaction

    if (req.user.role === "admin") {
      // Admins can view any transaction
      transaction = await PaymentTransaction.findByPk(id, {
        include: [{ model: Order }, { model: User, attributes: ["id", "name", "email"] }],
      })
    } else if (req.user.role === "organizer") {
      // Organizers can only view transactions for their events
      transaction = await PaymentTransaction.findOne({
        where: { id },
        include: [
          {
            model: Order,
            include: [
              {
                model: Event,
                where: { organizerId: userId },
              },
            ],
          },
          { model: User, attributes: ["id", "name", "email"] },
        ],
      })
    } else {
      // Regular users can only view their own transactions
      transaction = await PaymentTransaction.findOne({
        where: { id },
        include: [
          {
            model: Order,
            where: { userId },
          },
        ],
      })
    }

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found or you do not have permission to view it",
      })
    }

    res.status(200).json({
      success: true,
      transaction: {
        id: transaction.id,
        transactionId: transaction.transactionId,
        orderId: transaction.orderId,
        provider: transaction.provider,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        metadata: transaction.metadata,
        transactionDate: transaction.transactionDate,
        user: transaction.User
          ? {
              id: transaction.User.id,
              name: transaction.User.name,
              email: transaction.User.email,
            }
          : null,
        order: transaction.Order
          ? {
              id: transaction.Order.id,
              status: transaction.Order.status,
              totalAmount: transaction.Order.totalAmount,
              purchaseDate: transaction.Order.purchaseDate,
            }
          : null,
        event: transaction.Order?.Event
          ? {
              id: transaction.Order.Event.id,
              title: transaction.Order.Event.title,
            }
          : null,
      },
    })
  } catch (error) {
    console.error("Get payment transaction error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Helper function to verify webhook signature
function verifyWebhookSignature(signature, payload, secret) {
  const hmac = crypto.createHmac("sha256", secret)
  const calculatedSignature = hmac.update(payload).digest("hex")
  return signature === calculatedSignature
}
