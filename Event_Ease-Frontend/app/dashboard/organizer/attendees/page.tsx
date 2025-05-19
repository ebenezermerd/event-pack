"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Filter, Download, Mail } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, MapPin, Phone, User, CalendarIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { OrganizerRouteGuard } from "@/components/guards/organizer-route-guard"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

// Add interfaces for attendee data
interface Attendee {
  id: string
  name: string
  email: string
  event: string
  eventId: string
  ticket: string
  status: "Checked In" | "Registered" | "Cancelled"
  phone?: string
  checkInTime?: string
}

// Update the component to include data fetching
export default function AttendeesPage() {
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null)
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEvent, setSelectedEvent] = useState("all")
  const [events, setEvents] = useState<{ id: string; name: string }[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await apiClient.get("/organizer/events")
        if (response.data.success) {
          setEvents(
            response.data.events.map((event) => ({
              id: event.id,
              name: event.title,
            })),
          )
        }
      } catch (error) {
        console.error("Error fetching events:", error)
        toast({
          title: "Error",
          description: "Failed to load events",
          variant: "destructive",
        })
      }
    }

    fetchEvents()
  }, [toast])

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        setIsLoading(true)
        const params = new URLSearchParams()
        if (searchQuery) params.append("search", searchQuery)
        if (selectedEvent !== "all") params.append("eventId", selectedEvent)

        const response = await apiClient.get(`/organizer/attendees?${params.toString()}`)

        if (response.data.success) {
          setAttendees(response.data.attendees)
        } else {
          toast({
            title: "Error",
            description: "Failed to load attendees",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching attendees:", error)
        toast({
          title: "Error",
          description: "Failed to load attendees. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAttendees()
  }, [searchQuery, selectedEvent, toast])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleEventChange = (value: string) => {
    setSelectedEvent(value)
  }

  return (
    <OrganizerRouteGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Attendees</h1>
            <p className="text-muted-foreground">Manage attendees for all your events</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Mail className="h-4 w-4" />
              Email All
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search attendees..."
              className="pl-8"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <Select value={selectedEvent} onValueChange={handleEventChange}>
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
            <CardTitle>Attendee List</CardTitle>
            <CardDescription>View and manage all attendees for your events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Attendee</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Ticket Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array(5)
                      .fill(0)
                      .map((_, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-muted animate-pulse"></div>
                              <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
                          </TableCell>
                          <TableCell>
                            <div className="h-4 w-40 bg-muted rounded animate-pulse"></div>
                          </TableCell>
                          <TableCell>
                            <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                          </TableCell>
                          <TableCell>
                            <div className="h-6 w-20 bg-muted rounded animate-pulse"></div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="h-8 w-24 bg-muted rounded animate-pulse ml-auto"></div>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : attendees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No attendees found
                      </TableCell>
                    </TableRow>
                  ) : (
                    attendees.map((attendee, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage
                                src={`/placeholder.svg?height=40&width=40&text=${attendee.name.substring(0, 2)}`}
                              />
                              <AvatarFallback>{attendee.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{attendee.name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{attendee.email}</TableCell>
                        <TableCell>{attendee.event}</TableCell>
                        <TableCell>{attendee.ticket}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              attendee.status === "Checked In"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : attendee.status === "Registered"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            }
                          >
                            {attendee.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => setSelectedAttendee(attendee)}>
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                              <DialogHeader>
                                <DialogTitle>Attendee Details</DialogTitle>
                                <DialogDescription>View detailed information about this attendee</DialogDescription>
                              </DialogHeader>

                              {selectedAttendee && (
                                <div className="overflow-y-auto pr-2">
                                  <div className="flex items-center gap-4 mb-6">
                                    <Avatar className="h-16 w-16">
                                      <AvatarImage
                                        src={`/placeholder.svg?height=64&width=64&text=${selectedAttendee.name.substring(0, 2)}`}
                                      />
                                      <AvatarFallback>{selectedAttendee.name.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h3 className="text-xl font-semibold">{selectedAttendee.name}</h3>
                                      <p className="text-sm text-muted-foreground">{selectedAttendee.email}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge
                                          className={
                                            selectedAttendee.status === "Checked In"
                                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                              : selectedAttendee.status === "Registered"
                                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                          }
                                        >
                                          {selectedAttendee.status}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>

                                  <Card className="mb-6">
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-base">Contact Information</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2">
                                          <Mail className="h-4 w-4 text-muted-foreground" />
                                          <span>{selectedAttendee.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Phone className="h-4 w-4 text-muted-foreground" />
                                          <span>+251 91 234 5678</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <User className="h-4 w-4 text-muted-foreground" />
                                          <span>ID: ATT-{Math.floor(1000 + Math.random() * 9000)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <MapPin className="h-4 w-4 text-muted-foreground" />
                                          <span>Addis Ababa, Ethiopia</span>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  <Tabs defaultValue="current" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 mb-4">
                                      <TabsTrigger value="current">Current Event</TabsTrigger>
                                      <TabsTrigger value="past">Past Events</TabsTrigger>
                                      <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="current" className="space-y-4">
                                      <Card>
                                        <CardHeader className="pb-2">
                                          <CardTitle className="text-base">{selectedAttendee.event}</CardTitle>
                                          <CardDescription>Current event details</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div className="flex items-center gap-2">
                                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                                <span>May 15, 2024</span>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span>9:00 AM - 5:00 PM</span>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <Badge variant="outline">{selectedAttendee.ticket}</Badge>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <span>Millennium Hall, Addis Ababa</span>
                                              </div>
                                            </div>

                                            <div>
                                              <h4 className="text-sm font-medium mb-2">Check-in Status</h4>
                                              <div className="flex items-center gap-2">
                                                {selectedAttendee.status === "Checked In" ? (
                                                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                    Checked In at 9:15 AM
                                                  </Badge>
                                                ) : selectedAttendee.status === "Registered" ? (
                                                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                    Not Checked In Yet
                                                  </Badge>
                                                ) : (
                                                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                                    Cancelled
                                                  </Badge>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </TabsContent>

                                    <TabsContent value="past" className="space-y-4">
                                      {[
                                        {
                                          name: "Ethiopian Coffee Festival 2023",
                                          date: "November 12, 2023",
                                          ticket: "General",
                                          status: "Attended",
                                          venue: "Friendship Park, Addis Ababa",
                                        },
                                        {
                                          name: "Tech Meetup Addis",
                                          date: "January 25, 2024",
                                          ticket: "VIP",
                                          status: "Attended",
                                          venue: "iceaddis, Addis Ababa",
                                        },
                                      ].map((event, i) => (
                                        <Card key={i}>
                                          <CardHeader className="pb-2">
                                            <CardTitle className="text-base">{event.name}</CardTitle>
                                            <CardDescription>{event.date}</CardDescription>
                                          </CardHeader>
                                          <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div className="flex items-center gap-2">
                                                <Badge variant="outline">{event.ticket}</Badge>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                  {event.status}
                                                </Badge>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <span>{event.venue}</span>
                                              </div>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </TabsContent>

                                    <TabsContent value="upcoming" className="space-y-4">
                                      {[
                                        {
                                          name: "Cultural Heritage Exhibition",
                                          date: "May 28, 2024",
                                          ticket: "VIP",
                                          status: "Registered",
                                          venue: "National Museum, Addis Ababa",
                                        },
                                      ].map((event, i) => (
                                        <Card key={i}>
                                          <CardHeader className="pb-2">
                                            <CardTitle className="text-base">{event.name}</CardTitle>
                                            <CardDescription>{event.date}</CardDescription>
                                          </CardHeader>
                                          <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div className="flex items-center gap-2">
                                                <Badge variant="outline">{event.ticket}</Badge>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                  {event.status}
                                                </Badge>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <span>{event.venue}</span>
                                              </div>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </TabsContent>
                                  </Tabs>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </OrganizerRouteGuard>
  )
}
