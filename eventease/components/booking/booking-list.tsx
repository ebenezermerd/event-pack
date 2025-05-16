"use client"

import { useEffect } from "react"
import { useBookings } from "@/contexts/BookingContext"
import { TicketCard } from "./ticket-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface BookingListProps {
  userId?: number
  showAll?: boolean
}

export function BookingList({ userId, showAll = false }: BookingListProps) {
  const { bookings, fetchUserBookings, isLoading, error } = useBookings()

  useEffect(() => {
    fetchUserBookings()
  }, [fetchUserBookings])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No bookings found</p>
      </div>
    )
  }

  // Filter bookings by status
  const upcomingBookings = bookings.filter((booking) => booking.status === "confirmed" || booking.status === "pending")

  const pastBookings = bookings.filter((booking) => booking.status === "checked-in" || booking.status === "cancelled")

  return (
    <div>
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
          <TabsTrigger value="past">Past & Cancelled ({pastBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          <div className="space-y-4">
            {upcomingBookings.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No upcoming bookings</p>
            ) : (
              upcomingBookings.map((booking) => <TicketCard key={booking.id} booking={booking} />)
            )}
          </div>
        </TabsContent>

        <TabsContent value="past" className="mt-4">
          <div className="space-y-4">
            {pastBookings.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No past bookings</p>
            ) : (
              pastBookings.map((booking) => <TicketCard key={booking.id} booking={booking} showActions={false} />)
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
