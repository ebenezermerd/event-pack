"use client"

import type React from "react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { TicketTypeSelector } from "./ticket-type-selector"
import { TicketCard } from "./ticket-card"
import { useBookings } from "@/contexts/BookingContext"
import { Loader2 } from "lucide-react"

interface BookingModalProps {
  eventId: number
  eventTitle: string
  trigger: React.ReactNode
}

export function BookingModal({ eventId, eventTitle, trigger }: BookingModalProps) {
  const { currentBooking, isLoading } = useBookings()
  const [isOpen, setIsOpen] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)

  const handleBookingComplete = () => {
    setBookingComplete(true)
  }

  const handleClose = () => {
    setIsOpen(false)
    // Reset state after modal is closed
    setTimeout(() => {
      setBookingComplete(false)
    }, 300) // Wait for dialog close animation
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{bookingComplete ? "Booking Confirmed" : `Book Tickets for ${eventTitle}`}</DialogTitle>
          <DialogDescription>
            {bookingComplete
              ? "Your booking has been confirmed. You can view your ticket details below."
              : "Select your ticket type and quantity to book this event."}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : bookingComplete && currentBooking ? (
          <div className="py-4">
            <TicketCard booking={currentBooking} isDetailView={true} />
            <div className="mt-6 flex justify-end">
              <Button onClick={handleClose}>Close</Button>
            </div>
          </div>
        ) : (
          <TicketTypeSelector eventId={eventId} onBookingComplete={handleBookingComplete} />
        )}
      </DialogContent>
    </Dialog>
  )
}
