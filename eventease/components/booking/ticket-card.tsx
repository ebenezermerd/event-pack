"use client"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, User, Ticket, QrCode, Download, X } from "lucide-react"
import type { Booking } from "@/lib/services/booking-service"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { useBookings } from "@/contexts/BookingContext"
import { toast } from "@/components/ui/use-toast"

interface TicketCardProps {
  booking: Booking
  showActions?: boolean
  isDetailView?: boolean
}

export function TicketCard({ booking, showActions = true, isDetailView = false }: TicketCardProps) {
  const { cancelBooking, isLoading } = useBookings()

  if (!booking || !booking.event) {
    return null
  }

  const handleCancelBooking = async () => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      await cancelBooking(booking.id)
    }
  }

  const handleDownloadTicket = () => {
    // This would typically generate a PDF ticket
    // For now, just show a toast
    toast({
      title: "Ticket Download",
      description: "Ticket download functionality will be implemented soon.",
    })
  }

  const formattedStartDate = booking.event.startDate
    ? format(new Date(booking.event.startDate), "MMMM d, yyyy")
    : "Date not available"

  const formattedBookingDate = booking.createdAt
    ? format(new Date(booking.createdAt), "MMMM d, yyyy 'at' h:mm a")
    : "Date not available"

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      case "checked-in":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      default:
        return ""
    }
  }

  return (
    <Card className={isDetailView ? "w-full" : "w-full max-w-md"}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{booking.event.title}</CardTitle>
            <div className="flex items-center mt-1">
              <Badge className={getStatusBadgeClass(booking.status)}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Badge>
              {booking.ticketType && (
                <Badge variant="outline" className="ml-2">
                  {booking.ticketType.name}
                </Badge>
              )}
            </div>
          </div>
          {!isDetailView && booking.status === "confirmed" && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <QrCode className="h-4 w-4 mr-2" />
                  View Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <TicketCard booking={booking} isDetailView={true} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{formattedStartDate}</span>
          </div>

          {booking.event.time && (
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{booking.event.time}</span>
            </div>
          )}

          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{booking.event.location}</span>
          </div>

          <div className="flex items-center text-sm">
            <Ticket className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>Quantity: {booking.quantity}</span>
          </div>

          {isDetailView && (
            <>
              <div className="flex items-center text-sm">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  {booking.user?.firstName} {booking.user?.lastName} ({booking.user?.email})
                </span>
              </div>

              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Booked on: {formattedBookingDate}</span>
              </div>

              <div className="mt-4 p-4 border rounded-md flex flex-col items-center justify-center">
                <div className="text-sm mb-2">Booking Reference</div>
                <div className="font-mono text-lg font-bold">{booking.bookingReference}</div>
                {/* This would be a real QR code in production */}
                <div className="w-32 h-32 bg-gray-200 mt-2 flex items-center justify-center">
                  <QrCode className="h-16 w-16 text-gray-400" />
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>

      {showActions && booking.status !== "cancelled" && (
        <CardFooter className="flex justify-between pt-2">
          {booking.status === "confirmed" && (
            <>
              <Button variant="outline" onClick={handleDownloadTicket} disabled={isLoading}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="destructive" onClick={handleCancelBooking} disabled={isLoading}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
