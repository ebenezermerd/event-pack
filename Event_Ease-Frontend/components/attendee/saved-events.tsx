"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarDays, MapPin, Trash2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Mock data - would be replaced with real API calls
const mockSavedEvents = [
  {
    id: 1,
    title: "Ethiopian Coffee Festival",
    date: "May 22, 2024",
    location: "Friendship Park, Addis Ababa",
    price: "ETB 200",
    category: "Cultural",
    image: "/placeholder.svg?height=300&width=500&text=Coffee+Festival",
    savedAt: "2024-04-15T10:30:00Z",
  },
  {
    id: 2,
    title: "Addis Film Festival",
    date: "June 5, 2024",
    location: "Vamdas Entertainment, Addis Ababa",
    price: "ETB 300",
    category: "Entertainment",
    image: "/placeholder.svg?height=300&width=500&text=Film+Festival",
    savedAt: "2024-04-10T14:20:00Z",
  },
  {
    id: 3,
    title: "Business Innovation Summit",
    date: "June 12, 2024",
    location: "Hyatt Regency, Addis Ababa",
    price: "ETB 1,500",
    category: "Business",
    image: "/placeholder.svg?height=300&width=500&text=Business+Summit",
    savedAt: "2024-04-05T09:15:00Z",
  },
  {
    id: 4,
    title: "Ethiopian Fashion Week",
    date: "July 3, 2024",
    location: "Sheraton Addis, Addis Ababa",
    price: "ETB 800",
    category: "Fashion",
    image: "/placeholder.svg?height=300&width=500&text=Fashion+Week",
    savedAt: "2024-04-01T16:45:00Z",
  },
]

export function SavedEvents() {
  const [savedEvents, setSavedEvents] = useState(mockSavedEvents)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("date")

  // Simulate loading state
  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Filter and sort events
  const filteredEvents = savedEvents
    .filter((event) => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory =
        selectedCategory === "all" || event.category.toLowerCase() === selectedCategory.toLowerCase()
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      } else if (sortBy === "recent") {
        return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
      } else if (sortBy === "title") {
        return a.title.localeCompare(b.title)
      }
      return 0
    })

  const removeEvent = (id: number) => {
    setSavedEvents(savedEvents.filter((event) => event.id !== id))
    toast({
      title: "Event removed",
      description: "The event has been removed from your saved events",
    })
  }

  const clearAllSavedEvents = () => {
    setSavedEvents([])
    toast({
      title: "All saved events cleared",
      description: "All events have been removed from your saved events",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Saved Events</h2>

        {savedEvents.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all saved events?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently remove all events from your saved list.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearAllSavedEvents}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {savedEvents.length > 0 && (
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search saved events..."
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
                <SelectItem value="fashion">Fashion</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="recent">Recently Saved</SelectItem>
                <SelectItem value="title">Sort by Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <SavedEventCardSkeleton key={i} />
          ))}
        </div>
      ) : savedEvents.length > 0 ? (
        filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <SavedEventCard key={event.id} event={event} onRemove={() => removeEvent(event.id)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No saved events match your search</p>
            <Button
              variant="link"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
              }}
            >
              Clear filters
            </Button>
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-2">You haven't saved any events yet</p>
          <Button asChild>
            <Link href="/events">Browse Events</Link>
          </Button>
        </div>
      )}
    </div>
  )
}

interface SavedEventCardProps {
  event: (typeof mockSavedEvents)[0]
  onRemove: () => void
}

function SavedEventCard({ event, onRemove }: SavedEventCardProps) {
  return (
    <Card className="overflow-hidden group">
      <div className="relative aspect-[16/9]">
        <Image
          src={event.image || "/placeholder.svg"}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <Badge className="absolute top-3 right-3 bg-primary/80 hover:bg-primary">{event.category}</Badge>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 left-3 bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.preventDefault()
            onRemove()
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
          <Link href={`/events/${event.id}`}>{event.title}</Link>
        </h3>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center">
            <CalendarDays className="h-4 w-4 mr-2 text-primary/70" />
            <span>{event.date}</span>
          </div>

          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-primary/70" />
            <span>{event.location}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div>
          <span className="font-semibold">{event.price}</span>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/events/${event.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

function SavedEventCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[16/9]" />
      <CardContent className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-9 w-28" />
      </CardFooter>
    </Card>
  )
}
