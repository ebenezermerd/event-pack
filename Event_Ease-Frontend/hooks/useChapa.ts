"use client"

import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import {
  ChapaPaymentService,
  type ChapaPaymentRequest,
  type ChapaPaymentResponse,
} from "@/lib/services/chapa-payment-service"
import { APP_NAME } from "@/lib/env"

interface UseChapaOptions {
  onSuccess?: (response: ChapaPaymentResponse) => void
  onError?: (error: any) => void
  onRedirect?: () => void
}

interface PaymentDetails {
  amount: number
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string
  description?: string
  customTitle?: string
  txRef?: string
}

export function useChapa(options: UseChapaOptions = {}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [paymentResponse, setPaymentResponse] = useState<ChapaPaymentResponse | null>(null)

  const initiatePayment = async ({
    amount,
    email,
    firstName,
    lastName,
    phoneNumber,
    description = "Payment for EventEase",
    customTitle,
    txRef = `tx-${uuidv4()}`,
  }: PaymentDetails) => {
    setLoading(true)
    setError(null)

    try {
      // Prepare payment request
      const paymentRequest: ChapaPaymentRequest = {
        amount,
        currency: "ETB", // Ethiopian Birr
        email,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        tx_ref: txRef,
        return_url: `${window.location.origin}/payment/verify`,
        callback_url: `${window.location.origin}/api/payments/chapa/callback`,
        customization: {
          title: customTitle || APP_NAME,
          description,
        },
      }

      // Initialize payment
      const response = await ChapaPaymentService.initializePayment(paymentRequest)
      setPaymentResponse(response)

      // Call success callback if provided
      if (options.onSuccess) {
        options.onSuccess(response)
      }

      // Call redirect callback if provided
      if (options.onRedirect) {
        options.onRedirect()
      } else {
        // Default behavior: redirect to Chapa checkout page
        window.location.href = response.data.checkout_url
      }

      return response
    } catch (err) {
      const error = err as Error
      console.error("Payment initialization failed:", error)
      setError(error)

      // Call error callback if provided
      if (options.onError) {
        options.onError(error)
      }

      throw error
    } finally {
      setLoading(false)
    }
  }

  const verifyPayment = async (txRef: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await ChapaPaymentService.verifyPayment(txRef)
      return response
    } catch (err) {
      const error = err as Error
      console.error("Payment verification failed:", error)
      setError(error)

      // Call error callback if provided
      if (options.onError) {
        options.onError(error)
      }

      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    paymentResponse,
    initiatePayment,
    verifyPayment,
  }
}
