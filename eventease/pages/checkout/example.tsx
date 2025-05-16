"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { ChapaPaymentButton } from "@/components/payment/chapa-payment-button"
import { useChapa } from "@/hooks/useChapa"
import { toast } from "@/components/ui/use-toast"

export default function CheckoutExample() {
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phoneNumber: user?.phone || "",
  })

  // Mock order data
  const orderData = {
    items: [
      { id: 1, name: "VIP Ticket", price: 1500, quantity: 1 },
      { id: 2, name: "Regular Ticket", price: 500, quantity: 2 },
    ],
    subtotal: 2500,
    serviceFee: 100,
    total: 2600,
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Using the useChapa hook directly for custom implementation
  const { loading: directPaymentLoading, initiatePayment } = useChapa({
    onSuccess: (data) => {
      toast({
        title: "Payment Initiated (Direct)",
        description: "You will be redirected to the Chapa payment page.",
      })
    },
    onError: (error) => {
      toast({
        title: "Payment Error (Direct)",
        description: "There was an error initiating your payment. Please try again.",
        variant: "destructive",
      })
    },
  })

  // For the ChapaPaymentButton component
  const handlePaymentSuccess = (data: any) => {
    toast({
      title: "Payment Initiated (Button)",
      description: "You will be redirected to the Chapa payment page.",
    })
  }

  const handlePaymentError = (error: any) => {
    toast({
      title: "Payment Error (Button)",
      description: "There was an error initiating your payment. Please try again.",
      variant: "destructive",
    })
  }

  const handleDirectPayment = async () => {
    try {
      await initiatePayment({
        amount: orderData.total,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        description: "Direct payment for Event Tickets",
      })
    } catch (error) {
      // Error is already handled by the hook
      console.error("Direct payment error:", error)
    }
  }

  const isFormValid = formData.firstName && formData.lastName && formData.email

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Checkout Examples</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>Please provide your contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="e.g., 0911234567"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>Review your order details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Order Items */}
            <div className="space-y-2">
              {orderData.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>ETB {item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <Separator />

            {/* Order Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>ETB {orderData.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Service Fee</span>
                <span>ETB {orderData.serviceFee}</span>
              </div>
              <div className="flex justify-between font-bold mt-2">
                <span>Total</span>
                <span>ETB {orderData.total}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            {/* Example 1: Using the ChapaPaymentButton component */}
            <div className="w-full">
              <h3 className="text-sm font-medium mb-2">Example 1: Using ChapaPaymentButton component</h3>
              <ChapaPaymentButton
                amount={orderData.total}
                email={formData.email}
                firstName={formData.firstName}
                lastName={formData.lastName}
                phoneNumber={formData.phoneNumber}
                description="Payment for Event Tickets (Button)"
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                disabled={!isFormValid}
                className="w-full"
              />
            </div>

            <Separator />

            {/* Example 2: Using the useChapa hook directly */}
            <div className="w-full">
              <h3 className="text-sm font-medium mb-2">Example 2: Using useChapa hook directly</h3>
              <Button onClick={handleDirectPayment} disabled={!isFormValid || directPaymentLoading} className="w-full">
                {directPaymentLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Pay with Chapa (Direct)"
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
