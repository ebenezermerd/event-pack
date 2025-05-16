"use client"

import { Calendar } from "@/components/ui/calendar"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Search,
  Filter,
  Download,
  Clock,
  Users,
  DollarSign,
  Star,
  MapPin,
  BarChart3,
  PieChart,
  FileText,
  Share2,
  Printer,
  ChevronRight,
  AlertCircle,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

interface PastEvent {
  id: number
  name: string
  date: string
  attendees: number
  revenue: string
  rating: string
  location: string
  description: string
  organizer: string
  duration: string
  ticketsSold: number
  ticketsAvailable: number
  categories: string[]
  sponsors: Array<{
    name: string
    logo: string
  }>
  feedback: Array<{
    rating: number
    count: number
  }>
  topAttendees: Array<{
    name: string
    avatar: string
    company: string
  }>
  financials: {
    ticketRevenue: number
    expenses: number
    netProfit: number
    averageTicketPrice: number
    refunds: number
    refundAmount: number
  }
  demographics: {
    gender: { male: number; female: number }
    age: { [key: string]: number }
    location: { [key: string]: number }
  }
  timeline: Array<{
    time: string
    activity: string
    attendees: number
  }>
}

export default function PastEventsPage() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<PastEvent | null>(null)
  const [pastEvents, setPastEvents] = useState<PastEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchPastEvents = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/organizer/events/past")
        if (!response.ok) {
          throw new Error("Failed to fetch past events")
        }
        const data = await response.json()
        setPastEvents(data.events)
      } catch (err) {
        console.error("Error fetching past events:", err)
        setError("Failed to load past events. Please try again later.")
        toast({
          title: "Error",
          description: "Failed to load past events. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPastEvents()
  }, [toast])

  const handleViewReport = (event: PastEvent) => {
    setSelectedEvent(event)
    setIsReportModalOpen(true)
  }

  const handleExportReport = async (eventId: number, format = "pdf") => {
    try {
      const response = await fetch(`/api/organizer/events/${eventId}/report/export?format=${format}`, {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error("Failed to export report")
      }

      // Handle file download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `event-report-${eventId}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "Report exported successfully",
        variant: "default",
      })
    } catch (err) {
      console.error("Error exporting report:", err)
      toast({
        title: "Error",
        description: "Failed to export report",
        variant: "destructive",
      })
    }
  }

  const filteredEvents = pastEvents.filter(
    (event) =>
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Past Events</h1>
            <p className="text-muted-foreground">View and analyze your completed events</p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-10" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Past Events</CardTitle>
            <CardDescription>All your completed events</CardDescription>
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
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                    <TableHead className="text-right">
                      <Skeleton className="h-4 w-20 ml-auto" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-10 w-48" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-16" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-8 w-24 ml-auto" />
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
            <h1 className="text-3xl font-bold tracking-tight">Past Events</h1>
            <p className="text-muted-foreground">View and analyze your completed events</p>
          </div>
        </div>

        <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Error Loading Past Events
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
          <h1 className="text-3xl font-bold tracking-tight">Past Events</h1>
          <p className="text-muted-foreground">View and analyze your completed events</p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => handleExportReport(0, "excel")} // 0 means export all events
        >
          <Download className="h-4 w-4" />
          Export All
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search past events..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Past Events</CardTitle>
          <CardDescription>All your completed events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Attendees</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      No past events found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="font-medium">{event.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{event.date}</span>
                        </div>
                      </TableCell>
                      <TableCell>{event.attendees}</TableCell>
                      <TableCell>{event.revenue}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                        >
                          {event.rating}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewReport(event)}>
                          View Report
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

      {/* Comprehensive Event Report Modal */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedEvent && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-2xl">Event Report: {selectedEvent.name}</DialogTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => {
                        // Share functionality would be implemented here
                        toast({
                          title: "Share Link Generated",
                          description: "Report link has been copied to clipboard",
                        })
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => window.print()}>
                      <Printer className="h-4 w-4" />
                      Print
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => handleExportReport(selectedEvent.id)}
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>
                <DialogDescription>Comprehensive analysis and statistics for {selectedEvent.name}</DialogDescription>
              </DialogHeader>

              <div className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        Attendance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedEvent.attendees}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {Math.round((selectedEvent.attendees / selectedEvent.ticketsAvailable) * 100)}% of capacity
                      </div>
                      <Progress
                        value={(selectedEvent.attendees / selectedEvent.ticketsAvailable) * 100}
                        className="h-2 mt-2"
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Revenue
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedEvent.revenue}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Net profit: ETB {selectedEvent.financials.netProfit.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Star className="h-4 w-4 mr-2" />
                        Rating
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedEvent.rating}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        From {selectedEvent.feedback.reduce((sum, item) => sum + item.count, 0)} reviews
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid grid-cols-5 mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance</TabsTrigger>
                    <TabsTrigger value="financials">Financials</TabsTrigger>
                    <TabsTrigger value="feedback">Feedback</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Event Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-medium text-sm text-muted-foreground mb-1">Description</h3>
                              <p>{selectedEvent.description}</p>
                            </div>

                            <div>
                              <h3 className="font-medium text-sm text-muted-foreground mb-1">Location</h3>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{selectedEvent.location}</span>
                              </div>
                            </div>

                            <div>
                              <h3 className="font-medium text-sm text-muted-foreground mb-1">Date & Duration</h3>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {selectedEvent.date} ({selectedEvent.duration})
                                </span>
                              </div>
                            </div>

                            <div>
                              <h3 className="font-medium text-sm text-muted-foreground mb-1">Categories</h3>
                              <div className="flex flex-wrap gap-2">
                                {selectedEvent.categories.map((category, index) => (
                                  <Badge key={index} variant="outline">
                                    {category}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h3 className="font-medium text-sm text-muted-foreground mb-1">Organizer</h3>
                              <p>{selectedEvent.organizer}</p>
                            </div>

                            <div>
                              <h3 className="font-medium text-sm text-muted-foreground mb-1">Sponsors</h3>
                              <div className="flex flex-wrap gap-3 mt-2">
                                {selectedEvent.sponsors.map((sponsor, index) => (
                                  <div key={index} className="flex items-center gap-2 border rounded-md p-2">
                                    <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                                      <img
                                        src={sponsor.logo || "/placeholder.svg?height=32&width=32"}
                                        alt={sponsor.name}
                                        className="h-6 w-6"
                                      />
                                    </div>
                                    <span className="text-sm">{sponsor.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h3 className="font-medium text-sm text-muted-foreground mb-1">Key Metrics</h3>
                              <div className="grid grid-cols-2 gap-4 mt-2">
                                <div>
                                  <p className="text-sm text-muted-foreground">Tickets Sold</p>
                                  <p className="font-medium">
                                    {selectedEvent.ticketsSold} / {selectedEvent.ticketsAvailable}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Avg. Ticket Price</p>
                                  <p className="font-medium">ETB {selectedEvent.financials.averageTicketPrice}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Refunds</p>
                                  <p className="font-medium">{selectedEvent.financials.refunds} tickets</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Net Profit</p>
                                  <p className="font-medium">
                                    ETB {selectedEvent.financials.netProfit.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm font-medium">Notable Attendees</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {selectedEvent.topAttendees.map((attendee, index) => (
                              <div key={index} className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={attendee.avatar || "/placeholder.svg"} alt={attendee.name} />
                                  <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{attendee.name}</p>
                                  <p className="text-sm text-muted-foreground">{attendee.company}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm font-medium">Demographics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-sm text-muted-foreground mb-1">Gender Distribution</h3>
                              <div className="flex items-center gap-2">
                                <div className="w-full bg-muted rounded-full h-2.5">
                                  <div
                                    className="bg-primary h-2.5 rounded-full"
                                    style={{ width: `${selectedEvent.demographics.gender.male}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs whitespace-nowrap">
                                  {selectedEvent.demographics.gender.male}% Male /{" "}
                                  {selectedEvent.demographics.gender.female}% Female
                                </span>
                              </div>
                            </div>

                            <div>
                              <h3 className="text-sm text-muted-foreground mb-1">Age Groups</h3>
                              <div className="grid grid-cols-4 gap-1 text-xs">
                                {Object.entries(selectedEvent.demographics.age).map(([age, percentage]) => (
                                  <div key={age} className="text-center">
                                    <div className="mb-1">{age}</div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                      <div
                                        className="bg-primary h-2 rounded-full"
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                    <div className="mt-1">{percentage}%</div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h3 className="text-sm text-muted-foreground mb-1">Location</h3>
                              <div className="flex items-center gap-2">
                                <div className="w-full bg-muted rounded-full h-2.5">
                                  <div
                                    className="bg-primary h-2.5 rounded-full"
                                    style={{ width: `${selectedEvent.demographics.location["Addis Ababa"]}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs whitespace-nowrap">
                                  {selectedEvent.demographics.location["Addis Ababa"]}% Addis Ababa
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="attendance" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Attendance Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px] flex items-center justify-center mb-6">
                          <div className="text-center text-muted-foreground">
                            <BarChart3 className="h-16 w-16 mx-auto mb-2 opacity-50" />
                            <p>Attendance chart visualization would appear here</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium">Check-in Rate</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">98%</div>
                              <p className="text-xs text-muted-foreground">
                                {Math.round(selectedEvent.attendees * 0.98)} of {selectedEvent.attendees} checked in
                              </p>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium">No-Shows</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">2%</div>
                              <p className="text-xs text-muted-foreground">
                                {Math.round(selectedEvent.attendees * 0.02)} tickets unused
                              </p>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium">Capacity Utilization</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">
                                {Math.round((selectedEvent.attendees / selectedEvent.ticketsAvailable) * 100)}%
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {selectedEvent.ticketsAvailable - selectedEvent.attendees} seats unfilled
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Attendee Engagement</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Activity</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Attendees</TableHead>
                                <TableHead>Engagement Rate</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedEvent.timeline.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">{item.activity}</TableCell>
                                  <TableCell>{item.time}</TableCell>
                                  <TableCell>{item.attendees}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Progress
                                        value={(item.attendees / selectedEvent.attendees) * 100}
                                        className="h-2 w-24"
                                      />
                                      <span>{Math.round((item.attendees / selectedEvent.attendees) * 100)}%</span>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="financials" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Financial Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <div className="h-[250px] flex items-center justify-center mb-4">
                              <div className="text-center text-muted-foreground">
                                <PieChart className="h-16 w-16 mx-auto mb-2 opacity-50" />
                                <p>Revenue breakdown chart would appear here</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Ticket Revenue</span>
                              <span className="font-medium">
                                ETB {selectedEvent.financials.ticketRevenue.toLocaleString()}
                              </span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Total Expenses</span>
                              <span className="font-medium">
                                ETB {selectedEvent.financials.expenses.toLocaleString()}
                              </span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Refunds</span>
                              <span className="font-medium">
                                ETB {selectedEvent.financials.refundAmount.toLocaleString()}
                              </span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center font-bold">
                              <span>Net Profit</span>
                              <span>ETB {selectedEvent.financials.netProfit.toLocaleString()}</span>
                            </div>
                            <div className="pt-2">
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                {Math.round(
                                  (selectedEvent.financials.netProfit / selectedEvent.financials.ticketRevenue) * 100,
                                )}
                                % Profit Margin
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Ticket Sales Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-sm text-muted-foreground mb-1">Average Ticket Price</h3>
                              <p className="text-xl font-bold">ETB {selectedEvent.financials.averageTicketPrice}</p>
                            </div>

                            <div>
                              <h3 className="text-sm text-muted-foreground mb-1">Revenue per Attendee</h3>
                              <p className="text-xl font-bold">
                                ETB {Math.round(selectedEvent.financials.ticketRevenue / selectedEvent.attendees)}
                              </p>
                            </div>

                            <div>
                              <h3 className="text-sm text-muted-foreground mb-1">Refund Rate</h3>
                              <p className="text-xl font-bold">
                                {Math.round((selectedEvent.financials.refunds / selectedEvent.ticketsSold) * 100)}%
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {selectedEvent.financials.refunds} tickets refunded (ETB{" "}
                                {selectedEvent.financials.refundAmount.toLocaleString()})
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Expense Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[200px] flex items-center justify-center">
                            <div className="text-center text-muted-foreground">
                              <PieChart className="h-16 w-16 mx-auto mb-2 opacity-50" />
                              <p>Expense breakdown chart would appear here</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Venue</p>
                              <p className="font-medium">
                                ETB {Math.round(selectedEvent.financials.expenses * 0.4).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Marketing</p>
                              <p className="font-medium">
                                ETB {Math.round(selectedEvent.financials.expenses * 0.2).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Staff</p>
                              <p className="font-medium">
                                ETB {Math.round(selectedEvent.financials.expenses * 0.25).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Other</p>
                              <p className="font-medium">
                                ETB {Math.round(selectedEvent.financials.expenses * 0.15).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="feedback" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Attendee Feedback</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <div className="flex items-center gap-4 mb-6">
                              <div className="text-4xl font-bold">{selectedEvent.rating.split("/")[0]}</div>
                              <div className="space-y-1">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-5 w-5 ${star <= Number.parseFloat(selectedEvent.rating) ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`}
                                    />
                                  ))}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Based on {selectedEvent.feedback.reduce((sum, item) => sum + item.count, 0)} reviews
                                </p>
                              </div>
                            </div>

                            <div className="space-y-3">
                              {selectedEvent.feedback.map((item, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <div className="w-12 text-sm">{item.rating} stars</div>
                                  <div className="flex-1">
                                    <div className="w-full bg-muted rounded-full h-2">
                                      <div
                                        className="bg-amber-500 h-2 rounded-full"
                                        style={{
                                          width: `${(item.count / selectedEvent.feedback.reduce((sum, i) => sum + i.count, 0)) * 100}%`,
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                                  <div className="w-12 text-sm text-right">{item.count}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h3 className="font-medium mb-4">Key Feedback Insights</h3>
                            <div className="space-y-4">
                              <div className="p-4 border rounded-md">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className="bg-green-100 text-green-800">Positive</Badge>
                                  <h4 className="font-medium">Great organization</h4>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  85% of attendees mentioned excellent organization and smooth check-in process
                                </p>
                              </div>

                              <div className="p-4 border rounded-md">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className="bg-green-100 text-green-800">Positive</Badge>
                                  <h4 className="font-medium">Content quality</h4>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  78% of attendees praised the quality of content and presentations
                                </p>
                              </div>

                              <div className="p-4 border rounded-md">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className="bg-red-100 text-red-800">Improvement</Badge>
                                  <h4 className="font-medium">Venue temperature</h4>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  23% of attendees mentioned the venue was too cold
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Testimonials</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 border rounded-md">
                            <div className="flex items-center gap-3 mb-3">
                              <Avatar>
                                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                                <AvatarFallback>AB</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">Abebe Kebede</p>
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} className="h-3 w-3 text-amber-500 fill-amber-500" />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <p className="text-sm">
                              "This was one of the best organized events I've attended. The content was excellent and
                              networking opportunities were valuable."
                            </p>
                          </div>

                          <div className="p-4 border rounded-md">
                            <div className="flex items-center gap-3 mb-3">
                              <Avatar>
                                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                                <AvatarFallback>SM</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">Sara Mohammed</p>
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-3 w-3 ${star <= 4 ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <p className="text-sm">
                              "Great event overall. The speakers were knowledgeable and I made some valuable
                              connections. The venue was a bit cold though."
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 text-center">
                          <Button variant="outline" size="sm" className="gap-1">
                            View All Testimonials
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="timeline" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Event Timeline</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="relative border-l-2 border-muted pl-6 ml-4 space-y-8">
                          {selectedEvent.timeline.map((item, index) => (
                            <div key={index} className="relative">
                              <div className="absolute -left-[30px] h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                                <Clock className="h-3 w-3 text-primary-foreground" />
                              </div>
                              <div className="mb-1 text-lg font-medium">{item.time}</div>
                              <div className="mb-2">{item.activity}</div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>{item.attendees} attendees</span>
                                <span>
                                  ({Math.round((item.attendees / selectedEvent.attendees) * 100)}% attendance)
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Peak Times</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[200px] flex items-center justify-center mb-4">
                            <div className="text-center text-muted-foreground">
                              <BarChart3 className="h-16 w-16 mx-auto mb-2 opacity-50" />
                              <p>Attendance over time chart would appear here</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Peak Attendance Time</span>
                              <span className="font-medium">
                                {
                                  selectedEvent.timeline.reduce((max, item) =>
                                    item.attendees > max.attendees ? item : max,
                                  ).time
                                }
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Lowest Attendance Time</span>
                              <span className="font-medium">
                                {
                                  selectedEvent.timeline.reduce((min, item) =>
                                    item.attendees < min.attendees ? item : min,
                                  ).time
                                }
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Average Attendance</span>
                              <span className="font-medium">
                                {Math.round(
                                  selectedEvent.timeline.reduce((sum, item) => sum + item.attendees, 0) /
                                    selectedEvent.timeline.length,
                                )}{" "}
                                attendees
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Activity Engagement</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Activity</TableHead>
                                  <TableHead>Engagement</TableHead>
                                  <TableHead className="text-right">Rating</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedEvent.timeline.map((item, index) => (
                                  <TableRow key={index}>
                                    <TableCell className="font-medium">{item.activity}</TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <Progress
                                          value={(item.attendees / selectedEvent.attendees) * 100}
                                          className="h-2 w-24"
                                        />
                                        <span>{Math.round((item.attendees / selectedEvent.attendees) * 100)}%</span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Badge
                                        variant="outline"
                                        className={
                                          item.attendees > selectedEvent.attendees * 0.9
                                            ? "bg-green-100 text-green-800"
                                            : item.attendees > selectedEvent.attendees * 0.7
                                              ? "bg-amber-100 text-amber-800"
                                              : "bg-red-100 text-red-800"
                                        }
                                      >
                                        {item.attendees > selectedEvent.attendees * 0.9
                                          ? "Excellent"
                                          : item.attendees > selectedEvent.attendees * 0.7
                                            ? "Good"
                                            : "Fair"}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="mt-6 flex justify-between items-center">
                <Button variant="outline" onClick={() => setIsReportModalOpen(false)}>
                  Close Report
                </Button>
                <Button className="gap-2" onClick={() => handleExportReport(selectedEvent.id, "pdf")}>
                  <FileText className="h-4 w-4" />
                  Generate Full Report
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
