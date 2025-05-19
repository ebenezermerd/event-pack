import { apiClient } from "@/lib/api-client"

/**
 * Ticket type definition
 */
export interface TicketType {
  id: number
  name: string
  description?: string
  price: number
  isFree: boolean
  quantity: number
  sold: number
  maxPerUser?: number
  availableFrom?: string
  availableTo?: string
  eventId: number
}

/**
 * Booking type definition
 */
export interface Booking {
  id: number
  userId: number
  eventId: number
  ticketTypeId: number
  quantity: number
  totalPrice: number
  status: "pending" | "confirmed" | "cancelled" | "checked-in"
  bookingReference: string
  createdAt: string
  updatedAt: string
  Event?: {
    title: string
    startDate: string
    endDate: string
    location: string
    image?: string
  }
  TicketType?: {
    name: string
    description?: string
    price: number
    isFree: boolean
  }
  User?: {
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
}

/**
 * Service for handling booking-related API calls
 */
export class BookingService {
  /**
   * Book an event with specified ticket type and quantity
   */
  static async bookEvent(eventId: number, ticketTypeId: number, quantity = 1) {
    return await apiClient.post<{ success: boolean; message: string; booking: Booking }>("/api/bookings", {
      eventId,
      ticketTypeId,
      quantity,
    })
  }

  /**
   * Get all bookings for the logged-in user
   */
  static async getUserBookings() {
    return await apiClient.get<{ success: boolean; bookings: Booking[] }>("/api/bookings")
  }

  /**
   * Get a single booking by ID
   */
  static async getBookingById(id: number) {
    return await apiClient.get<{ success: boolean; booking: Booking }>(`/api/bookings/${id}`)
  }

  /**
   * Cancel a booking
   */
  static async cancelBooking(id: number) {
    return await apiClient.put<{ success: boolean; message: string }>(`/api/bookings/${id}/cancel`, {})
  }

  /**
   * Get booking by reference number
   */
  static async getBookingByReference(reference: string) {
    return await apiClient.get<{ success: boolean; booking: Booking }>(`/api/bookings/reference/${reference}`)
  }

  /**
   * Get all ticket types for an event
   */
  static async getEventTicketTypes(eventId: number) {
    return await apiClient.get<{ success: boolean; tickets: TicketType[] }>(`/api/events/${eventId}/tickets`)
  }

  /**
   * Get all bookings for an event (organizer only)
   */
  static async getEventBookings(eventId: number) {
    return await apiClient.get<{ success: boolean; bookings: Booking[] }>(`/api/organizer/events/${eventId}/bookings`)
  }

  /**
   * Check in a booking (organizer only)
   */
  static async checkInBooking(bookingId: number) {
    return await apiClient.put<{ success: boolean; message: string }>(
      `/api/organizer/bookings/${bookingId}/check-in`,
      {},
    )
  }

  /**
   * Create a ticket type for an event (organizer only)
   */
  static async createTicketType(eventId: number, ticketTypeData: Partial<TicketType>) {
    return await apiClient.post<{ success: boolean; ticketType: TicketType; message: string }>(
      `/api/organizer/events/${eventId}/ticket-types`,
      ticketTypeData,
    )
  }

  /**
   * Update a ticket type (organizer only)
   */
  static async updateTicketType(id: number, ticketTypeData: Partial<TicketType>) {
    return await apiClient.put<{ success: boolean; ticketType: TicketType; message: string }>(
      `/api/organizer/ticket-types/${id}`,
      ticketTypeData,
    )
  }

  /**
   * Delete a ticket type (organizer only)
   */
  static async deleteTicketType(id: number) {
    return await apiClient.delete<{ success: boolean; message: string }>(`/api/organizer/ticket-types/${id}`)
  }
}
