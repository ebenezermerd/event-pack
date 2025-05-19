"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Calendar, Download, PieChart, TrendingUp, Users, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrganizerRouteGuard } from "@/components/guards/organizer-route-guard"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface EventAnalytics {
  totalAttendees: number
  ticketsSold: number
  conversionRate: number
  averageRating: number
  attendeeGrowth: number
  ticketGrowth: number
  ratingChange: number
  events: {
    id: string
    title: string
  }[]
}

export default function AnalyticsPage() {
  const [selectedEvent, setSelectedEvent] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [analytics, setAnalytics] = useState<EventAnalytics>({
    totalAttendees: 0,
    ticketsSold: 0,
    conversionRate: 0,
    averageRating: 0,
    attendeeGrowth: 0,
    ticketGrowth: 0,
    ratingChange: 0,
    events: [],
  })
  const { toast } = useToast()

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.get(
          `/organizer/analytics${selectedEvent !== "all" ? `?eventId=${selectedEvent}` : ""}`,
        )

        if (response.data.success) {
          setAnalytics(response.data.analytics)
        } else {
          toast({
            title: "Error",
            description: "Failed to load analytics data",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching analytics data:", error)
        toast({
          title: "Error",
          description: "Failed to load analytics data. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [selectedEvent, toast])

  return (
    <OrganizerRouteGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Event Analytics</h1>
            <p className="text-muted-foreground">Track performance and insights for your events</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {analytics.events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array(4)
              .fill(0)
              .map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="h-4 w-24 bg-muted rounded"></div>
                    <div className="h-4 w-4 bg-muted rounded-full"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-7 w-20 bg-muted rounded mb-1"></div>
                    <div className="h-4 w-32 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
                  <Users className="h-4 w-4 text-primary-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalAttendees.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center">
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                    <span className="text-green-500 font-medium">+{analytics.attendeeGrowth}%</span>
                    <span className="ml-1">from last month</span>
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ticket Sales</CardTitle>
                  <Calendar className="h-4 w-4 text-primary-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.ticketsSold.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center">
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                    <span className="text-green-500 font-medium">+{analytics.ticketGrowth}%</span>
                    <span className="ml-1">from last month</span>
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <PieChart className="h-4 w-4 text-primary-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.conversionRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center">
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                    <span className="text-green-500 font-medium">+5%</span>
                    <span className="ml-1">from last month</span>
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 text-primary-600"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.averageRating.toFixed(1)}/5</div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center">
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                    <span className="text-green-500 font-medium">+{analytics.ratingChange.toFixed(1)}</span>
                    <span className="ml-1">from last month</span>
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-7">
          <Card className="md:col-span-4">
            <CardHeader>
              <CardTitle>Attendance Over Time</CardTitle>
              <CardDescription>Number of attendees per event over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-center text-muted-foreground">
                  <BarChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Attendance chart will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Ticket Type Distribution</CardTitle>
              <CardDescription>Breakdown of ticket sales by type</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-center text-muted-foreground">
                  <PieChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Ticket distribution chart will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Audience Demographics</CardTitle>
            <CardDescription>Understand your audience better</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-center text-muted-foreground">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Demographics chart will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </OrganizerRouteGuard>
  )
}
