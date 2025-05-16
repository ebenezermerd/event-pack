import type { NextApiRequest, NextApiResponse } from "next"
import { ChapaServerClient } from "@/lib/services/chapa-payment-service"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    // Extract transaction reference from the request body
    const { tx_ref } = req.body

    if (!tx_ref) {
      return res.status(400).json({
        message: "Missing transaction reference",
      })
    }

    // Verify payment with Chapa
    const verificationResponse = await ChapaServerClient.verifyPayment(tx_ref)

    // Check if payment was successful
    if (verificationResponse.status === "success" && verificationResponse.data.status === "success") {
      // Here you would typically:
      // 1. Update your database to mark the order as paid
      // 2. Send confirmation email to the customer
      // 3. Update inventory or seats available for the event
      // 4. Log the successful payment

      // For now, we'll just return a success response
      return res.status(200).json({
        message: "Payment processed successfully",
        tx_ref,
      })
    } else {
      // Payment was not successful
      return res.status(400).json({
        message: "Payment verification failed",
        tx_ref,
      })
    }
  } catch (error: any) {
    console.error("Error processing Chapa callback:", error)
    return res.status(500).json({
      message: "Failed to process payment callback",
      error: error.response?.data?.message || error.message,
    })
  }
}
