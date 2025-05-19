"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { CalendarDays, Clock, MapPin, Edit, BarChart3, Share2, Eye, Tag, Download, Mail, Percent } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { EventManageModal } from "@/components/dashboard/event-manage-modal"

// Mock data for the event
const event = {
  id: "1",
  title: "Addis Tech Summit 2024",
  description:
    "Join us for the largest technology conference in Ethiopia, featuring keynote speakers, workshops, and networking opportunities with industry leaders.",
  date: "May 15, 2024",
  time: "9:00 AM - 6:00 PM",
  location: "Millennium Hall, Addis Ababa",
  region: "Addis Ababa",
  address: "Bole Road, Near Bole Medhanialem Church, Addis Ababa",
  price: "ETB 500",
  category: "Technology",
  status: "Published",
  createdAt: "January 10, 2024",
  updatedAt: "March 5, 2024",
  attendees: 320,
  maxAttendees: 500,
  revenue: 160000,
  expenses: 80000,
  profit: 80000,
  image: "/placeholder.svg?height=600&width=1200&text=Addis+Tech+Summit",
  gallery: [
    "/placeholder.svg?height=400&width=600&text=Tech+Summit+1",
    "/placeholder.svg?height=400&width=600&text=Tech+Summit+2",
    "/placeholder.svg?height=400&width=600&text=Tech+Summit+3",
    "/placeholder.svg?height=400&width=600&text=Tech+Summit+4",
  ],
  ticketTypes: [
    {
      id: "1",
      name: "Early Bird",
      price: 350,
      sold: 150,
      available: 0,
      total: 150,
      revenue: 52500,
    },
    {
      id: "2",
      name: "Regular",
      price: 500,
      sold: 120,
      available: 130,
      total: 250,
      revenue: 60000,
    },
    {
      id: "3",
      name: "VIP",
      price: 1200,
      sold: 40,
      available: 10,
      total: 50,
      revenue: 48000,
    },
    {
      id: "4",
      name: "Student",
      price: 250,
      sold: 10,
      available: 40,
      total: 50,
      revenue: 2500,
    },
  ],
  schedule: [
    {
      time: "9:00 AM - 10:00 AM",
      title: "Registration & Welcome Coffee",
      location: "Main Lobby",
    },
    {
      time: "10:00 AM - 11:00 AM",
      title: "Opening Keynote: The Future of Tech in Africa",
      speaker: "Dr. Betelhem Dessie, CEO of iCog Labs",
      location: "Main Hall",
    },
    {
      time: "11:15 AM - 12:30 PM",
      title: "Panel Discussion: Building Scalable Tech Solutions for African Markets",
      location: "Main Hall",
    },
    {
      time: "12:30 PM - 1:30 PM",
      title: "Lunch Break & Networking",
      location: "Dining Area",
    },
  ],
  recentAttendees: [
    {
      id: "1",
      name: "Abebe Kebede",
      email: "abebe@example.com",
      ticketType: "Regular",
      purchaseDate: "April 10, 2024",
    },
    { id: "2", name: "Sara Mohammed", email: "sara@example.com", ticketType: "VIP", purchaseDate: "April 9, 2024" },
    {
      id: "3",
      name: "Daniel Tesfaye",
      email: "daniel@example.com",
      ticketType: "Student",
      purchaseDate: "April 8, 2024",
    },
    { id: "4", name: "Hiwot Alemu", email: "hiwot@example.com", ticketType: "Regular", purchaseDate: "April 7, 2024" },
  ],
  promotions: [
    { id: "1", code: "EARLY25", discount: "25%", used: 45, available: 55, total: 100 },
    { id: "2", code: "STUDENT10", discount: "10%", used: 20, available: 80, total: 100 },
  ],
}

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const [isManageModalOpen, setIsManageModalOpen] = useState(false)
  const router = useRouter()

  // In a real app, you would fetch the event data based on the ID
  // const { data: event, isLoading, error } = useEvent(params.id)

  // For demo purposes, we'll use the mock data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/organizer/events" className="text-muted-foreground hover:text-foreground">
              Events
            </Link>
            <span className="text-muted-foreground">/</span>
            <span>{event.title}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mt-1">{event.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={event.status === "Published" ? "secondary" : "outline"}>{event.status}</Badge>
            <span className="text-sm text-muted-foreground">
              Created on {event.createdAt} • Last updated {event.updatedAt}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/events/${event.id}`} target="_blank">
              <Eye className="h-4 w-4" />
              <span className="sr-only">View Public Page</span>
            </Link>
          </Button>
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button onClick={() => setIsManageModalOpen(true)}>Manage</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle>Event Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-[300px] w-full rounded-md overflow-hidden mb-6">
              <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Date</span>
                <div className="flex items-center gap-2 mt-1">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <span className="font-medium">{event.date}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Time</span>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium">{event.time}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Location</span>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium">{event.location}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Category</span>
                <div className="flex items-center gap-2 mt-1">
                  <Tag className="h-4 w-4 text-primary" />
                  <span className="font-medium">{event.category}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Description</h3>
              <p className="text-muted-foreground">{event.description}</p>

              <h3 className="font-semibold pt-4">Event Schedule</h3>
              <div className="space-y-3">
                {event.schedule.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-3 border-b">
                    <div className="w-1/3 font-medium">{item.time}</div>
                    <div className="w-2/3">
                      <div className="font-medium">{item.title}</div>
                      {item.speaker && <div className="text-sm text-muted-foreground">Speaker: {item.speaker}</div>}
                      <div className="text-sm text-muted-foreground">Location: {item.location}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Event Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Ticket Sales</span>
                  <span className="text-sm font-medium">
                    {event.attendees}/{event.maxAttendees}
                  </span>
                </div>
                <Progress value={(event.attendees / event.maxAttendees) * 100} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{Math.round((event.attendees / event.maxAttendees) * 100)}% Sold</span>
                  <span>{event.maxAttendees - event.attendees} Remaining</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-muted rounded-md p-3">
                  <div className="text-sm text-muted-foreground">Revenue</div>
                  <div className="text-xl font-bold mt-1">ETB {event.revenue.toLocaleString()}</div>
                </div>
                <div className="bg-muted rounded-md p-3">
                  <div className="text-sm text-muted-foreground">Profit</div>
                  <div className="text-xl font-bold mt-1">ETB {event.profit.toLocaleString()}</div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Download className="h-4 w-4" />
                    Export Attendee List
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Mail className="h-4 w-4" />
                    Email Attendees
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Share2 className="h-4 w-4" />
                    Share Event
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Recent Attendees</CardTitle>
              <CardDescription>Latest ticket purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {event.recentAttendees.map((attendee) => (
                  <div key={attendee.id} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{attendee.name}</div>
                      <div className="text-sm text-muted-foreground">{attendee.email}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{attendee.ticketType}</Badge>
                      <div className="text-xs text-muted-foreground mt-1">{attendee.purchaseDate}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="link" className="w-full mt-4" asChild>
                <Link href="/dashboard/organizer/attendees">View All Attendees</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="tickets" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Ticket Types</h3>
            <Button size="sm">Add Ticket Type</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {event.ticketTypes.map((ticket) => (
              <Card key={ticket.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{ticket.name}</h4>
                      <div className="text-lg font-bold text-primary">ETB {ticket.price}</div>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Sold</span>
                      <span className="text-sm">
                        {ticket.sold}/{ticket.total}
                      </span>
                    </div>
                    <Progress value={(ticket.sold / ticket.total) * 100} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Available</div>
                      <div className="font-medium">{ticket.available}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Revenue</div>
                      <div className="font-medium">ETB {ticket.revenue.toLocaleString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="promotions" className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Promotion Codes</h3>
            <Button size="sm">Create Promotion</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {event.promotions.map((promo) => (
              <Card key={promo.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{promo.code}</h4>
                      <div className="text-lg font-bold text-primary">{promo.discount} Off</div>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Used</span>
                      <span className="text-sm">
                        {promo.used}/{promo.total}
                      </span>
                    </div>
                    <Progress value={(promo.used / promo.total) * 100} className="h-2" />
                  </div>

                  <div className="mt-4">
                    <div className="text-sm text-muted-foreground">Available Uses</div>
                    <div className="font-medium">{promo.available}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {event.promotions.length === 0 && (
            <div className="text-center py-12">
              <Percent className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No Promotions Yet</h3>
              <p className="text-muted-foreground mb-4">Create promotion codes to offer discounts to your attendees</p>
              <Button>Create Your First Promotion</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">ETB {event.revenue.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">From {event.attendees} ticket sales</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">ETB {event.expenses.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Venue, marketing, etc.</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Net Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">ETB {event.profit.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">
                  {Math.round((event.profit / event.revenue) * 100)}% profit margin
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sales Over Time</CardTitle>
              <CardDescription>Ticket sales trend leading up to the event</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center bg-muted/40 rounded-md">
              <div className="text-center">
                <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Sales chart will appear here</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Type Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[250px] flex items-center justify-center bg-muted/40 rounded-md">
                <div className="text-center">
                  <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Ticket distribution chart will appear here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Promotion Usage</CardTitle>
              </CardHeader>
              <CardContent className="h-[250px] flex items-center justify-center bg-muted/40 rounded-md">
                <div className="text-center">
                  <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Promotion usage chart will appear here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Settings</CardTitle>
              <CardDescription>Configure event visibility and options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Event Status</h3>
                  <div className="flex gap-2">
                    <Button variant={event.status === "Published" ? "default" : "outline"}>Published</Button>
                    <Button variant={event.status === "Draft" ? "default" : "outline"}>Draft</Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Ticket Sales</h3>
                  <div className="flex gap-2">
                    <Button variant="default">Open</Button>
                    <Button variant="outline">Closed</Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Danger Zone</h3>
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
                  <h4 className="font-medium text-destructive mb-1">Cancel Event</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Cancelling will notify all attendees and initiate the refund process.
                  </p>
                  <Button variant="destructive" size="sm">
                    Cancel Event
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EventManageModal event={event} open={isManageModalOpen} onOpenChange={setIsManageModalOpen} />
    </div>
  )
}
