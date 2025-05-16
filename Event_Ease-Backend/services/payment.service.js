// services/payment.service.js
const axios = require("axios")
const { v4: uuidv4 } = require("uuid")
const paymentConfig = require("../config/payment.config")
const Order = require("../models/order")
const PaymentTransaction = require("../models/paymentTransaction")
const Event = require("../models/event")
const User = require("../models/user")
const Notification = require("../models/notification")
const sendEmail = require("../middleware/sendEmail")

class PaymentService {
  /**
   * Initialize payment with Chapa
   * @param {Object} order - Order object
   * @param {Object} user - User object
   * @returns {Object} - Payment initialization response
   */
  async initializeChapa(order, user) {
    try {
      const chapaConfig = paymentConfig.gateways.chapa

      if (!chapaConfig.active) {
        throw new Error("Chapa payment gateway is not active")
      }

      // Generate a unique transaction reference
      const txRef = `TX-${uuidv4().substring(0, 8).toUpperCase()}`

      // Create payment transaction record
      const transaction = await PaymentTransaction.create({
        id: uuidv4(),
        orderId: order.id,
        transactionId: txRef,
        provider: "chapa",
        amount: order.totalAmount,
        currency: chapaConfig.currency,
        status: "pending",
        metadata: {
          paymentMethod: "chapa",
          txRef,
        },
        transactionDate: new Date(),
      })

      // Get event details for the payment description
      const event = await Event.findByPk(order.eventId)

      // Prepare the payload for Chapa
      const payload = {
        amount: order.totalAmount,
        currency: chapaConfig.currency,
        tx_ref: txRef,
        email: user.email,
        first_name: user.name.split(" ")[0],
        last_name: user.name.split(" ").slice(1).join(" ") || user.name.split(" ")[0],
        title: `Payment for ${event.title}`,
        description: `Ticket purchase for ${event.title}`,
        callback_url: chapaConfig.callbackUrl,
        return_url: `${chapaConfig.returnUrl}?tx_ref=${txRef}`,
        meta: {
          orderId: order.id,
          userId: user.id,
          eventId: event.id,
        },
      }

      // Make API call to Chapa
      const response = await axios.post(`${chapaConfig.baseUrl}/v1/transaction/initialize`, payload, {
        headers: {
          Authorization: `Bearer ${chapaConfig.secretKey}`,
          "Content-Type": "application/json",
        },
      })

      if (response.data && response.data.status === "success") {
        // Update transaction with checkout URL
        await transaction.update({
          metadata: {
            ...transaction.metadata,
            checkoutUrl: response.data.data.checkout_url,
          },
        })

        return {
          success: true,
          checkoutUrl: response.data.data.checkout_url,
          txRef,
          transactionId: transaction.id,
        }
      } else {
        throw new Error(response.data.message || "Failed to initialize payment")
      }
    } catch (error) {
      console.error("Chapa payment initialization error:", error)

      // Create failed transaction record if it doesn't exist yet
      if (!transaction) {
        await PaymentTransaction.create({
          id: uuidv4(),
          orderId: order.id,
          transactionId: `FAILED-${uuidv4().substring(0, 8).toUpperCase()}`,
          provider: "chapa",
          amount: order.totalAmount,
          currency: paymentConfig.gateways.chapa.currency,
          status: "failed",
          metadata: {
            paymentMethod: "chapa",
            error: error.message,
          },
          transactionDate: new Date(),
        })
      } else {
        // Update existing transaction to failed
        await transaction.update({
          status: "failed",
          metadata: {
            ...transaction.metadata,
            error: error.message,
          },
        })
      }

      throw error
    }
  }

  /**
   * Initialize manual payment
   * @param {Object} order - Order object
   * @param {Object} user - User object
   * @param {String} paymentMethod - Payment method (bankTransfer or mobileMoney)
   * @returns {Object} - Payment initialization response
   */
  async initializeManual(order, user, paymentMethod) {
    try {
      const manualConfig = paymentConfig.gateways.manual

      if (!manualConfig.active) {
        throw new Error("Manual payment option is not active")
      }

      if (!["bankTransfer", "mobileMoney"].includes(paymentMethod)) {
        throw new Error("Invalid payment method")
      }

      // Generate a unique transaction reference
      const txRef = `MAN-${uuidv4().substring(0, 8).toUpperCase()}`

      // Create payment transaction record
      const transaction = await PaymentTransaction.create({
        id: uuidv4(),
        orderId: order.id,
        transactionId: txRef,
        provider: "manual",
        amount: order.totalAmount,
        currency: "ETB",
        status: "pending",
        metadata: {
          paymentMethod,
          txRef,
        },
        transactionDate: new Date(),
      })

      // Get event details
      const event = await Event.findByPk(order.eventId)

      // Send payment instructions email
      const paymentInstructions = manualConfig.paymentInstructions[paymentMethod]
      await sendEmail(
        user.email,
        `Payment Instructions for ${event.title}`,
        `
        Dear ${user.name},
        
        Thank you for your order. Please complete your payment using the following instructions:
        
        Order ID: ${order.id}
        Amount: ${order.totalAmount} ETB
        Transaction Reference: ${txRef}
        
        ${
          paymentMethod === "bankTransfer"
            ? `
        Bank Name: ${paymentInstructions.bankName}
        Account Name: ${paymentInstructions.accountName}
        Account Number: ${paymentInstructions.accountNumber}
        Branch: ${paymentInstructions.branchName}
        `
            : `
        Mobile Money Provider: ${paymentInstructions.provider}
        Phone Number: ${paymentInstructions.phoneNumber}
        Account Name: ${paymentInstructions.accountName}
        `
        }
        
        ${paymentInstructions.instructions}
        
        After completing your payment, please reply to this email with your payment receipt or proof of payment.
        
        Your tickets will be issued once your payment is verified.
        
        Thank you,
        EventEase Team
        `,
      )

      // Create notification for the user
      await Notification.create({
        id: uuidv4(),
        userId: user.id,
        title: "Payment Instructions Sent",
        message: `Payment instructions for your order have been sent to your email.`,
        type: "ticket",
        read: false,
        link: `/orders/${order.id}`,
        createdAt: new Date(),
      })

      return {
        success: true,
        message: "Payment instructions have been sent to your email",
        paymentMethod,
        txRef,
        transactionId: transaction.id,
        paymentInstructions: paymentInstructions,
      }
    } catch (error) {
      console.error("Manual payment initialization error:", error)
      throw error
    }
  }

  /**
   * Verify Chapa payment
   * @param {String} txRef - Transaction reference
   * @returns {Object} - Payment verification response
   */
  async verifyChapa(txRef) {
    try {
      const chapaConfig = paymentConfig.gateways.chapa

      // Make API call to Chapa to verify payment
      const response = await axios.get(`${chapaConfig.baseUrl}/v1/transaction/verify/${txRef}`, {
        headers: {
          Authorization: `Bearer ${chapaConfig.secretKey}`,
          "Content-Type": "application/json",
        },
      })

      if (response.data && response.data.status === "success") {
        const verificationData = response.data.data

        // Find the transaction
        const transaction = await PaymentTransaction.findOne({
          where: { transactionId: txRef },
          include: [{ model: Order }],
        })

        if (!transaction) {
          throw new Error("Transaction not found")
        }

        // Update transaction status
        await transaction.update({
          status: "completed",
          metadata: {
            ...transaction.metadata,
            verificationData,
          },
        })

        // Update order status
        await transaction.Order.update({
          status: "completed",
          paymentMethod: "chapa",
        })

        // Update event statistics (attendees, revenue)
        await this.updateEventStatistics(transaction.Order.eventId, transaction.amount)

        // Create notification for the user
        await Notification.create({
          id: uuidv4(),
          userId: transaction.Order.userId,
          title: "Payment Successful",
          message: `Your payment of ${transaction.amount} ETB has been received. Your tickets are now available.`,
          type: "ticket",
          read: false,
          link: `/orders/${transaction.Order.id}`,
          createdAt: new Date(),
        })

        // Send confirmation email
        const user = await User.findByPk(transaction.Order.userId)
        const event = await Event.findByPk(transaction.Order.eventId)

        await sendEmail(
          user.email,
          `Payment Confirmed for ${event.title}`,
          `
          Dear ${user.name},
          
          Your payment of ${transaction.amount} ETB for ${event.title} has been confirmed.
          
          You can view your tickets in your account dashboard.
          
          Thank you for your purchase!
          
          EventEase Team
          `,
        )

        return {
          success: true,
          message: "Payment verified successfully",
          transaction,
          order: transaction.Order,
        }
      } else {
        throw new Error(response.data.message || "Payment verification failed")
      }
    } catch (error) {
      console.error("Chapa payment verification error:", error)
      throw error
    }
  }

  /**
   * Verify manual payment
   * @param {String} txRef - Transaction reference
   * @param {Object} verificationData - Payment verification data
   * @returns {Object} - Payment verification response
   */
  async verifyManual(txRef, verificationData) {
    try {
      // Find the transaction
      const transaction = await PaymentTransaction.findOne({
        where: { transactionId: txRef },
        include: [{ model: Order }],
      })

      if (!transaction) {
        throw new Error("Transaction not found")
      }

      // Update transaction status
      await transaction.update({
        status: "completed",
        metadata: {
          ...transaction.metadata,
          verificationData,
          verifiedBy: verificationData.adminId,
          verificationDate: new Date(),
        },
      })

      // Update order status
      await transaction.Order.update({
        status: "completed",
        paymentMethod: `manual_${transaction.metadata.paymentMethod}`,
      })

      // Update event statistics (attendees, revenue)
      await this.updateEventStatistics(transaction.Order.eventId, transaction.amount)

      // Create notification for the user
      await Notification.create({
        id: uuidv4(),
        userId: transaction.Order.userId,
        title: "Payment Verified",
        message: `Your payment of ${transaction.amount} ETB has been verified. Your tickets are now available.`,
        type: "ticket",
        read: false,
        link: `/orders/${transaction.Order.id}`,
        createdAt: new Date(),
      })

      // Send confirmation email
      const user = await User.findByPk(transaction.Order.userId)
      const event = await Event.findByPk(transaction.Order.eventId)

      await sendEmail(
        user.email,
        `Payment Verified for ${event.title}`,
        `
        Dear ${user.name},
        
        Your payment of ${transaction.amount} ETB for ${event.title} has been verified.
        
        You can view your tickets in your account dashboard.
        
        Thank you for your purchase!
        
        EventEase Team
        `,
      )

      return {
        success: true,
        message: "Payment verified successfully",
        transaction,
        order: transaction.Order,
      }
    } catch (error) {
      console.error("Manual payment verification error:", error)
      throw error
    }
  }

  /**
   * Process refund
   * @param {String} orderId - Order ID
   * @param {Number} amount - Refund amount (optional, defaults to full amount)
   * @param {String} reason - Refund reason
   * @returns {Object} - Refund response
   */
  async processRefund(orderId, amount, reason) {
    try {
      // Find the order
      const order = await Order.findByPk(orderId, {
        include: [{ model: PaymentTransaction }],
      })

      if (!order) {
        throw new Error("Order not found")
      }

      if (order.status === "refunded") {
        throw new Error("Order has already been refunded")
      }

      if (order.status !== "completed") {
        throw new Error("Only completed orders can be refunded")
      }

      // If no amount specified, refund the full amount
      const refundAmount = amount || order.totalAmount

      if (refundAmount > order.totalAmount) {
        throw new Error("Refund amount cannot exceed the order total")
      }

      // Get the original payment transaction
      const originalTransaction = order.PaymentTransactions[0]

      if (!originalTransaction) {
        throw new Error("No payment transaction found for this order")
      }

      // Process refund based on payment method
      let refundResult

      if (originalTransaction.provider === "chapa") {
        refundResult = await this.processChapaRefund(originalTransaction, refundAmount, reason)
      } else {
        // For manual payments, just record the refund
        refundResult = {
          success: true,
          refundId: `REF-${uuidv4().substring(0, 8).toUpperCase()}`,
        }
      }

      // Create refund transaction record
      const refundTransaction = await PaymentTransaction.create({
        id: uuidv4(),
        orderId: order.id,
        transactionId: refundResult.refundId,
        provider: originalTransaction.provider,
        amount: -refundAmount, // Negative amount for refunds
        currency: originalTransaction.currency,
        status: "completed",
        metadata: {
          refundReason: reason,
          originalTransactionId: originalTransaction.id,
          refundData: refundResult,
        },
        transactionDate: new Date(),
      })

      // Update order status
      const newStatus = refundAmount === order.totalAmount ? "refunded" : "partial_refund"
      await order.update({
        status: newStatus,
        refundAmount: (order.refundAmount || 0) + refundAmount,
      })

      // Create notification for the user
      await Notification.create({
        id: uuidv4(),
        userId: order.userId,
        title: "Refund Processed",
        message: `Your refund of ${refundAmount} ETB has been processed.`,
        type: "ticket",
        read: false,
        link: `/orders/${order.id}`,
        createdAt: new Date(),
      })

      // Send refund email
      const user = await User.findByPk(order.userId)
      const event = await Event.findByPk(order.eventId)

      await sendEmail(
        user.email,
        `Refund Processed for ${event.title}`,
        `
        Dear ${user.name},
        
        Your refund of ${refundAmount} ETB for ${event.title} has been processed.
        
        Refund Reason: ${reason}
        
        The refunded amount should appear in your account within 5-7 business days, depending on your payment method and bank.
        
        If you have any questions, please contact our support team.
        
        EventEase Team
        `,
      )

      return {
        success: true,
        message: "Refund processed successfully",
        refundTransaction,
        order,
      }
    } catch (error) {
      console.error("Process refund error:", error)
      throw error
    }
  }

  /**
   * Process Chapa refund
   * @param {Object} transaction - Original transaction
   * @param {Number} amount - Refund amount
   * @param {String} reason - Refund reason
   * @returns {Object} - Refund response
   */
  async processChapaRefund(transaction, amount, reason) {
    try {
      const chapaConfig = paymentConfig.gateways.chapa

      // In a real implementation, you would call Chapa's refund API
      // For now, we'll simulate a successful refund

      // Generate a refund ID
      const refundId = `REF-${uuidv4().substring(0, 8).toUpperCase()}`

      return {
        success: true,
        refundId,
        amount,
        currency: transaction.currency,
        originalTransaction: transaction.transactionId,
      }
    } catch (error) {
      console.error("Chapa refund error:", error)
      throw error
    }
  }

  /**
   * Update event statistics after successful payment
   * @param {String} eventId - Event ID
   * @param {Number} amount - Payment amount
   */
  async updateEventStatistics(eventId, amount) {
    try {
      const event = await Event.findByPk(eventId)

      if (!event) {
        throw new Error("Event not found")
      }

      // Update event statistics
      await event.update({
        attendees: event.attendees + 1,
        revenue: event.revenue + amount,
      })

      // Calculate profit (revenue - expenses)
      await event.update({
        profit: event.revenue - event.expenses,
      })
    } catch (error) {
      console.error("Update event statistics error:", error)
      throw error
    }
  }
}

module.exports = new PaymentService()
