import axios from "axios"
import { v4 as uuidv4 } from "uuid"
import { CHAPA_CONFIG } from "@/lib/env"
import { apiClient } from "@/lib/api-client"

/**
 * Interface for Chapa payment initialization request
 */
export interface ChapaPaymentRequest {
  amount: number
  currency: string
  email: string
  first_name: string
  last_name: string
  phone_number?: string
  tx_ref?: string // If not provided, will be auto-generated
  callback_url?: string
  return_url?: string
  customization?: {
    title?: string
    description?: string
    logo?: string
  }
}

/**
 * Interface for Chapa payment initialization response
 */
export interface ChapaPaymentResponse {
  status: string
  message: string
  data: {
    checkout_url: string
    tx_ref: string
    amount: number
    currency: string
  }
}

/**
 * Interface for Chapa payment verification response
 */
export interface ChapaVerificationResponse {
  status: string
  message: string
  data: {
    tx_ref: string
    flw_ref: string
    amount: number
    currency: string
    charged_amount: number
    app_fee: number
    merchant_fee: number
    status: string
    payment_type: string
    created_at: string
    customer: {
      email: string
      name: string
      phone_number: string
    }
  }
}

/**
 * Service for handling Chapa payment gateway API calls
 * This is used on the client side
 */
export class ChapaPaymentService {
  /**
   * Initialize a payment transaction with Chapa
   */
  static async initializePayment(payment: ChapaPaymentRequest): Promise<ChapaPaymentResponse> {
    // Generate a unique transaction reference if not provided
    const tx_ref = payment.tx_ref || `tx-${uuidv4()}`

    try {
      const response = await apiClient.post<ChapaPaymentResponse>("/api/payments/chapa/initialize", {
        ...payment,
        tx_ref,
      })

      return response
    } catch (error) {
      console.error("Chapa payment initialization failed:", error)
      throw error
    }
  }

  /**
   * Verify a payment transaction with Chapa
   */
  static async verifyPayment(tx_ref: string): Promise<ChapaVerificationResponse> {
    try {
      const response = await apiClient.get<ChapaVerificationResponse>(`/api/payments/chapa/verify/${tx_ref}`)

      return response
    } catch (error) {
      console.error("Chapa payment verification failed:", error)
      throw error
    }
  }
}

/**
 * Server-side Chapa API client for use in API routes
 * This should only be used on the server side (in API routes)
 */
export class ChapaServerClient {
  private static getHeaders() {
    return {
      Authorization: `Bearer ${CHAPA_CONFIG.secretKey}`,
      "Content-Type": "application/json",
    }
  }

  /**
   * Initialize a payment transaction with Chapa (server-side)
   */
  static async initializePayment(payment: ChapaPaymentRequest): Promise<ChapaPaymentResponse> {
    try {
      const response = await axios.post(
        `${CHAPA_CONFIG.baseUrl}/transaction/initialize`,
        {
          ...payment,
          tx_ref: payment.tx_ref || `tx-${uuidv4()}`,
        },
        {
          headers: this.getHeaders(),
        },
      )

      return response.data
    } catch (error) {
      console.error("Chapa payment initialization failed:", error)
      throw error
    }
  }

  /**
   * Verify a payment transaction with Chapa (server-side)
   */
  static async verifyPayment(tx_ref: string): Promise<ChapaVerificationResponse> {
    try {
      const response = await axios.get(`${CHAPA_CONFIG.baseUrl}/transaction/verify/${tx_ref}`, {
        headers: this.getHeaders(),
      })

      return response.data
    } catch (error) {
      console.error("Chapa payment verification failed:", error)
      throw error
    }
  }
}
