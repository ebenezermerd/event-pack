// config/payment.config.js
module.exports = {
  defaultGateway: process.env.DEFAULT_PAYMENT_GATEWAY || "chapa",

  gateways: {
    chapa: {
      secretKey: process.env.CHAPA_SECRET_KEY,
      publicKey: process.env.CHAPA_PUBLIC_KEY,
      baseUrl: process.env.CHAPA_BASE_URL || "https://api.chapa.co",
      webhookSecret: process.env.CHAPA_WEBHOOK_SECRET,
      callbackUrl: process.env.CHAPA_CALLBACK_URL || `${process.env.BASE_URL}/api/payments/chapa/callback`,
      returnUrl: process.env.CHAPA_RETURN_URL || `${process.env.BASE_URL}/payment/success`,
      currency: "ETB",
      active: true,
    },

    manual: {
      active: true,
      paymentInstructions: {
        bankTransfer: {
          bankName: "Commercial Bank of Ethiopia",
          accountName: "EventEase Ltd",
          accountNumber: "1000123456789",
          branchName: "Main Branch",
          instructions: "Please include your Order ID as reference when making the transfer.",
        },
        mobileMoney: {
          provider: "TeleBirr",
          phoneNumber: "+251911234567",
          accountName: "EventEase",
          instructions: "Please include your Order ID as reference when making the payment.",
        },
      },
      verificationRequired: true,
      verificationEmail: "payments@eventease.com",
    },
  },

  // Platform fee configuration
  platformFee: {
    percentage: 5, // 5% platform fee
    fixed: 0, // No fixed fee
    minimum: 10, // Minimum fee of 10 ETB
  },

  // Payment status mapping
  statusMapping: {
    pending: "pending",
    success: "completed",
    failed: "failed",
    cancelled: "cancelled",
    refunded: "refunded",
  },
}
