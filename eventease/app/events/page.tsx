"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { CalendarDays, Users, MapPin, Filter, Loader2 } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { AdvancedPagination } from "@/components/advanced-pagination"
import { useEvents } from "@/contexts/EventContext"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function EventsPage({ searchParams }: { searchParams: { page?: string; size?: string } }) {
  // Parse query parameters with defaults
  const currentPage = Number(searchParams.page) || 1
  const pageSize = Number(searchParams.size) || 6

  const { events, fetchEvents, isLoading, error, filters, setFilters, totalPages, setCurrentPage } = useEvents()

  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState("")
  const [dateFilter, setDateFilter] = useState("")

  // Fetch events when component mounts or filters change
  useEffect(() => {
    setCurrentPage(currentPage)
    fetchEvents()
  }, [currentPage, fetchEvents, setCurrentPage])

  // Handle search
  const handleSearch = () => {
    setFilters({
      ...filters,
      searchTerm,
      category: category || undefined,
      date: dateFilter || undefined,
    })
  }

  return (
    <>
      <SiteHeader />
      <main className="container py-10 min-h-screen">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Discover Events</h1>
          <p className="text-muted-foreground max-w-3xl mb-6">
            Find and book events across Ethiopia. From tech conferences to cultural exhibitions, we've got something for
            everyone.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-4 items-end">
            <div>
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="cultural">Cultural</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="fashion">Fashion</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Date</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="weekend">This Weekend</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-xl font-medium">No events found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card className="group overflow-hidden border hover:border-primary/20 transition-colors">
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <Image
                      src={event.image || "/placeholder.svg?height=300&width=500&text=Event+Image"}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <Badge className="absolute top-3 right-3 bg-primary/80 hover:bg-primary">{event.category}</Badge>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <CalendarDays className="h-4 w-4 mr-2 text-primary/70" />
                        <span>
                          {new Date(event.startDate).toLocaleDateString()} • {event.time || "All day"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-primary/70" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-primary/70" />
                        <span>{event.attendees || 0} attendees</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div>
                        <span className="font-semibold">{event.isFree ? "Free" : `ETB ${event.price || 0}`}</span>
                      </div>
                      <Button className="text-xs" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12">
          <AdvancedPagination
            totalItems={events.length}
            itemsPerPage={pageSize}
            currentPage={currentPage}
            siblingsCount={1}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
