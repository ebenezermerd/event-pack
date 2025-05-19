"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect } from "react"
import { useParams, notFound } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Ticket,
  Share2,
  Heart,
  Phone,
  Mail,
  Globe,
  ChevronRight,
  AlertCircle,
  Info,
  CheckCircle2,
  Calendar,
} from "lucide-react"
import { useEvents } from "@/contexts/EventContext"
import { RelatedEventType } from "@/contexts/EventContext"

export default function EventDetailPage() {
  const params = useParams<{ id: string }>()
  // Handle the possibility of null params
  if (!params || !params.id) {
    notFound()
  }
  
  const eventId = params.id
  
  const { currentEvent, fetchEventById, isLoading, error } = useEvents()

  useEffect(() => {
    // Fetch event details when component mounts
    fetchEventById(eventId)
  }, [eventId, fetchEventById])

  // Show loading state
  if (isLoading || !currentEvent) {
    return (
      <>
        <SiteHeader />
        <main className="min-h-screen container py-8">
          <div className="relative h-[40vh] md:h-[50vh] lg:h-[60vh] w-full mb-8">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <Skeleton className="h-12 w-2/3 mb-4" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-6 w-full mb-2" />
            </div>
            <div className="lg:w-1/3">
              <Skeleton className="h-40 w-full mb-4" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </main>
        <SiteFooter />
      </>
    )
  }

  // Handle error or not found
  if (error || !currentEvent) {
    notFound()
  }

  // Get organizer's other events - properly typed now
  const organizerOtherEvents = currentEvent.relatedEvents?.filter((e: RelatedEventType) => 
    e.organizer?.name === currentEvent.organizer?.name
  ) || []

  // Get the related events - properly typed now
  const relatedEvents = currentEvent.relatedEvents || []

  // Format the date
  const eventDate = new Date(currentEvent.startDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Check if gallery exists and has length
  const hasGallery = currentEvent.gallery && currentEvent.gallery.length > 0
  const hasImages = currentEvent.images && currentEvent.images.length > 0
  const galleryImages = hasGallery ? currentEvent.gallery : 
                        hasImages ? currentEvent.images : []

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen">
        {/* Hero Section */}
        <div className="relative h-[40vh] md:h-[50vh] lg:h-[60vh] w-full overflow-hidden">
          <Image 
            src={currentEvent.image || "/placeholder.svg"} 
            alt={currentEvent.title} 
            fill 
            className="object-cover" 
            priority 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="container">
              {currentEvent.category && <Badge className="mb-4">{currentEvent.category}</Badge>}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 max-w-4xl">{currentEvent.title}</h1>
              <div className="flex flex-wrap gap-4 text-white/90">
                <div className="flex items-center">
                  <CalendarDays className="h-5 w-5 mr-2" />
                  <span>{eventDate}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>{currentEvent.time || "All day"}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{currentEvent.location}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  <span>{currentEvent.attendees || 0} attending</span>
                </div>
                <div className="flex items-center">
                  <Ticket className="h-5 w-5 mr-2" />
                  <span>From {currentEvent.price ? `ETB ${currentEvent.price}` : "Free"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Heart className="h-4 w-4" />
                    Save
                  </Button>
                </div>
                <Button size="lg" className="bg-primary">
                  Get Tickets
                </Button>
              </div>

              <Tabs defaultValue="about" className="mb-10">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                  <TabsTrigger value="tickets">Tickets</TabsTrigger>
                  <TabsTrigger value="faq">FAQ</TabsTrigger>
                </TabsList>
                <TabsContent value="about" className="pt-6">
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: currentEvent.longDescription || currentEvent.description }} />
                  </div>

                  {/* Event Gallery - Fixed the conditional check */}
                  {(galleryImages && galleryImages.length > 0) && (
                  <div className="mt-10">
                    <h3 className="text-2xl font-bold mb-4">Event Gallery</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {galleryImages.map((image, index) => (
                        <div key={index} className="aspect-square relative rounded-lg overflow-hidden">
                          <Image
                            src={image || "/placeholder.svg"}
                              alt={`${currentEvent.title} gallery image ${index + 1}`}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  )}

                  <div className="mt-10">
                    <h3 className="text-2xl font-bold mb-4">Location</h3>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold mb-2">{currentEvent.location}</h4>
                            <p className="text-muted-foreground mb-4">{currentEvent.address || "Address not specified"}</p>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                Get Directions
                              </Button>
                              <Button size="sm" variant="outline">
                                View on Map
                              </Button>
                            </div>
                          </div>
                          <div className="flex-1 aspect-video relative rounded-lg overflow-hidden bg-muted">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <MapPin className="h-8 w-8 text-muted-foreground" />
                              <span className="sr-only">Map</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="schedule" className="pt-6">
                  <h3 className="text-2xl font-bold mb-6">Event Schedule</h3>
                  {currentEvent.schedule && currentEvent.schedule.length > 0 ? (
                  <div className="space-y-6">
                      {currentEvent.schedule.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="md:w-1/4">
                              <div className="text-lg font-semibold text-primary">{item.time}</div>
                              <div className="text-sm text-muted-foreground mt-1">{item.location}</div>
                            </div>
                            <div className="md:w-3/4">
                              <h4 className="text-lg font-semibold">{item.title}</h4>
                              {item.speaker && <p className="text-muted-foreground mt-1">Speaker: {item.speaker}</p>}
                                {item.description && <p className="mt-2">{item.description}</p>}
                              </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  ) : (
                    <p className="text-muted-foreground">No schedule information available for this event.</p>
                  )}

                  <div className="mt-8 flex justify-center">
                    <Button variant="outline" className="gap-2">
                      <Calendar className="h-4 w-4" />
                      Add to Calendar
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="tickets" className="pt-6">
                  <h3 className="text-2xl font-bold mb-6">Ticket Options</h3>
                  {currentEvent.ticketTypes && currentEvent.ticketTypes.length > 0 ? (
                  <div className="space-y-6">
                      {currentEvent.ticketTypes.map((ticket, index) => (
                      <Card key={index} className={!ticket.available ? "opacity-70" : ""}>
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-lg font-semibold">{ticket.name}</h4>
                                {!ticket.available && (
                                  <Badge variant="outline" className="text-muted-foreground">
                                    Sold Out
                                  </Badge>
                                )}
                              </div>
                                <div className="text-2xl font-bold text-primary mt-1">
                                  {typeof ticket.price === 'number' ? `ETB ${ticket.price}` : ticket.price}
                                </div>
                                {ticket.benefits && ticket.benefits.length > 0 && (
                              <ul className="mt-4 space-y-2">
                                {ticket.benefits.map((benefit, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                    <span>{benefit}</span>
                                  </li>
                                ))}
                              </ul>
                                )}
                              {ticket.requirements && (
                                <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
                                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                                  <span>{ticket.requirements}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-end">
                              <Button disabled={!ticket.available} className={ticket.available ? "bg-primary" : ""}>
                                {ticket.available ? "Buy Ticket" : "Sold Out"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  ) : (
                    <p className="text-muted-foreground">No ticket information available for this event.</p>
                  )}

                  <div className="mt-8 p-4 bg-muted rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Ticket Policy</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Refunds available up to 7 days before the event. Tickets are transferable at any time through
                          your account.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="faq" className="pt-6">
                  <h3 className="text-2xl font-bold mb-6">Frequently Asked Questions</h3>
                  {currentEvent.faqs && currentEvent.faqs.length > 0 ? (
                  <div className="space-y-6">
                      {currentEvent.faqs.map((faq, index) => (
                      <Card key={index}>
                        <CardContent className="p-6">
                          <h4 className="text-lg font-semibold mb-2">{faq.question}</h4>
                          <p className="text-muted-foreground">{faq.answer}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  ) : (
                    <p className="text-muted-foreground">No FAQ information available for this event.</p>
                  )}

                  <div className="mt-8 p-6 bg-muted rounded-lg text-center">
                    <h4 className="font-semibold mb-2">Still have questions?</h4>
                    <p className="text-muted-foreground mb-4">Contact the event organizer directly</p>
                    <Button variant="outline">Contact Organizer</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="lg:w-1/3 space-y-8">
              {/* Organizer Card */}
              {currentEvent.organizer && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Event Organizer</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 relative rounded-lg overflow-hidden">
                      <Image
                          src={currentEvent.organizer.logo || "/placeholder.svg"}
                          alt={currentEvent.organizer.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                        <h4 className="font-semibold">{currentEvent.organizer.name}</h4>
                      <p className="text-sm text-muted-foreground">
                          Organizer
                      </p>
                    </div>
                  </div>
                    <p className="text-muted-foreground text-sm mb-4">{currentEvent.organizer.description || "No description available."}</p>
                  <div className="space-y-2">
                      {currentEvent.organizer.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                          <a href={currentEvent.organizer.website} className="text-primary hover:underline">
                            {currentEvent.organizer.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                      )}
                      {currentEvent.organizer.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                          <a href={`mailto:${currentEvent.organizer.email}`} className="hover:underline">
                            {currentEvent.organizer.email}
                      </a>
                    </div>
                      )}
                      {currentEvent.organizer.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                          <a href={`tel:${currentEvent.organizer.phone}`} className="hover:underline">
                            {currentEvent.organizer.phone}
                      </a>
                        </div>
                      )}
                  </div>
                  <div className="mt-6 flex gap-2">
                    <Button variant="outline" className="w-full">
                      Follow
                    </Button>
                    <Button variant="outline" className="w-full">
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
              )}

              {/* Event Stats */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Event Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold text-primary">{currentEvent.attendees || 0}</div>
                      <div className="text-sm text-muted-foreground">Attending</div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold text-primary">
                        {currentEvent.capacity && currentEvent.attendees
                          ? Math.round((currentEvent.attendees / currentEvent.capacity) * 100)
                          : 0}%
                      </div>
                      <div className="text-sm text-muted-foreground">Capacity</div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold text-primary">
                        {Math.max(0, Math.floor((new Date(currentEvent.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
                      </div>
                      <div className="text-sm text-muted-foreground">Days Left</div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold text-primary">{currentEvent.ticketTypes?.length || 0}</div>
                      <div className="text-sm text-muted-foreground">Ticket Types</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* More from this organizer */}
              {organizerOtherEvents.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-4">More from {currentEvent.organizer?.name}</h3>
                  <div className="space-y-4">
                    {organizerOtherEvents.map((otherEvent: RelatedEventType) => (
                      <Link key={otherEvent.id} href={`/events/${otherEvent.id}`}>
                        <Card className="hover:border-primary/20 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              <div className="h-16 w-16 relative rounded-lg overflow-hidden shrink-0">
                                <Image
                                  src={otherEvent.image || "/placeholder.svg"}
                                  alt={otherEvent.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <h4 className="font-semibold line-clamp-1">{otherEvent.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(otherEvent.date).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-primary mt-1">
                                  {otherEvent.price ? `ETB ${otherEvent.price}` : "Free"}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                    {currentEvent.organizer?.name && (
                    <Button variant="outline" className="w-full" asChild>
                        <Link href={`/organizers/${currentEvent.organizer.name.toLowerCase().replace(/\s+/g, "-")}`}>
                        View All Events
                      </Link>
                    </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Events */}
          {relatedEvents.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Similar Events You Might Like</h2>
              <Link href="/events" className="text-primary hover:underline flex items-center">
                View All Events <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedEvents.map((relEvent: RelatedEventType) => (
                <Link key={relEvent.id} href={`/events/${relEvent.id}`}>
                  <Card className="group overflow-hidden border hover:border-primary/20 transition-colors">
                    <div className="aspect-[16/9] relative overflow-hidden">
                      <Image
                        src={relEvent.image || "/placeholder.svg"}
                        alt={relEvent.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <Badge className="absolute top-3 right-3 bg-primary/80 hover:bg-primary">
                        {relEvent.category}
                      </Badge>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {relEvent.title}
                      </h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <CalendarDays className="h-4 w-4 mr-2 text-primary/70" />
                          <span>
                              {new Date(relEvent.date).toLocaleDateString()} • {relEvent.time || "All day"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-primary/70" />
                          <span>{relEvent.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-primary/70" />
                            <span>{relEvent.attendees || 0} attendees</span>
                          </div>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div>
                            <span className="font-semibold">{relEvent.price ? `ETB ${relEvent.price}` : "Free"}</span>
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
          </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
