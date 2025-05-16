"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Ticket, AlertCircle, Loader2 } from "lucide-react"
import type { TicketType } from "@/lib/services/booking-service"
import { useBookings } from "@/contexts/BookingContext"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

interface TicketTypeSelectorProps {
  eventId: number
  onBookingComplete?: () => void
}

export function TicketTypeSelector({ eventId, onBookingComplete }: TicketTypeSelectorProps) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { fetchEventTicketTypes, bookEvent, isLoading, error, clearError } = useBookings()

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<number | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [localError, setLocalError] = useState<string | null>(null)
  const [isLoadingTickets, setIsLoadingTickets] = useState(false)

  useEffect(() => {
    const loadTicketTypes = async () => {
      setIsLoadingTickets(true)
      try {
        const types = await fetchEventTicketTypes(eventId)
        setTicketTypes(types)

        // Auto-select the first ticket type if available
        if (types.length > 0) {
          setSelectedTicketTypeId(types[0].id)
        }
      } catch (err) {
        console.error("Error loading ticket types:", err)
      } finally {
        setIsLoadingTickets(false)
      }
    }

    loadTicketTypes()
  }, [eventId, fetchEventTicketTypes])

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)

    if (isNaN(value) || value < 1) {
      setQuantity(1)
    } else {
      const selectedTicket = ticketTypes.find((t) => t.id === selectedTicketTypeId)

      if (selectedTicket && selectedTicket.maxPerUser && value > selectedTicket.maxPerUser) {
        setQuantity(selectedTicket.maxPerUser)
        setLocalError(`Maximum ${selectedTicket.maxPerUser} tickets per user`)
      } else if (selectedTicket && selectedTicket.quantity - selectedTicket.sold < value) {
        setQuantity(selectedTicket.quantity - selectedTicket.sold)
        setLocalError(`Only ${selectedTicket.quantity - selectedTicket.sold} tickets available`)
      } else {
        setQuantity(value)
        setLocalError(null)
      }
    }
  }

  const handleTicketTypeChange = (value: string) => {
    setSelectedTicketTypeId(Number.parseInt(value))
    setLocalError(null)

    // Reset quantity to 1 when changing ticket type
    setQuantity(1)
  }

  const handleBookEvent = async () => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (!selectedTicketTypeId) {
      setLocalError("Please select a ticket type")
      return
    }

    const success = await bookEvent(eventId, selectedTicketTypeId, quantity)

    if (success && onBookingComplete) {
      onBookingComplete()
    }
  }

  const getSelectedTicket = () => {
    return ticketTypes.find((t) => t.id === selectedTicketTypeId)
  }

  const calculateTotal = () => {
    const ticket = getSelectedTicket()
    if (!ticket) return 0

    return ticket.price * quantity
  }

  if (isLoadingTickets) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (ticketTypes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
          <CardDescription>No tickets available for this event</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Tickets</CardTitle>
        <CardDescription>Choose your ticket type and quantity</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {(error || localError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{localError || error}</AlertDescription>
          </Alert>
        )}

        <RadioGroup value={selectedTicketTypeId?.toString()} onValueChange={handleTicketTypeChange}>
          {ticketTypes.map((ticketType) => (
            <div key={ticketType.id} className="flex items-center space-x-2 border p-4 rounded-md">
              <RadioGroupItem value={ticketType.id.toString()} id={`ticket-${ticketType.id}`} />
              <div className="flex-1">
                <Label htmlFor={`ticket-${ticketType.id}`} className="text-base font-medium cursor-pointer">
                  {ticketType.name}
                </Label>
                {ticketType.description && <p className="text-sm text-muted-foreground">{ticketType.description}</p>}
              </div>
              <div className="text-right">
                <div className="font-medium">{ticketType.isFree ? "Free" : `ETB ${ticketType.price.toFixed(2)}`}</div>
                <Badge variant="outline" className="mt-1">
                  {ticketType.quantity - ticketType.sold > 0
                    ? `${ticketType.quantity - ticketType.sold} available`
                    : "Sold out"}
                </Badge>
              </div>
            </div>
          ))}
        </RadioGroup>

        <div className="pt-4">
          <Label htmlFor="quantity">Quantity</Label>
          <div className="flex items-center mt-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => quantity > 1 && setQuantity(quantity - 1)}
              disabled={quantity <= 1}
            >
              -
            </Button>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              className="w-16 mx-2 text-center"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const selectedTicket = getSelectedTicket()
                if (selectedTicket?.maxPerUser && quantity >= selectedTicket.maxPerUser) {
                  setLocalError(`Maximum ${selectedTicket.maxPerUser} tickets per user`)
                  return
                }
                if (selectedTicket && selectedTicket.quantity - selectedTicket.sold <= quantity) {
                  setLocalError(`Only ${selectedTicket.quantity - selectedTicket.sold} tickets available`)
                  return
                }
                setQuantity(quantity + 1)
              }}
              disabled={
                !selectedTicketTypeId ||
                (getSelectedTicket()?.maxPerUser ? quantity >= getSelectedTicket()!.maxPerUser : false) ||
                (getSelectedTicket() ? quantity >= getSelectedTicket()!.quantity - getSelectedTicket()!.sold : false)
              }
            >
              +
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-6">
        <div className="flex items-center">
          <Ticket className="h-4 w-4 mr-2" />
          <span className="font-medium">Total: ETB {calculateTotal().toFixed(2)}</span>
        </div>
        <Button onClick={handleBookEvent} disabled={isLoading || !selectedTicketTypeId}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Book Now"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
