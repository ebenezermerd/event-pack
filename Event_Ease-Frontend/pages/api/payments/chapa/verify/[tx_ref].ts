import type { NextApiRequest, NextApiResponse } from "next"
import { ChapaServerClient } from "@/lib/services/chapa-payment-service"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    // Get transaction reference from URL parameter
    const { tx_ref } = req.query

    if (!tx_ref || Array.isArray(tx_ref)) {
      return res.status(400).json({
        message: "Invalid transaction reference",
      })
    }

    // Verify payment with Chapa
    const verificationResponse = await ChapaServerClient.verifyPayment(tx_ref)

    // Return the verification result
    return res.status(200).json(verificationResponse)
  } catch (error: any) {
    console.error("Error verifying Chapa payment:", error)
    return res.status(500).json({
      message: "Failed to verify payment",
      error: error.response?.data?.message || error.message,
    })
  }
}
