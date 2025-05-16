import type { NextApiRequest, NextApiResponse } from "next"
import { ChapaServerClient, type ChapaPaymentRequest } from "@/lib/services/chapa-payment-service"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    // Extract payment details from request body
    const {
      amount,
      currency = "ETB", // Default currency is Ethiopian Birr
      email,
      first_name,
      last_name,
      phone_number,
      tx_ref,
      callback_url,
      return_url,
      customization,
    } = req.body as ChapaPaymentRequest

    // Validate required fields
    if (!amount || !email || !first_name || !last_name) {
      return res.status(400).json({
        message: "Missing required fields: amount, email, first_name, last_name are required",
      })
    }

    // Initialize payment with Chapa
    const paymentResponse = await ChapaServerClient.initializePayment({
      amount,
      currency,
      email,
      first_name,
      last_name,
      phone_number,
      tx_ref,
      callback_url,
      return_url,
      customization,
    })

    // Return the checkout URL and transaction reference
    return res.status(200).json(paymentResponse)
  } catch (error: any) {
    console.error("Error initializing Chapa payment:", error)
    return res.status(500).json({
      message: "Failed to initialize payment",
      error: error.response?.data?.message || error.message,
    })
  }
}
