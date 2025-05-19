import { apiClient } from "@/lib/api-client"

/**
 * Interface for payment intent response
 */
export interface PaymentIntentResponse {
  clientSecret: string
  paymentIntentId: string
}

/**
 * Interface for payment method
 */
export interface PaymentMethod {
  id: string
  type: string
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
}

/**
 * Interface for payment request
 */
export interface PaymentRequest {
  orderId: string
  amount: number
  currency: string
  description: string
  metadata?: Record<string, string>
}

/**
 * Service for handling payment-related API calls
 */
export class PaymentService {
  /**
   * Create a payment intent for an order
   */
  static async createPaymentIntent(paymentRequest: PaymentRequest): Promise<PaymentIntentResponse> {
    return await apiClient.post<PaymentIntentResponse>("/api/payments/create-intent", paymentRequest)
  }

  /**
   * Confirm a payment
   */
  static async confirmPayment(paymentIntentId: string): Promise<{ success: boolean; message: string }> {
    return await apiClient.post<{ success: boolean; message: string }>("/api/payments/confirm", { paymentIntentId })
  }

  /**
   * Get saved payment methods for the current user
   */
  static async getPaymentMethods(): Promise<{ paymentMethods: PaymentMethod[] }> {
    return await apiClient.get<{ paymentMethods: PaymentMethod[] }>("/api/payments/methods")
  }

  /**
   * Add a new payment method
   */
  static async addPaymentMethod(paymentMethodId: string): Promise<{ success: boolean; message: string }> {
    return await apiClient.post<{ success: boolean; message: string }>("/api/payments/methods", { paymentMethodId })
  }

  /**
   * Delete a payment method
   */
  static async deletePaymentMethod(paymentMethodId: string): Promise<{ success: boolean; message: string }> {
    return await apiClient.delete<{ success: boolean; message: string }>(`/api/payments/methods/${paymentMethodId}`)
  }

  /**
   * Set a payment method as default
   */
  static async setDefaultPaymentMethod(paymentMethodId: string): Promise<{ success: boolean; message: string }> {
    return await apiClient.post<{ success: boolean; message: string }>(
      `/api/payments/methods/${paymentMethodId}/default`,
    )
  }
}
