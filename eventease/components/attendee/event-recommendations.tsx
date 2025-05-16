"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarDays, MapPin, Heart } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

// Mock data - would be replaced with real API calls
const mockRecommendations = [
  {
    id: 1,
    title: "Addis Tech Summit 2024",
    date: "May 15, 2024",
    location: "Millennium Hall, Addis Ababa",
    price: "ETB 500",
    category: "Technology",
    image: "/placeholder.svg?height=300&width=500&text=Addis+Tech+Summit",
    isSaved: false,
    matchScore: 95,
  },
  {
    id: 2,
    title: "Business Innovation Summit",
    date: "June 12, 2024",
    location: "Hyatt Regency, Addis Ababa",
    price: "ETB 1,500",
    category: "Business",
    image: "/placeholder.svg?height=300&width=500&text=Business+Summit",
    isSaved: false,
    matchScore: 87,
  },
  {
    id: 3,
    title: "Ethiopian Fashion Week",
    date: "July 3, 2024",
    location: "Sheraton Addis, Addis Ababa",
    price: "ETB 800",
    category: "Fashion",
    image: "/placeholder.svg?height=300&width=500&text=Fashion+Week",
    isSaved: false,
    matchScore: 82,
  },
]

export function EventRecommendations() {
  const [recommendations, setRecommendations] = useState(mockRecommendations)
  const [loading, setLoading] = useState(false)

  // Simulate loading state
  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const toggleSaveEvent = (id: number) => {
    setRecommendations(
      recommendations.map((event) => (event.id === id ? { ...event, isSaved: !event.isSaved } : event)),
    )

    const event = recommendations.find((e) => e.id === id)
    if (event) {
      toast({
        title: event.isSaved ? "Event removed from saved" : "Event saved",
        description: event.isSaved
          ? "The event has been removed from your saved events"
          : "The event has been added to your saved events",
      })
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {loading
        ? Array(3)
            .fill(0)
            .map((_, i) => <RecommendationCardSkeleton key={i} />)
        : recommendations.map((event) => (
            <RecommendationCard key={event.id} event={event} onSave={() => toggleSaveEvent(event.id)} />
          ))}
    </div>
  )
}

interface RecommendationCardProps {
  event: (typeof mockRecommendations)[0]
  onSave: () => void
}

function RecommendationCard({ event, onSave }: RecommendationCardProps) {
  return (
    <Card className="overflow-hidden group h-full flex flex-col">
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
            onSave()
          }}
        >
          <Heart className={cn("h-4 w-4", event.isSaved && "fill-primary text-primary")} />
        </Button>
        <div className="absolute bottom-3 right-3">
          <Badge variant="outline" className="bg-background/90 text-foreground">
            {event.matchScore}% Match
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 flex-1">
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

      <CardFooter className="p-4 pt-0 flex justify-between items-center mt-auto">
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

function RecommendationCardSkeleton() {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <Skeleton className="aspect-[16/9]" />
      <CardContent className="p-4 flex-1">
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
