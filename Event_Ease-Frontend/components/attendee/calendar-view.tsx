"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, MapPin, CalendarIcon, ChevronRight } from "lucide-react"
import Link from "next/link"
import { format, isSameDay } from "date-fns"
import { cn } from "@/lib/utils"

// Mock data - would be replaced with real API calls
const mockEvents = [
  {
    id: 1,
    title: "Addis Tech Summit 2024",
    date: new Date(2024, 4, 15, 9, 0), // May 15, 2024, 9:00 AM
    endTime: new Date(2024, 4, 15, 18, 0), // May 15, 2024, 6:00 PM
    location: "Millennium Hall, Addis Ababa",
    category: "Technology",
  },
  {
    id: 2,
    title: "Ethiopian Coffee Festival",
    date: new Date(2024, 4, 22, 10, 0), // May 22, 2024, 10:00 AM
    endTime: new Date(2024, 4, 22, 17, 0), // May 22, 2024, 5:00 PM
    location: "Friendship Park, Addis Ababa",
    category: "Cultural",
  },
  {
    id: 3,
    title: "Cultural Heritage Exhibition",
    date: new Date(2024, 4, 28, 14, 0), // May 28, 2024, 2:00 PM
    endTime: new Date(2024, 4, 28, 20, 0), // May 28, 2024, 8:00 PM
    location: "National Museum, Addis Ababa",
    category: "Cultural",
  },
  {
    id: 4,
    title: "Business Innovation Summit",
    date: new Date(2024, 5, 12, 9, 0), // June 12, 2024, 9:00 AM
    endTime: new Date(2024, 5, 12, 17, 0), // June 12, 2024, 5:00 PM
    location: "Hyatt Regency, Addis Ababa",
    category: "Business",
  },
]

export function CalendarView() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<"month" | "agenda">("month")

  // Simulate loading state
  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Get events for the selected date
  const selectedDateEvents = date ? mockEvents.filter((event) => isSameDay(event.date, date)) : []

  // Get all upcoming events sorted by date
  const upcomingEvents = [...mockEvents]
    .filter((event) => event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  // Function to render event indicators on calendar
  const getDayClassNames = (day: Date) => {
    const hasEvent = mockEvents.some((event) => isSameDay(event.date, day))
    return hasEvent ? "bg-primary/10 rounded-md font-medium" : undefined
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue={view} onValueChange={(value) => setView(value as "month" | "agenda")}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="month">Month View</TabsTrigger>
            <TabsTrigger value="agenda">Agenda View</TabsTrigger>
          </TabsList>

          <Button variant="outline" size="sm" asChild>
            <Link href="/events">
              Find Events
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>

        <TabsContent value="month" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>View your events by date</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[350px] w-full" />
                ) : (
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                    dayClassName={getDayClassNames}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{date ? format(date, "MMMM d, yyyy") : "Select a date"}</CardTitle>
                <CardDescription>
                  {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : selectedDateEvents.length > 0 ? (
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                      {selectedDateEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">No events on this date</p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/events">Browse Events</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agenda" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Your scheduled events</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                </div>
              ) : upcomingEvents.length > 0 ? (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <EventCard key={event.id} event={event} showDate />
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">No upcoming events</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/events">Browse Events</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface EventCardProps {
  event: (typeof mockEvents)[0]
  showDate?: boolean
}

function EventCard({ event, showDate = false }: EventCardProps) {
  const startTime = format(event.date, "h:mm a")
  const endTime = format(event.endTime, "h:mm a")

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="hover:border-primary/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h4 className="font-medium">{event.title}</h4>

              {showDate && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                  <span>{format(event.date, "MMMM d, yyyy")}</span>
                </div>
              )}

              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>
                  {startTime} - {endTime}
                </span>
              </div>

              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                <span>{event.location}</span>
              </div>
            </div>

            <Badge
              className={cn(
                event.category === "Technology" && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                event.category === "Cultural" && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                event.category === "Business" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
              )}
            >
              {event.category}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
