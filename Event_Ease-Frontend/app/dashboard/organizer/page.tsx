import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Calendar, CalendarDays, Clock, DollarSign, TrendingUp, User, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import OrganizerRouteGuard from "@/components/guards/organizer-route-guard"

export default function OrganizerDashboardPage() {
  return (
    <OrganizerRouteGuard>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organizer Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, Organizer!</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Today:</span>
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-2 border-transparent hover:border-primary-200 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-primary-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                <span className="text-green-500 font-medium">+2</span>
                <span className="ml-1">from last month</span>
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent hover:border-primary-200 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
              <Users className="h-4 w-4 text-primary-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                <span className="text-green-500 font-medium">+18%</span>
                <span className="ml-1">from last month</span>
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent hover:border-primary-200 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-primary-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">ETB 56,789</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                <span className="text-green-500 font-medium">+12%</span>
                <span className="ml-1">from last month</span>
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent hover:border-primary-200 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <CalendarDays className="h-4 w-4 text-primary-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground mt-1">Next event in 3 days</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-7">
          <Card className="md:col-span-4 border-2 border-transparent hover:border-primary-200 transition-colors">
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Compare event revenue over time</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <BarChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Revenue chart will appear here</p>
              </div>
            </CardContent>
          </Card>
          <Card className="md:col-span-3 border-2 border-transparent hover:border-primary-200 transition-colors">
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Your schedule for the next few days</CardDescription>
              </div>
              <Link href="/dashboard/organizer/events">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { id: 1, name: "Addis Tech Summit 2024", date: "May 15, 2024", time: "9:00 AM", attendees: 320 },
                { id: 2, name: "Ethiopian Coffee Festival", date: "May 22, 2024", time: "10:00 AM", attendees: 150 },
                { id: 3, name: "Cultural Heritage Exhibition", date: "May 28, 2024", time: "2:00 PM", attendees: 75 },
              ].map((event) => (
                <div key={event.id} className="flex items-start border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-100 dark:bg-primary-900 mr-4">
                    <Calendar className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">{event.name}</h4>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <CalendarDays className="mr-1 h-3 w-3" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <User className="mr-1 h-3 w-3" />
                      <span>{event.attendees} attendees</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-2 border-transparent hover:border-primary-200 transition-colors">
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Ticket Sales</CardTitle>
                <CardDescription>Last 7 days of ticket activity</CardDescription>
              </div>
              <Link href="/dashboard/organizer/tickets">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    event: "Addis Tech Summit 2024",
                    buyer: "Abebe Kebede",
                    date: "May 10, 2024",
                    amount: "ETB 500",
                  },
                  {
                    id: 2,
                    event: "Ethiopian Coffee Festival",
                    buyer: "Sara Mohammed",
                    date: "May 9, 2024",
                    amount: "ETB 300",
                  },
                  {
                    id: 3,
                    event: "Cultural Heritage Exhibition",
                    buyer: "Daniel Tesfaye",
                    date: "May 8, 2024",
                    amount: "ETB 200",
                  },
                ].map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium text-sm">{ticket.event}</p>
                      <p className="text-xs text-muted-foreground">{ticket.buyer}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{ticket.amount}</p>
                      <p className="text-xs text-muted-foreground">{ticket.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent hover:border-primary-200 transition-colors">
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>Event Approval Status</CardTitle>
                <CardDescription>Status of your submitted events</CardDescription>
              </div>
              <Link href="/dashboard/organizer/events">
                <Button variant="outline" size="sm">
                  Manage Events
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 1, name: "Addis Tech Summit 2024", status: "Approved", date: "May 5, 2024" },
                  { id: 2, name: "Ethiopian Coffee Festival", status: "Approved", date: "May 3, 2024" },
                  { id: 3, name: "Cultural Heritage Exhibition", status: "Pending", date: "May 10, 2024" },
                  { id: 4, name: "Business Networking Mixer", status: "Pending", date: "May 11, 2024" },
                ].map((event) => (
                  <div
                    key={event.id}
                    className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium text-sm">{event.name}</p>
                      <p className="text-xs text-muted-foreground">Submitted: {event.date}</p>
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          event.status === "Approved"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : event.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </OrganizerRouteGuard>
  )
}
