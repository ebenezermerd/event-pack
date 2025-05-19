"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { useChapa } from "@/hooks/useChapa"

export default function VerifyPayment() {
  const router = useRouter()
  const { tx_ref } = router.query

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Verifying your payment...")
  const [paymentData, setPaymentData] = useState<any>(null)

  const { verifyPayment, loading } = useChapa({
    onError: () => {
      setStatus("error")
      setMessage("An error occurred while verifying your payment. Please try again or contact support.")
    },
  })

  useEffect(() => {
    // Only verify when tx_ref is available (after router is ready)
    if (!tx_ref) return

    const checkPayment = async () => {
      try {
        // Verify payment with Chapa
        const response = await verifyPayment(tx_ref as string)

        // Check if payment was successful
        if (response.status === "success" && response.data.status === "success") {
          setStatus("success")
          setMessage("Payment successful! Thank you for your payment.")
          setPaymentData(response.data)
        } else {
          setStatus("error")
          setMessage("Payment verification failed. Please try again or contact support.")
        }
      } catch (error) {
        // Error is already handled by the hook
        console.error("Payment verification page error:", error)
      }
    }

    checkPayment()
  }, [tx_ref, verifyPayment])

  return (
    <div className="container flex items-center justify-center min-h-screen py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Payment Verification</CardTitle>
          <CardDescription className="text-center">Transaction Reference: {tx_ref || "Loading..."}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          {status === "loading" && (
            <>
              <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
              <p className="text-center text-muted-foreground">{message}</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <p className="text-center text-green-500 font-medium mb-4">{message}</p>

              {paymentData && (
                <div className="w-full space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">
                      {paymentData.amount} {paymentData.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span className="font-medium">{paymentData.payment_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{new Date(paymentData.created_at).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-16 w-16 text-red-500 mb-4" />
              <p className="text-center text-red-500 font-medium">{message}</p>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
