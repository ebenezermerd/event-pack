"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle2, Clock, Eye, Search, Trash, XCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AdminRouteGuard } from "@/components/guards/admin-route-guard"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface Event {
  id: string
  title: string
  organizer: {
    id: string
    name: string
    companyName: string
  }
  date: string
  location: string
  category: string
  status: "pending" | "published" | "rejected"
  submittedDate: string
  description?: string
  image?: string
}

export default function EventApprovalsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [rejectReason, setRejectReason] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.get("/admin/events")

        if (response.data.success) {
          setEvents(
            response.data.events.map((event: any) => ({
              ...event,
              submittedDate: new Date(event.createdAt).toLocaleDateString(),
            })),
          )
        } else {
          toast({
            title: "Error",
            description: "Failed to load events",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching events:", error)
        toast({
          title: "Error",
          description: "Failed to load events. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [toast])

  const handleApprove = async (id: string) => {
    try {
      const response = await apiClient.put(`/admin/events/${id}/status`, {
        status: "published",
      })

      if (response.data.success) {
        setEvents(events.map((event) => (event.id === id ? { ...event, status: "published" } : event)))
        setSelectedEvent(null)
        toast({
          title: "Success",
          description: "Event has been approved",
        })
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to approve event",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error approving event:", error)
      toast({
        title: "Error",
        description: "Failed to approve event. Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (id: string) => {
    if (!rejectReason) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await apiClient.put(`/admin/events/${id}/status`, {
        status: "rejected",
        reason: rejectReason,
      })

      if (response.data.success) {
        setEvents(events.map((event) => (event.id === id ? { ...event, status: "rejected" } : event)))
        setSelectedEvent(null)
        setRejectReason("")
        toast({
          title: "Success",
          description: "Event has been rejected",
        })
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to reject event",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error rejecting event:", error)
      toast({
        title: "Error",
        description: "Failed to reject event. Please try again later.",
        variant: "destructive",
      })
    }
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.organizer.companyName.toLowerCase().includes(searchTerm.toLowerCase())

    if (filterType === "all") return matchesSearch
    return matchesSearch && event.status === filterType
  })

  return (
    <AdminRouteGuard>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Event Approvals</h1>
            <p className="text-muted-foreground">Review and manage event submissions</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events or organizers..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="published">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="published">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="overflow-hidden animate-pulse">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="p-6 flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-10 w-10 bg-muted rounded-full"></div>
                            <div className="space-y-2">
                              <div className="h-4 w-48 bg-muted rounded"></div>
                              <div className="h-3 w-32 bg-muted rounded"></div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="h-4 w-24 bg-muted rounded"></div>
                            <div className="h-4 w-20 bg-muted rounded"></div>
                            <div className="h-4 w-32 bg-muted rounded"></div>
                          </div>
                        </div>
                        <div className="flex md:flex-col gap-2 p-6 bg-muted/20 border-t md:border-t-0 md:border-l">
                          <div className="h-9 w-28 bg-muted rounded"></div>
                          <div className="h-9 w-28 bg-muted rounded"></div>
                          <div className="h-9 w-28 bg-muted rounded"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredEvents.filter((event) => event.status === "pending").length === 0 ? (
              <div className="text-center py-10">
                <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No pending events found</p>
              </div>
            ) : (
              filteredEvents
                .filter((event) => event.status === "pending")
                .map((event) => (
                  <Card key={event.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="p-6 flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar>
                              <AvatarImage
                                src={`/placeholder.svg?height=40&width=40&text=${event.organizer.companyName.substring(0, 2)}`}
                                alt={event.organizer.companyName}
                              />
                              <AvatarFallback>{event.organizer.companyName.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">{event.title}</h3>
                              <p className="text-sm text-muted-foreground">By {event.organizer.companyName}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{event.category}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">Submitted: {event.submittedDate}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex md:flex-col gap-2 p-6 bg-muted/20 border-t md:border-t-0 md:border-l">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="w-full" onClick={() => setSelectedEvent(event)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                              <DialogHeader>
                                <DialogTitle>Event Review: {selectedEvent?.title}</DialogTitle>
                                <DialogDescription>Review the event details before making a decision</DialogDescription>
                              </DialogHeader>

                              {selectedEvent && (
                                <div className="grid gap-6 py-4 overflow-y-auto pr-2">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                      <img
                                        src={
                                          selectedEvent.image ||
                                          "/placeholder.svg?height=300&width=500&text=Event+Cover"
                                        }
                                        alt="Event cover"
                                        className="w-full h-[200px] object-cover rounded-md"
                                      />
                                    </div>
                                    <div className="space-y-4">
                                      <div>
                                        <h3 className="font-semibold text-lg">{selectedEvent.title}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                          <Avatar className="h-6 w-6">
                                            <AvatarImage
                                              src={`/placeholder.svg?height=40&width=40&text=${selectedEvent.organizer.companyName.substring(0, 2)}`}
                                              alt={selectedEvent.organizer.companyName}
                                            />
                                            <AvatarFallback>
                                              {selectedEvent.organizer.companyName.substring(0, 2)}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span className="text-sm">{selectedEvent.organizer.companyName}</span>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label className="text-xs text-muted-foreground">Date</Label>
                                          <p className="text-sm">{new Date(selectedEvent.date).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                          <Label className="text-xs text-muted-foreground">Category</Label>
                                          <p className="text-sm">{selectedEvent.category}</p>
                                        </div>
                                        <div>
                                          <Label className="text-xs text-muted-foreground">Location</Label>
                                          <p className="text-sm">{selectedEvent.location}</p>
                                        </div>
                                        <div>
                                          <Label className="text-xs text-muted-foreground">Submitted</Label>
                                          <p className="text-sm">{selectedEvent.submittedDate}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <Separator />

                                  <div>
                                    <Label className="text-sm font-medium">Event Description</Label>
                                    <p className="mt-2 text-sm">
                                      {selectedEvent.description ||
                                        `This is a sample description for ${selectedEvent.title}. In a real application, this would contain the full description provided by the organizer.`}
                                    </p>
                                  </div>

                                  <Separator />

                                  <div className="space-y-2">
                                    <Label htmlFor="notes">Rejection Reason (required if rejecting)</Label>
                                    <Textarea
                                      id="notes"
                                      placeholder="Add notes about this event..."
                                      value={rejectReason}
                                      onChange={(e) => setRejectReason(e.target.value)}
                                    />
                                  </div>
                                </div>
                              )}

                              <DialogFooter className="flex justify-between mt-4 pt-2 border-t">
                                <Button
                                  variant="destructive"
                                  onClick={() => selectedEvent && handleReject(selectedEvent.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject Event
                                </Button>
                                <Button onClick={() => selectedEvent && handleApprove(selectedEvent.id)}>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Approve Event
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Button variant="default" className="w-full" onClick={() => handleApprove(event.id)}>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approve
                          </Button>

                          <Button
                            variant="destructive"
                            className="w-full"
                            onClick={() => {
                              setSelectedEvent(event)
                              setRejectReason("")
                              document.getElementById("rejection-dialog")?.click()
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}

            {/* Hidden dialog trigger for rejection */}
            <Dialog>
              <DialogTrigger asChild>
                <button id="rejection-dialog" className="hidden">
                  Open
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reject Event</DialogTitle>
                  <DialogDescription>Please provide a reason for rejecting this event.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Textarea
                    placeholder="Reason for rejection..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => selectedEvent && handleReject(selectedEvent.id)}
                    disabled={!rejectReason}
                  >
                    Reject Event
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="published" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-muted rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-4 w-48 bg-muted rounded"></div>
                            <div className="h-3 w-32 bg-muted rounded"></div>
                          </div>
                        </div>
                        <div className="h-6 w-20 bg-muted rounded"></div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="h-4 w-24 bg-muted rounded"></div>
                        <div className="h-4 w-20 bg-muted rounded"></div>
                        <div className="h-4 w-32 bg-muted rounded"></div>
                      </div>
                      <div className="flex justify-end mt-4">
                        <div className="h-9 w-28 bg-muted rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredEvents.filter((event) => event.status === "published").length === 0 ? (
              <div className="text-center py-10">
                <CheckCircle2 className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No approved events found</p>
              </div>
            ) : (
              filteredEvents
                .filter((event) => event.status === "published")
                .map((event) => (
                  <Card key={event.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage
                              src={`/placeholder.svg?height=40&width=40&text=${event.organizer.companyName.substring(0, 2)}`}
                              alt={event.organizer.companyName}
                            />
                            <AvatarFallback>{event.organizer.companyName.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{event.title}</h3>
                            <p className="text-sm text-muted-foreground">By {event.organizer.companyName}</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Approved
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{event.category}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Approved on: {event.submittedDate}</span>
                        </div>
                      </div>

                      <div className="flex justify-end mt-4">
                        <Button variant="outline" size="sm" onClick={() => setSelectedEvent(event)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-muted rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-4 w-48 bg-muted rounded"></div>
                            <div className="h-3 w-32 bg-muted rounded"></div>
                          </div>
                        </div>
                        <div className="h-6 w-20 bg-muted rounded"></div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="h-4 w-24 bg-muted rounded"></div>
                        <div className="h-4 w-20 bg-muted rounded"></div>
                        <div className="h-4 w-32 bg-muted rounded"></div>
                      </div>
                      <div className="flex justify-end mt-4 gap-2">
                        <div className="h-9 w-28 bg-muted rounded"></div>
                        <div className="h-9 w-28 bg-muted rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredEvents.filter((event) => event.status === "rejected").length === 0 ? (
              <div className="text-center py-10">
                <XCircle className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No rejected events found</p>
              </div>
            ) : (
              filteredEvents
                .filter((event) => event.status === "rejected")
                .map((event) => (
                  <Card key={event.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage
                              src={`/placeholder.svg?height=40&width=40&text=${event.organizer.companyName.substring(0, 2)}`}
                              alt={event.organizer.companyName}
                            />
                            <AvatarFallback>{event.organizer.companyName.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{event.title}</h3>
                            <p className="text-sm text-muted-foreground">By {event.organizer.companyName}</p>
                          </div>
                        </div>
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Rejected</Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{event.category}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Rejected on: {event.submittedDate}</span>
                        </div>
                      </div>

                      <div className="flex justify-end mt-4 gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedEvent(event)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminRouteGuard>
  )
}
