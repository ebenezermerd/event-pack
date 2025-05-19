"use client"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useChapa } from "@/hooks/useChapa"
import type { ChapaPaymentResponse } from "@/lib/services/chapa-payment-service"

interface ChapaPaymentButtonProps {
  amount: number
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string
  description?: string
  customTitle?: string
  txRef?: string
  onSuccess?: (data: ChapaPaymentResponse) => void
  onError?: (error: any) => void
  onRedirect?: () => void
  disabled?: boolean
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export function ChapaPaymentButton({
  amount,
  email,
  firstName,
  lastName,
  phoneNumber,
  description,
  customTitle,
  txRef,
  onSuccess,
  onError,
  onRedirect,
  disabled = false,
  className = "",
  variant = "default",
  size = "default",
}: ChapaPaymentButtonProps) {
  const { loading, initiatePayment } = useChapa({
    onSuccess,
    onError,
    onRedirect,
  })

  const handlePayment = async () => {
    try {
      await initiatePayment({
        amount,
        email,
        firstName,
        lastName,
        phoneNumber,
        description,
        customTitle,
        txRef,
      })
    } catch (error) {
      // Error is already handled by the hook
      console.error("Payment button error:", error)
    }
  }

  return (
    <Button onClick={handlePayment} disabled={disabled || loading} className={className} variant={variant} size={size}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        "Pay with Chapa"
      )}
    </Button>
  )
}
