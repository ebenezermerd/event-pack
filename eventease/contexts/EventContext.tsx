"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAuth } from "./AuthContext"
import { EventService } from "@/lib/services/event-service"
import { toast } from "@/components/ui/use-toast"
import { handleApiError } from "@/lib/api-client"

// Define types for events
export interface EventType {
  id: number
  title: string
  caption?: string
  description: string
  startDate: string
  endDate: string
  location: string
  capacity: number
  image?: string
  images?: string[]
  registrationDeadline?: string
  isPublic: boolean
  approvalStatus: "pending" | "approved" | "rejected"
  isFree: boolean
  price?: number
  organizerId: number
  organizer?: {
    name: string
    logo?: string
    description?: string
    email?: string
    phone?: string
  }
  attendees?: number
  category?: string
  time?: string
}

export interface EventFilters {
  category?: string
  location?: string
  date?: string
  isFree?: boolean
  searchTerm?: string
}

interface EventContextType {
  // Event data
  events: EventType[]
  featuredEvents: EventType[]
  upcomingEvents: EventType[]
  myEvents: EventType[] // Events created by the logged-in organizer
  myBookings: EventType[] // Events booked by the logged-in user
  currentEvent: EventType | null

  // Event actions
  fetchEvents: (filters?: EventFilters) => Promise<void>
  fetchEventById: (id: number) => Promise<EventType | null>
  createEvent: (eventData: Partial<EventType>) => Promise<boolean>
  updateEvent: (id: number, eventData: Partial<EventType>) => Promise<boolean>
  deleteEvent: (id: number) => Promise<boolean>
  bookEvent: (eventId: number) => Promise<boolean>
  cancelBooking: (eventId: number) => Promise<boolean>

  // Event state
  isLoading: boolean
  error: string | null

  // Filters
  filters: EventFilters
  setFilters: (filters: EventFilters) => void

  // Pagination
  currentPage: number
  totalPages: number
  setCurrentPage: (page: number) => void
}

// Create context with default values
const EventContext = createContext<EventContextType>({
  events: [],
  featuredEvents: [],
  upcomingEvents: [],
  myEvents: [],
  myBookings: [],
  currentEvent: null,

  fetchEvents: async () => {},
  fetchEventById: async () => null,
  createEvent: async () => false,
  updateEvent: async () => false,
  deleteEvent: async () => false,
  bookEvent: async () => false,
  cancelBooking: async () => false,

  isLoading: false,
  error: null,

  filters: {},
  setFilters: () => {},

  currentPage: 1,
  totalPages: 1,
  setCurrentPage: () => {},
})

// Hook to use the event context
export const useEvents = () => useContext(EventContext)

// Provider component
export const EventProvider = ({ children }: { children: React.ReactNode }) => {
  const { token, role, isAuthenticated } = useAuth()

  // State for events
  const [events, setEvents] = useState<EventType[]>([])
  const [featuredEvents, setFeaturedEvents] = useState<EventType[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<EventType[]>([])
  const [myEvents, setMyEvents] = useState<EventType[]>([])
  const [myBookings, setMyBookings] = useState<EventType[]>([])
  const [currentEvent, setCurrentEvent] = useState<EventType | null>(null)

  // State for loading and errors
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // State for filters and pagination
  const [filters, setFilters] = useState<EventFilters>({})
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)

  // Fetch all events with optional filters
  const fetchEvents = useCallback(
    async (newFilters?: EventFilters) => {
      setIsLoading(true)
      setError(null)

      try {
        // Apply new filters if provided
        const appliedFilters = newFilters || filters

        // Fetch events using the event service
        const data = await EventService.getEvents(appliedFilters, currentPage)

        setEvents(data.events)
        setTotalPages(data.pagination.totalPages)

        // If this is the first page, also update featured events
        if (currentPage === 1) {
          // Get featured events
          const featuredData = await EventService.getFeaturedEvents()
          setFeaturedEvents(featuredData.events)

          // Get upcoming events
          const upcomingData = await EventService.getUpcomingEvents()
          setUpcomingEvents(upcomingData.events)
        }
      } catch (err) {
        console.error("Error fetching events:", err)
        setError(handleApiError(err))
      } finally {
        setIsLoading(false)
      }
    },
    [filters, currentPage],
  )

  // Fetch a single event by ID
  const fetchEventById = useCallback(async (id: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await EventService.getEventById(id)
      setCurrentEvent(data.event)
      return data.event
    } catch (err) {
      console.error("Error fetching event:", err)
      setError(handleApiError(err))
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create a new event
  const createEvent = useCallback(
    async (eventData: Partial<EventType>) => {
      if (!isAuthenticated || role !== "organizer") {
        setError("You must be logged in as an organizer to create events")
        return false
      }

      setIsLoading(true)
      setError(null)

      try {
        const data = await EventService.createEvent(eventData)

        // Show success message
        toast({
          title: "Event Created",
          description: data.message || "Your event has been created successfully",
        })

        // Refresh my events
        fetchMyEvents()
        return true
      } catch (err) {
        console.error("Error creating event:", err)
        setError(handleApiError(err))

        // Show error message
        toast({
          title: "Error",
          description: handleApiError(err),
          variant: "destructive",
        })

        return false
      } finally {
        setIsLoading(false)
      }
    },
    [isAuthenticated, role],
  )

  // Update an existing event
  const updateEvent = useCallback(
    async (id: number, eventData: Partial<EventType>) => {
      if (!isAuthenticated || role !== "organizer") {
        setError("You must be logged in as an organizer to update events")
        return false
      }

      setIsLoading(true)
      setError(null)

      try {
        const data = await EventService.updateEvent(id, eventData)

        // Show success message
        toast({
          title: "Event Updated",
          description: data.message || "Your event has been updated successfully",
        })

        // Refresh my events and current event
        fetchMyEvents()
        if (currentEvent?.id === id) {
          fetchEventById(id)
        }

        return true
      } catch (err) {
        console.error("Error updating event:", err)
        setError(handleApiError(err))

        // Show error message
        toast({
          title: "Error",
          description: handleApiError(err),
          variant: "destructive",
        })

        return false
      } finally {
        setIsLoading(false)
      }
    },
    [isAuthenticated, role, currentEvent, fetchEventById],
  )

  // Delete an event
  const deleteEvent = useCallback(
    async (id: number) => {
      if (!isAuthenticated || role !== "organizer") {
        setError("You must be logged in as an organizer to delete events")
        return false
      }

      setIsLoading(true)
      setError(null)

      try {
        const data = await EventService.deleteEvent(id)

        // Show success message
        toast({
          title: "Event Deleted",
          description: data.message || "Your event has been deleted successfully",
        })

        // Remove from my events
        setMyEvents((prev) => prev.filter((event) => event.id !== id))

        // If this is the current event, clear it
        if (currentEvent?.id === id) {
          setCurrentEvent(null)
        }

        return true
      } catch (err) {
        console.error("Error deleting event:", err)
        setError(handleApiError(err))

        // Show error message
        toast({
          title: "Error",
          description: handleApiError(err),
          variant: "destructive",
        })

        return false
      } finally {
        setIsLoading(false)
      }
    },
    [isAuthenticated, role, currentEvent],
  )

  // Book an event
  const bookEvent = useCallback(
    async (eventId: number) => {
      if (!isAuthenticated || role !== "attendee") {
        setError("You must be logged in as an attendee to book events")
        return false
      }

      setIsLoading(true)
      setError(null)

      try {
        const data = await EventService.bookEvent(eventId)

        // Show success message
        toast({
          title: "Event Booked",
          description: data.message || "You have successfully booked this event",
        })

        // Refresh my bookings
        fetchMyBookings()
        return true
      } catch (err) {
        console.error("Error booking event:", err)
        setError(handleApiError(err))

        // Show error message
        toast({
          title: "Error",
          description: handleApiError(err),
          variant: "destructive",
        })

        return false
      } finally {
        setIsLoading(false)
      }
    },
    [isAuthenticated, role],
  )

  // Cancel a booking
  const cancelBooking = useCallback(
    async (eventId: number) => {
      if (!isAuthenticated || role !== "attendee") {
        setError("You must be logged in as an attendee to cancel bookings")
        return false
      }

      setIsLoading(true)
      setError(null)

      try {
        const data = await EventService.cancelBooking(eventId)

        // Show success message
        toast({
          title: "Booking Cancelled",
          description: data.message || "Your booking has been cancelled successfully",
        })

        // Remove from my bookings
        setMyBookings((prev) => prev.filter((event) => event.id !== eventId))
        return true
      } catch (err) {
        console.error("Error cancelling booking:", err)
        setError(handleApiError(err))

        // Show error message
        toast({
          title: "Error",
          description: handleApiError(err),
          variant: "destructive",
        })

        return false
      } finally {
        setIsLoading(false)
      }
    },
    [isAuthenticated, role],
  )

  // Fetch events created by the logged-in organizer
  const fetchMyEvents = useCallback(async () => {
    if (!isAuthenticated || role !== "organizer") {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await EventService.getOrganizerEvents()
      setMyEvents(data.events)
    } catch (err) {
      console.error("Error fetching my events:", err)
      setError(handleApiError(err))

      // Show error message
      toast({
        title: "Error",
        description: handleApiError(err),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, role])

  // Fetch events booked by the logged-in user
  const fetchMyBookings = useCallback(async () => {
    if (!isAuthenticated || role !== "attendee") {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await EventService.getUserBookings()
      setMyBookings(data.events)
    } catch (err) {
      console.error("Error fetching my bookings:", err)
      setError(handleApiError(err))

      // Show error message
      toast({
        title: "Error",
        description: handleApiError(err),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, role])

  // Initial data loading
  useEffect(() => {
    fetchEvents()

    // If authenticated, fetch role-specific data
    if (isAuthenticated) {
      if (role === "organizer") {
        fetchMyEvents()
      } else if (role === "attendee") {
        fetchMyBookings()
      }
    }
  }, [isAuthenticated, role, fetchEvents, fetchMyEvents, fetchMyBookings])

  // Update when filters change
  useEffect(() => {
    fetchEvents()
  }, [filters, currentPage, fetchEvents])

  const value = {
    events,
    featuredEvents,
    upcomingEvents,
    myEvents,
    myBookings,
    currentEvent,

    fetchEvents,
    fetchEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    bookEvent,
    cancelBooking,

    isLoading,
    error,

    filters,
    setFilters,

    currentPage,
    totalPages,
    setCurrentPage,
  }

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>
}

export default EventContext
