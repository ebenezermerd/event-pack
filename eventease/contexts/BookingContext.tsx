"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { useAuth } from "./AuthContext"
import { BookingService, type Booking, type TicketType } from "@/lib/services/booking-service"
import { toast } from "@/components/ui/use-toast"
import { handleApiError } from "@/lib/api-client"

interface BookingContextType {
  bookings: Booking[]
  currentBooking: Booking | null
  isLoading: boolean
  error: string | null

  // Ticket types
  fetchEventTicketTypes: (eventId: number) => Promise<TicketType[]>

  // Booking actions
  bookEvent: (eventId: number, ticketTypeId: number, quantity: number) => Promise<boolean>
  getUserBookings: () => Promise<Booking[]>
  getBookingById: (id: number) => Promise<Booking | null>
  cancelBooking: (id: number) => Promise<boolean>
  getBookingByReference: (reference: string) => Promise<Booking | null>

  // Organizer actions
  getEventBookings: (eventId: number) => Promise<Booking[]>
  checkInBooking: (bookingId: number) => Promise<boolean>

  // Clear error
  clearError: () => void
}

const BookingContext = createContext<BookingContextType>({
  bookings: [],
  currentBooking: null,
  isLoading: false,
  error: null,

  fetchEventTicketTypes: async () => [],

  bookEvent: async () => false,
  getUserBookings: async () => [],
  getBookingById: async () => null,
  cancelBooking: async () => false,
  getBookingByReference: async () => null,

  getEventBookings: async () => [],
  checkInBooking: async () => false,

  clearError: () => {},
})

export const useBookings = () => useContext(BookingContext)

export const BookingProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth()

  const [bookings, setBookings] = useState<Booking[]>([])
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = () => setError(null)

  // Fetch ticket types for an event
  const fetchEventTicketTypes = useCallback(async (eventId: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await BookingService.getEventTicketTypes(eventId)
      return response.tickets || []
    } catch (err) {
      const errorMessage = handleApiError(err)
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Book an event
  const bookEvent = useCallback(
    async (eventId: number, ticketTypeId: number, quantity: number) => {
      if (!isAuthenticated) {
        setError("You must be logged in to book an event")
        toast({
          title: "Authentication Required",
          description: "Please log in to book this event",
          variant: "destructive",
        })
        return false
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await BookingService.bookEvent(eventId, ticketTypeId, quantity)

        toast({
          title: "Booking Successful",
          description: response.message || "Your booking has been confirmed",
        })

        setCurrentBooking(response.booking)
        return true
      } catch (err) {
        const errorMessage = handleApiError(err)
        setError(errorMessage)

        toast({
          title: "Booking Failed",
          description: errorMessage,
          variant: "destructive",
        })

        return false
      } finally {
        setIsLoading(false)
      }
    },
    [isAuthenticated],
  )

  // Get user bookings
  const getUserBookings = useCallback(async () => {
    if (!isAuthenticated) {
      setError("You must be logged in to view your bookings")
      return []
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await BookingService.getUserBookings()
      setBookings(response.bookings)
      return response.bookings
    } catch (err) {
      const errorMessage = handleApiError(err)
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  // Get booking by ID
  const getBookingById = useCallback(
    async (id: number) => {
      if (!isAuthenticated) {
        setError("You must be logged in to view booking details")
        return null
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await BookingService.getBookingById(id)
        setCurrentBooking(response.booking)
        return response.booking
      } catch (err) {
        const errorMessage = handleApiError(err)
        setError(errorMessage)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [isAuthenticated],
  )

  // Cancel booking
  const cancelBooking = useCallback(
    async (id: number) => {
      if (!isAuthenticated) {
        setError("You must be logged in to cancel a booking")
        return false
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await BookingService.cancelBooking(id)

        toast({
          title: "Booking Cancelled",
          description: response.message || "Your booking has been cancelled",
        })

        // Update bookings list
        setBookings((prev) =>
          prev.map((booking) => (booking.id === id ? { ...booking, status: "cancelled" } : booking)),
        )

        return true
      } catch (err) {
        const errorMessage = handleApiError(err)
        setError(errorMessage)

        toast({
          title: "Cancellation Failed",
          description: errorMessage,
          variant: "destructive",
        })

        return false
      } finally {
        setIsLoading(false)
      }
    },
    [isAuthenticated],
  )

  // Get booking by reference
  const getBookingByReference = useCallback(async (reference: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await BookingService.getBookingByReference(reference)
      setCurrentBooking(response.booking)
      return response.booking
    } catch (err) {
      const errorMessage = handleApiError(err)
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get event bookings (organizer only)
  const getEventBookings = useCallback(
    async (eventId: number) => {
      if (!isAuthenticated) {
        setError("You must be logged in as an organizer to view event bookings")
        return []
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await BookingService.getEventBookings(eventId)
        return response.bookings
      } catch (err) {
        const errorMessage = handleApiError(err)
        setError(errorMessage)
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [isAuthenticated],
  )

  // Check in booking (organizer only)
  const checkInBooking = useCallback(
    async (bookingId: number) => {
      if (!isAuthenticated) {
        setError("You must be logged in as an organizer to check in attendees")
        return false
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await BookingService.checkInBooking(bookingId)

        toast({
          title: "Check-in Successful",
          description: response.message || "Attendee has been checked in",
        })

        return true
      } catch (err) {
        const errorMessage = handleApiError(err)
        setError(errorMessage)

        toast({
          title: "Check-in Failed",
          description: errorMessage,
          variant: "destructive",
        })

        return false
      } finally {
        setIsLoading(false)
      }
    },
    [isAuthenticated],
  )

  const value = {
    bookings,
    currentBooking,
    isLoading,
    error,

    fetchEventTicketTypes,

    bookEvent,
    getUserBookings,
    getBookingById,
    cancelBooking,
    getBookingByReference,

    getEventBookings,
    checkInBooking,

    clearError,
  }

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}
