"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Plus, Loader2, Filter, Search, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEvents } from "@/contexts/EventContext"
import { useAuth } from "@/contexts/AuthContext"
import { AIEventActions } from "@/components/ai/ai-event-actions"
import { AIGenerationProvider } from "@/contexts/AIGenerationContext"

export default function OrganizerEventsPage() {
  const { events, isLoading, fetchOrganizerEvents } = useEvents()
  const { isAuthenticated, role } = useAuth()
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    if (isAuthenticated && role === "organizer") {
      fetchOrganizerEvents()
    }
  }, [isAuthenticated, role, fetchOrganizerEvents])

  // Filter events based on active tab, search query, and status filter
  const filteredEvents = events.filter((event) => {
    // Filter by tab
    if (activeTab === "published" && event.status !== "published") return false
    if (activeTab === "draft" && event.status !== "draft") return false
    if (activeTab === "pending" && event.status !== "pending") return false

    // Filter by search query
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase())) return false

    // Filter by status
    if (statusFilter !== "all" && event.status !== statusFilter) return false

    return true
  })

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
  }

  return (
    <AIGenerationProvider>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Events</h1>
            <p className="text-muted-foreground">Manage your events and create new ones</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <AIEventActions />

            <Button asChild>
              <Link href="/dashboard/organizer/events/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              className="pl-8 w-full sm:w-[300px]"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending Approval</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No events found</h3>
                <p className="text-muted-foreground mt-1">
                  {searchQuery ? "Try adjusting your search or filters" : "Create your first event to get started"}
                </p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/organizer/events/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Event
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <Card key={event.id} className="overflow-hidden">
                    <div className="relative h-48">
                      <img
                        src={event.image || "/placeholder.svg?height=200&width=400&text=Event+Image"}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            event.status === "published"
                              ? "bg-green-100 text-green-800"
                              : event.status === "draft"
                                ? "bg-gray-100 text-gray-800"
                                : event.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                          }`}
                        >
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                      <CardDescription className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(event.startDate).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm">
                          <span className="font-medium">{event.attendees || 0}</span>{" "}
                          <span className="text-muted-foreground">attendees</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">{event.isFree ? "Free" : `ETB ${event.price || 0}`}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/events/${event.id}`}>View</Link>
                      </Button>
                      <Button size="sm" asChild>
                        <Link href={`/dashboard/organizer/events/${event.id}`}>Manage</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="published" className="mt-6">
            {/* Same content structure as "all" tab but filtered for published events */}
          </TabsContent>

          <TabsContent value="draft" className="mt-6">
            {/* Same content structure as "all" tab but filtered for draft events */}
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            {/* Same content structure as "all" tab but filtered for pending events */}
          </TabsContent>
        </Tabs>
      </div>
    </AIGenerationProvider>
  )
}
