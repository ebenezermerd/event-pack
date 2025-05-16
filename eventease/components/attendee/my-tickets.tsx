"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { QrCode, Download, Ticket, Calendar, MapPin, User, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { format, isPast, isFuture, isToday } from "date-fns"
import { cn } from "@/lib/utils"

// Mock data - would be replaced with real API calls
const mockTickets = [
  {
    id: 1,
    eventId: 1,
    eventTitle: "Addis Tech Summit 2024",
    eventDate: "2024-05-15T09:00:00Z",
    eventLocation: "Millennium Hall, Addis Ababa",
    ticketType: "Standard",
    price: "ETB 500",
    quantity: 1,
    status: "confirmed",
    bookingReference: "TECH-1234-ABCD",
    purchaseDate: "2024-04-10T14:30:00Z",
  },
  {
    id: 2,
    eventId: 2,
    eventTitle: "Ethiopian Coffee Festival",
    eventDate: "2024-05-22T10:00:00Z",
    eventLocation: "Friendship Park, Addis Ababa",
    ticketType: "VIP",
    price: "ETB 500",
    quantity: 2,
    status: "confirmed",
    bookingReference: "COFFEE-5678-EFGH",
    purchaseDate: "2024-04-12T09:15:00Z",
  },
  {
    id: 3,
    eventId: 3,
    eventTitle: "Cultural Heritage Exhibition",
    eventDate: "2024-04-01T14:00:00Z", // Past event
    eventLocation: "National Museum, Addis Ababa",
    ticketType: "Standard",
    price: "ETB 100",
    quantity: 1,
    status: "checked-in",
    bookingReference: "CULTURE-9012-IJKL",
    purchaseDate: "2024-03-25T11:45:00Z",
  },
  {
    id: 4,
    eventId: 4,
    eventTitle: "Business Innovation Summit",
    eventDate: "2024-03-15T09:00:00Z", // Past event
    eventLocation: "Hyatt Regency, Addis Ababa",
    ticketType: "Premium",
    price: "ETB 1,500",
    quantity: 1,
    status: "cancelled",
    bookingReference: "BIZ-3456-MNOP",
    purchaseDate: "2024-03-01T10:30:00Z",
  },
]

export function MyTickets() {
  const [tickets, setTickets] = useState(mockTickets)
  const [loading, setLoading] = useState(false)

  // Simulate loading state
  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Filter tickets by status
  const upcomingTickets = tickets.filter(
    (ticket) =>
      (ticket.status === "confirmed" || ticket.status === "pending") &&
      (isToday(new Date(ticket.eventDate)) || isFuture(new Date(ticket.eventDate))),
  )

  const pastTickets = tickets.filter(
    (ticket) => ticket.status === "checked-in" || (ticket.status !== "cancelled" && isPast(new Date(ticket.eventDate))),
  )

  const cancelledTickets = tickets.filter((ticket) => ticket.status === "cancelled")

  const handleDownloadTicket = (id: number) => {
    // This would typically generate a PDF ticket
    toast({
      title: "Ticket Download",
      description: "Your ticket has been downloaded successfully.",
    })
  }

  const handleCancelTicket = (id: number) => {
    // This would call an API to cancel the ticket
    setTickets(tickets.map((ticket) => (ticket.id === id ? { ...ticket, status: "cancelled" } : ticket)))

    toast({
      title: "Ticket Cancelled",
      description: "Your ticket has been cancelled successfully.",
      variant: "destructive",
    })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming ({upcomingTickets.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastTickets.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledTickets.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <TicketCardSkeleton key={i} />
              ))}
            </div>
          ) : upcomingTickets.length > 0 ? (
            <div className="space-y-4">
              {upcomingTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onDownload={() => handleDownloadTicket(ticket.id)}
                  onCancel={() => handleCancelTicket(ticket.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">You don't have any upcoming tickets</p>
              <Button asChild>
                <a href="/events">Browse Events</a>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {loading ? (
            <div className="space-y-4">
              <TicketCardSkeleton />
            </div>
          ) : pastTickets.length > 0 ? (
            <div className="space-y-4">
              {pastTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onDownload={() => handleDownloadTicket(ticket.id)}
                  showActions={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">You haven't attended any events yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          {loading ? (
            <div className="space-y-4">
              <TicketCardSkeleton />
            </div>
          ) : cancelledTickets.length > 0 ? (
            <div className="space-y-4">
              {cancelledTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} showActions={false} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">You don't have any cancelled tickets</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface TicketCardProps {
  ticket: (typeof mockTickets)[0]
  onDownload?: () => void
  onCancel?: () => void
  showActions?: boolean
}

function TicketCard({ ticket, onDownload, onCancel, showActions = true }: TicketCardProps) {
  const eventDate = new Date(ticket.eventDate)
  const isPastEvent = isPast(eventDate) && !isToday(eventDate)
  const isUpcomingSoon =
    isToday(eventDate) || (isFuture(eventDate) && eventDate.getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000) // Within a week

  const formattedEventDate = format(eventDate, "MMMM d, yyyy 'at' h:mm a")
  const formattedPurchaseDate = format(new Date(ticket.purchaseDate), "MMMM d, yyyy")

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
    <Card className={cn("overflow-hidden", isPastEvent && "opacity-80")}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold">{ticket.eventTitle}</h3>
            <div className="flex items-center mt-1">
              <Badge className={getStatusBadgeClass(ticket.status)}>
                {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
              </Badge>
              <Badge variant="outline" className="ml-2">
                {ticket.ticketType}
              </Badge>

              {isUpcomingSoon && ticket.status === "confirmed" && (
                <Badge
                  variant="outline"
                  className="ml-2 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                >
                  Upcoming Soon
                </Badge>
              )}
            </div>
          </div>

          {ticket.status === "confirmed" && !isPastEvent && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <QrCode className="h-4 w-4 mr-2" />
                  View Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">{ticket.eventTitle}</h3>
                    <p className="text-sm text-muted-foreground">{formattedEventDate}</p>
                  </div>

                  <div className="flex flex-col items-center justify-center p-4 border rounded-md">
                    <div className="text-sm mb-2">Ticket Reference</div>
                    <div className="font-mono text-lg font-bold">{ticket.bookingReference}</div>
                    <div className="w-48 h-48 bg-gray-100 dark:bg-gray-800 mt-2 flex items-center justify-center">
                      <QrCode className="h-32 w-32 text-gray-400" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Present this QR code at the event entrance</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Ticket className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        {ticket.ticketType} × {ticket.quantity}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{ticket.eventLocation}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>John Doe (john.doe@example.com)</span>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button onClick={onDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Ticket
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{formattedEventDate}</span>
          </div>

          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{ticket.eventLocation}</span>
          </div>

          <div className="flex items-center text-sm">
            <Ticket className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>
              Quantity: {ticket.quantity} • Price: {ticket.price}
            </span>
          </div>

          {ticket.status === "cancelled" && (
            <div className="flex items-start text-sm mt-2 p-2 bg-red-50 dark:bg-red-900/10 text-red-800 dark:text-red-400 rounded-md">
              <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>This ticket has been cancelled and is no longer valid for entry.</span>
            </div>
          )}
        </div>
      </CardContent>

      {showActions && ticket.status === "confirmed" && !isPastEvent && (
        <CardFooter className="flex justify-between pt-2">
          <Button variant="outline" onClick={onDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="destructive" onClick={onCancel}>
            Cancel Ticket
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

function TicketCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-28" />
      </CardFooter>
    </Card>
  )
}
