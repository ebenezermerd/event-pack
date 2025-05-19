"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarDays, Clock, MapPin, Heart, Share2, Filter, Search } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

// Mock data - would be replaced with real API calls
const mockEvents = [
  {
    id: 1,
    title: "Addis Tech Summit 2024",
    description:
      "Join the largest tech conference in Ethiopia featuring keynote speakers, workshops, and networking opportunities.",
    date: "May 15, 2024",
    time: "9:00 AM - 6:00 PM",
    location: "Millennium Hall, Addis Ababa",
    price: "ETB 500",
    category: "Technology",
    attendees: 320,
    image: "/placeholder.svg?height=300&width=500&text=Addis+Tech+Summit",
    isSaved: false,
  },
  {
    id: 2,
    title: "Ethiopian Coffee Festival",
    description:
      "Experience the rich tradition of Ethiopian coffee with tastings, cultural performances, and educational sessions.",
    date: "May 22, 2024",
    time: "10:00 AM - 5:00 PM",
    location: "Friendship Park, Addis Ababa",
    price: "ETB 200",
    category: "Cultural",
    attendees: 450,
    image: "/placeholder.svg?height=300&width=500&text=Coffee+Festival",
    isSaved: true,
  },
  {
    id: 3,
    title: "Cultural Heritage Exhibition",
    description:
      "Explore Ethiopia's diverse cultural heritage through artifacts, photographs, and interactive displays.",
    date: "May 28, 2024",
    time: "2:00 PM - 8:00 PM",
    location: "National Museum, Addis Ababa",
    price: "ETB 100",
    category: "Cultural",
    attendees: 280,
    image: "/placeholder.svg?height=300&width=500&text=Cultural+Exhibition",
    isSaved: false,
  },
]

export function EventFeed() {
  const router = useRouter()
  const [events, setEvents] = useState(mockEvents)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedDate, setSelectedDate] = useState("all")

  // Simulate loading state
  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Filter events based on search query and filters
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      selectedCategory === "all" || event.category.toLowerCase() === selectedCategory.toLowerCase()

    // Simple date filtering logic - would be more sophisticated in a real app
    const matchesDate = selectedDate === "all" || (selectedDate === "upcoming" && new Date(event.date) > new Date())

    return matchesSearch && matchesCategory && matchesDate
  })

  const toggleSaveEvent = (id: number) => {
    setEvents(events.map((event) => (event.id === id ? { ...event, isSaved: !event.isSaved } : event)))

    const event = events.find((e) => e.id === id)
    if (event) {
      toast({
        title: event.isSaved ? "Event removed from saved" : "Event saved",
        description: event.isSaved
          ? "The event has been removed from your saved events"
          : "The event has been added to your saved events",
      })
    }
  }

  const shareEvent = (id: number) => {
    const event = events.find((e) => e.id === id)
    if (event) {
      // In a real app, this would use the Web Share API or create a shareable link
      toast({
        title: "Share link copied",
        description: `Share link for "${event.title}" has been copied to clipboard`,
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="cultural">Cultural</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="entertainment">Entertainment</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="tomorrow">Tomorrow</SelectItem>
              <SelectItem value="weekend">This Weekend</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full max-w-md grid grid-cols-3">
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="attending">Attending</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="space-y-6">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onSave={() => toggleSaveEvent(event.id)}
                  onShare={() => shareEvent(event.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No events found matching your criteria</p>
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("all")
                  setSelectedDate("all")
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="attending" className="mt-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">You're not attending any upcoming events</p>
            <Button variant="link" onClick={() => router.push("/events")}>
              Browse events
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">You haven't attended any past events</p>
            <Button variant="link" onClick={() => router.push("/events")}>
              Browse events
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface EventCardProps {
  event: (typeof mockEvents)[0]
  onSave: () => void
  onShare: () => void
}

function EventCard({ event, onSave, onShare }: EventCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="md:flex">
        <div className="relative h-48 md:h-auto md:w-1/3">
          <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
          <Badge className="absolute top-3 right-3 bg-primary/80 hover:bg-primary">{event.category}</Badge>
        </div>

        <div className="flex flex-col flex-1 p-6">
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-semibold mb-2">
                <Link href={`/events/${event.id}`} className="hover:text-primary transition-colors">
                  {event.title}
                </Link>
              </h3>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault()
                    onSave()
                  }}
                  className={cn(
                    "text-muted-foreground hover:text-foreground",
                    event.isSaved && "text-primary hover:text-primary",
                  )}
                >
                  <Heart className={cn("h-5 w-5", event.isSaved && "fill-primary")} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault()
                    onShare()
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{event.description}</p>

            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-2 text-primary/70" />
                <span>{event.date}</span>
              </div>

              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-primary/70" />
                <span>{event.time}</span>
              </div>

              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-primary/70" />
                <span>{event.location}</span>
              </div>
            </div>
          </div>

          <CardFooter className="px-0 pt-4 pb-0 mt-4 flex justify-between items-center">
            <div>
              <span className="font-semibold">{event.price}</span>
            </div>
            <Button asChild>
              <Link href={`/events/${event.id}`}>View Details</Link>
            </Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  )
}

function EventCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="md:flex">
        <Skeleton className="h-48 md:h-auto md:w-1/3" />
        <div className="flex flex-col flex-1 p-6 space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-6 w-2/3" />
            <div className="flex space-x-1">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex justify-between pt-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </div>
    </Card>
  )
}
