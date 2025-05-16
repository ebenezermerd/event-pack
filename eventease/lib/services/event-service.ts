import { apiClient } from "@/lib/api-client"
import type { EventType, EventFilters } from "@/contexts/EventContext"

/**
 * Service for handling event-related API calls
 */
export class EventService {
  /**
   * Fetch all events with optional filters
   */
  static async getEvents(filters: EventFilters = {}, page = 1, limit = 10) {
    // Build query params
    const queryParams = new URLSearchParams()

    if (filters.category) queryParams.append("category", filters.category)
    if (filters.location) queryParams.append("location", filters.location)
    if (filters.date) queryParams.append("date", filters.date)
    if (filters.isFree !== undefined) queryParams.append("isFree", filters.isFree.toString())
    if (filters.searchTerm) queryParams.append("search", filters.searchTerm)

    // Add pagination
    queryParams.append("page", page.toString())
    queryParams.append("limit", limit.toString())

    return await apiClient.get<{ events: EventType[]; pagination: { totalPages: number; currentPage: number } }>(
      `/api/events?${queryParams.toString()}`,
    )
  }

  /**
   * Fetch featured events
   */
  static async getFeaturedEvents() {
    return await apiClient.get<{ events: EventType[] }>("/api/events/featured")
  }

  /**
   * Fetch upcoming events
   */
  static async getUpcomingEvents() {
    return await apiClient.get<{ events: EventType[] }>("/api/events/upcoming")
  }

  /**
   * Fetch a single event by ID
   */
  static async getEventById(id: number) {
    return await apiClient.get<{ event: EventType }>(`/api/events/${id}`)
  }

  /**
   * Create a new event
   */
  static async createEvent(eventData: Partial<EventType>) {
    return await apiClient.post<{ event: EventType; message: string }>("/api/organizer/events", eventData)
  }

  /**
   * Update an existing event
   */
  static async updateEvent(id: number, eventData: Partial<EventType>) {
    return await apiClient.put<{ event: EventType; message: string }>(`/api/organizer/events/${id}`, eventData)
  }

  /**
   * Delete an event
   */
  static async deleteEvent(id: number) {
    return await apiClient.delete<{ message: string }>(`/api/organizer/events/${id}`)
  }

  /**
   * Fetch events created by the logged-in organizer
   */
  static async getOrganizerEvents() {
    return await apiClient.get<{ events: EventType[] }>("/api/organizer/events")
  }

  /**
   * Book an event
   */
  static async bookEvent(eventId: number) {
    return await apiClient.post<{ message: string }>("/api/user/book-event", { eventId })
  }

  /**
   * Cancel a booking
   */
  static async cancelBooking(eventId: number) {
    return await apiClient.delete<{ message: string }>(`/api/user/booked-events/${eventId}`)
  }

  /**
   * Fetch events booked by the logged-in user
   */
  static async getUserBookings() {
    return await apiClient.get<{ events: EventType[] }>("/api/user/booked-events")
  }

  /**
   * Approve an event (admin only)
   */
  static async approveEvent(id: number) {
    return await apiClient.put<{ message: string }>(`/api/admin/events/${id}/approve`, {})
  }

  /**
   * Reject an event (admin only)
   */
  static async rejectEvent(id: number, reason: string) {
    return await apiClient.put<{ message: string }>(`/api/admin/events/${id}/reject`, { reason })
  }

  /**
   * Get pending events (admin only)
   */
  static async getPendingEvents() {
    return await apiClient.get<{ events: EventType[] }>("/api/admin/events/pending")
  }
}
