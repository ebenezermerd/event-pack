import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import AttendeeRouteGuard from "@/components/guards/attendee-route-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// This would be replaced with actual data fetching
async function getAttendeeEvents() {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return [
    {
      id: 1,
      name: "Tech Conference 2024",
      date: "June 15, 2024",
      location: "Addis Ababa",
      ticketType: "VIP",
      status: "upcoming",
    },
    {
      id: 2,
      name: "Music Festival",
      date: "July 10, 2024",
      location: "Bahir Dar",
      ticketType: "Standard",
      status: "upcoming",
    },
    {
      id: 3,
      name: "Business Summit",
      date: "May 5, 2024",
      location: "Addis Ababa",
      ticketType: "Premium",
      status: "past",
    },
  ]
}

function EventsList() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <EventsContent />
    </Suspense>
  )
}

async function EventsContent() {
  const events = await getAttendeeEvents()
  const upcomingEvents = events.filter((event) => event.status === "upcoming")
  const pastEvents = events.filter((event) => event.status === "past")

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
        {upcomingEvents.length === 0 ? (
          <p className="text-muted-foreground">You don't have any upcoming events.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle>{event.name}</CardTitle>
                  <CardDescription>
                    {event.date} • {event.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Ticket: {event.ticketType}</span>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Upcoming
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Past Events</h2>
        {pastEvents.length === 0 ? (
          <p className="text-muted-foreground">You don't have any past events.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pastEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle>{event.name}</CardTitle>
                  <CardDescription>
                    {event.date} • {event.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Ticket: {event.ticketType}</span>
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                      Past
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default function MyEventsPage() {
  return (
    <AttendeeRouteGuard>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">My Events</h1>
        <EventsList />
      </div>
    </AttendeeRouteGuard>
  )
}
