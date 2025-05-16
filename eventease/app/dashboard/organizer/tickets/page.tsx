"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Search,
  Filter,
  Download,
  Plus,
  Ticket,
  Tag,
  Users,
  Clock,
  Calendar,
  Edit,
  Trash2,
  Save,
  X,
  AlertCircle,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

// Define ticket types with icons
const ticketTypes = [
  { id: "general", name: "General Admission", icon: <Ticket className="h-5 w-5" /> },
  { id: "vip", name: "VIP", icon: <Tag className="h-5 w-5" /> },
  { id: "early", name: "Early Bird", icon: <Clock className="h-5 w-5" /> },
  { id: "group", name: "Group", icon: <Users className="h-5 w-5" /> },
  { id: "student", name: "Student", icon: <Calendar className="h-5 w-5" /> },
]

interface TicketType {
  id: number | string
  name: string
  event: string
  eventId: string
  price: string
  available: number
  sold: number
  status: "On Sale" | "Sold Out" | "Hidden" | "Scheduled"
  type: string
  description: string
  startDate: string
  endDate: string
  maxPerOrder: number
  minPerOrder: number
  hasDiscount: boolean
  discountCode: string
  discountAmount: number
}

export default function TicketsPage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [currentTicket, setCurrentTicket] = useState<TicketType | null>(null)
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEvent, setFilterEvent] = useState("all")
  const [events, setEvents] = useState<{ id: string; name: string }[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchTickets = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Fetch tickets
        const ticketsResponse = await fetch("/api/organizer/tickets")
        if (!ticketsResponse.ok) {
          throw new Error("Failed to fetch tickets")
        }
        const ticketsData = await ticketsResponse.json()
        setTickets(ticketsData.tickets)

        // Fetch events for filtering
        const eventsResponse = await fetch("/api/organizer/events")
        if (!eventsResponse.ok) {
          throw new Error("Failed to fetch events")
        }
        const eventsData = await eventsResponse.json()
        setEvents(eventsData.events)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load tickets. Please try again later.")
        toast({
          title: "Error",
          description: "Failed to load tickets. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTickets()
  }, [toast])

  const handleEditTicket = (ticket: TicketType) => {
    setCurrentTicket(ticket)
    setIsEditModalOpen(true)
  }

  const handleCreateTicket = () => {
    setIsCreateModalOpen(true)
  }

  const handleSaveTicket = async () => {
    if (!currentTicket) return

    try {
      const response = await fetch(`/api/organizer/tickets/${currentTicket.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentTicket),
      })

      if (!response.ok) {
        throw new Error("Failed to update ticket")
      }

      const updatedTicket = await response.json()

      // Update local state
      setTickets(tickets.map((ticket) => (ticket.id === currentTicket.id ? updatedTicket.ticket : ticket)))

      setIsEditModalOpen(false)
      toast({
        title: "Success",
        description: "Ticket updated successfully",
        variant: "default",
      })
    } catch (err) {
      console.error("Error updating ticket:", err)
      toast({
        title: "Error",
        description: "Failed to update ticket",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTicket = async () => {
    if (!currentTicket) return

    try {
      const response = await fetch(`/api/organizer/tickets/${currentTicket.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete ticket")
      }

      // Update local state
      setTickets(tickets.filter((ticket) => ticket.id !== currentTicket.id))

      setIsEditModalOpen(false)
      toast({
        title: "Success",
        description: "Ticket deleted successfully",
        variant: "default",
      })
    } catch (err) {
      console.error("Error deleting ticket:", err)
      toast({
        title: "Error",
        description: "Failed to delete ticket",
        variant: "destructive",
      })
    }
  }

  const handleCreateNewTicket = async () => {
    // Implementation would depend on your form structure
    // This is a placeholder for the actual implementation
    try {
      const response = await fetch("/api/organizer/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // New ticket data would be collected from form fields
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create ticket")
      }

      const newTicket = await response.json()

      // Update local state
      setTickets([...tickets, newTicket.ticket])

      setIsCreateModalOpen(false)
      toast({
        title: "Success",
        description: "Ticket created successfully",
        variant: "default",
      })
    } catch (err) {
      console.error("Error creating ticket:", err)
      toast({
        title: "Error",
        description: "Failed to create ticket",
        variant: "destructive",
      })
    }
  }

  const getTicketIcon = (type: string) => {
    const ticketType = ticketTypes.find((t) => t.id === type)
    return ticketType ? ticketType.icon : <Ticket className="h-5 w-5" />
  }

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.event.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesEvent = filterEvent === "all" || ticket.eventId === filterEvent

    return matchesSearch && matchesEvent
  })

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
            <p className="text-muted-foreground">Manage tickets for all your events</p>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-10" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ticket Types</CardTitle>
            <CardDescription>Manage ticket types for your events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Skeleton className="h-4 w-24" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-24" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-16" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-16" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-16" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-16" />
                    </TableHead>
                    <TableHead className="text-right">
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-10 w-40" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-20" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-8 w-16 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
            <p className="text-muted-foreground">Manage tickets for all your events</p>
          </div>
        </div>

        <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Error Loading Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 dark:text-red-400">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
          <p className="text-muted-foreground">Manage tickets for all your events</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2" onClick={handleCreateTicket}>
            <Plus className="h-4 w-4" />
            Create Ticket Type
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterEvent} onValueChange={setFilterEvent}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by event" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {events.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ticket Types</CardTitle>
          <CardDescription>Manage ticket types for your events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket Name</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Sold</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      No tickets found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                            {getTicketIcon(ticket.type)}
                          </div>
                          <span className="font-medium">{ticket.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{ticket.event}</TableCell>
                      <TableCell>{ticket.price}</TableCell>
                      <TableCell>{ticket.available}</TableCell>
                      <TableCell>{ticket.sold}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            ticket.status === "On Sale"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }
                        >
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEditTicket(ticket)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {currentTicket && getTicketIcon(currentTicket.type)}
              <span>Edit Ticket: {currentTicket?.name}</span>
            </DialogTitle>
            <DialogDescription>
              Make changes to your ticket configuration here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          {currentTicket && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ticket-name">Ticket Name</Label>
                    <Input
                      id="ticket-name"
                      value={currentTicket.name}
                      onChange={(e) => setCurrentTicket({ ...currentTicket, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ticket-type">Ticket Type</Label>
                    <Select
                      value={currentTicket.type}
                      onValueChange={(value) => setCurrentTicket({ ...currentTicket, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select ticket type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ticketTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex items-center gap-2">
                              {type.icon}
                              <span>{type.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ticket-description">Description</Label>
                  <Textarea
                    id="ticket-description"
                    value={currentTicket.description}
                    onChange={(e) => setCurrentTicket({ ...currentTicket, description: e.target.value })}
                    placeholder="Describe what this ticket includes and any special benefits"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ticket-event">Event</Label>
                  <Select
                    value={currentTicket.eventId}
                    onValueChange={(value) => {
                      const selectedEvent = events.find((e) => e.id === value)
                      setCurrentTicket({
                        ...currentTicket,
                        eventId: value,
                        event: selectedEvent ? selectedEvent.name : currentTicket.event,
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ticket-price">Base Price (ETB)</Label>
                    <Input
                      id="ticket-price"
                      value={currentTicket.price.replace("ETB ", "")}
                      onChange={(e) => setCurrentTicket({ ...currentTicket, price: `ETB ${e.target.value}` })}
                      type="text"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ticket-fee">Service Fee</Label>
                    <Select defaultValue="included">
                      <SelectTrigger>
                        <SelectValue placeholder="Select fee option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="included">Included in price</SelectItem>
                        <SelectItem value="additional">Additional to price</SelectItem>
                        <SelectItem value="absorb">Absorb fee (organizer pays)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="has-discount">Enable Discount</Label>
                    <Switch
                      id="has-discount"
                      checked={currentTicket.hasDiscount}
                      onCheckedChange={(checked) => setCurrentTicket({ ...currentTicket, hasDiscount: checked })}
                    />
                  </div>
                </div>

                {currentTicket.hasDiscount && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md bg-muted/30">
                    <div className="space-y-2">
                      <Label htmlFor="discount-code">Discount Code</Label>
                      <Input
                        id="discount-code"
                        value={currentTicket.discountCode}
                        onChange={(e) => setCurrentTicket({ ...currentTicket, discountCode: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discount-amount">Discount Amount (%)</Label>
                      <Input
                        id="discount-amount"
                        value={currentTicket.discountAmount}
                        onChange={(e) =>
                          setCurrentTicket({
                            ...currentTicket,
                            discountAmount: Number.parseInt(e.target.value) || 0,
                          })
                        }
                        type="number"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <RadioGroup defaultValue="percentage">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="percentage" id="percentage" />
                      <Label htmlFor="percentage">Percentage (%)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fixed" id="fixed" />
                      <Label htmlFor="fixed">Fixed Amount (ETB)</Label>
                    </div>
                  </RadioGroup>
                </div>
              </TabsContent>

              <TabsContent value="availability" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ticket-quantity">Total Quantity</Label>
                    <Input
                      id="ticket-quantity"
                      value={currentTicket.available + currentTicket.sold}
                      onChange={(e) => {
                        const total = Number.parseInt(e.target.value) || 0
                        setCurrentTicket({
                          ...currentTicket,
                          available: Math.max(0, total - currentTicket.sold),
                        })
                      }}
                      type="number"
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ticket-status">Status</Label>
                    <Select
                      value={
                        currentTicket.status === "On Sale"
                          ? "on-sale"
                          : currentTicket.status === "Sold Out"
                            ? "sold-out"
                            : currentTicket.status === "Hidden"
                              ? "hidden"
                              : "scheduled"
                      }
                      onValueChange={(value) => {
                        let status: "On Sale" | "Sold Out" | "Hidden" | "Scheduled"
                        switch (value) {
                          case "on-sale":
                            status = "On Sale"
                            break
                          case "sold-out":
                            status = "Sold Out"
                            break
                          case "hidden":
                            status = "Hidden"
                            break
                          case "scheduled":
                            status = "Scheduled"
                            break
                          default:
                            status = "On Sale"
                        }
                        setCurrentTicket({ ...currentTicket, status })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="on-sale">On Sale</SelectItem>
                        <SelectItem value="sold-out">Sold Out</SelectItem>
                        <SelectItem value="hidden">Hidden</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sale-start">Sale Start Date</Label>
                    <Input
                      id="sale-start"
                      value={currentTicket.startDate}
                      onChange={(e) => setCurrentTicket({ ...currentTicket, startDate: e.target.value })}
                      type="date"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sale-end">Sale End Date</Label>
                    <Input
                      id="sale-end"
                      value={currentTicket.endDate}
                      onChange={(e) => setCurrentTicket({ ...currentTicket, endDate: e.target.value })}
                      type="date"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min-per-order">Minimum per Order</Label>
                    <Input
                      id="min-per-order"
                      value={currentTicket.minPerOrder}
                      onChange={(e) =>
                        setCurrentTicket({
                          ...currentTicket,
                          minPerOrder: Number.parseInt(e.target.value) || 1,
                        })
                      }
                      type="number"
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-per-order">Maximum per Order</Label>
                    <Input
                      id="max-per-order"
                      value={currentTicket.maxPerOrder}
                      onChange={(e) =>
                        setCurrentTicket({
                          ...currentTicket,
                          maxPerOrder: Number.parseInt(e.target.value) || 1,
                        })
                      }
                      type="number"
                      min="1"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="transferable">Transferable</Label>
                    <Switch id="transferable" defaultChecked />
                  </div>
                  <p className="text-sm text-muted-foreground">Allow attendees to transfer tickets to others</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="refundable">Refundable</Label>
                    <Switch id="refundable" defaultChecked />
                  </div>
                  <p className="text-sm text-muted-foreground">Allow attendees to request refunds</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refund-policy">Refund Policy</Label>
                  <Select defaultValue="7days">
                    <SelectTrigger>
                      <SelectValue placeholder="Select refund policy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">Up to 7 days before event</SelectItem>
                      <SelectItem value="14days">Up to 14 days before event</SelectItem>
                      <SelectItem value="30days">Up to 30 days before event</SelectItem>
                      <SelectItem value="custom">Custom policy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-remaining">Show Remaining Tickets</Label>
                    <Switch id="show-remaining" defaultChecked />
                  </div>
                  <p className="text-sm text-muted-foreground">Display the number of remaining tickets to attendees</p>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter className="flex items-center justify-between mt-6">
            <Button variant="destructive" className="gap-2" onClick={handleDeleteTicket}>
              <Trash2 className="h-4 w-4" />
              Delete Ticket
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button className="gap-2" onClick={handleSaveTicket}>
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Ticket Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Ticket Type</DialogTitle>
            <DialogDescription>Configure a new ticket type for your event</DialogDescription>
          </DialogHeader>

          {/* Create ticket form would go here - similar to edit form but with default values */}

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNewTicket}>Create Ticket</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
