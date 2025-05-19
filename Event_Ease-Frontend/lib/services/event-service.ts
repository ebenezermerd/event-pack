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
    const queryParams = new URLSearchParams()
    queryParams.append("featured", "true")
    queryParams.append("limit", "6")

    return await apiClient.get<{ events: EventType[] }>(`/api/events?${queryParams.toString()}`)
  }

  /**
   * Fetch upcoming events
   */
  static async getUpcomingEvents() {
    const queryParams = new URLSearchParams()
    queryParams.append("date", "upcoming")
    queryParams.append("limit", "6")

    return await apiClient.get<{ events: EventType[] }>(`/api/events?${queryParams.toString()}`)
  }

  /**
   * Fetch a single event by ID
   */
  static async getEventById(id: string) {
    // Get the full event details from the backend
    const response = await apiClient.get<{ 
      success: boolean;
      event: any; 
      relatedEvents: any[];
    }>(`/api/events/${id}`)
    
    // Format the event data to match our frontend EventType
    const eventData = response.event
    
    // Format related events
    const formattedRelatedEvents = response.relatedEvents?.map(relEvent => ({
      id: relEvent.id,
      title: relEvent.title,
      date: relEvent.date,
      time: relEvent.time,
      location: relEvent.location,
      price: relEvent.price,
      category: relEvent.category,
      attendees: relEvent.attendees,
      image: relEvent.image,
      relationshipType: relEvent.relationshipType,
      strength: relEvent.strength,
      organizer: relEvent.organizer
    })) || [];
    
    // Create a properly formatted event object that matches what our frontend expects
    const formattedEvent: EventType & {
      longDescription?: string;
      address?: string;
      gallery?: string[];
      ticketTypes?: any[];
      schedule?: any[];
      faqs?: any[];
      relatedEvents?: any[];
    } = {
      id: eventData.id,
      title: eventData.title,
      description: eventData.description,
      longDescription: eventData.longDescription || null,
      startDate: eventData.startDate || eventData.date,
      endDate: eventData.endDate || eventData.date,
      time: eventData.time,
      location: eventData.location,
      address: eventData.address,
      capacity: eventData.capacity || eventData.maxAttendees || 0,
      price: eventData.price,
      image: eventData.image,
      images: eventData.gallery || [],
      gallery: eventData.gallery || [],
      category: eventData.category,
      attendees: eventData.attendees || 0,
      maxAttendees: eventData.maxAttendees,
      isPublic: eventData.isPublic || true,
      approvalStatus: eventData.approvalStatus || "approved",
      isFree: eventData.isFree || !eventData.price || eventData.price === "0" || eventData.price === "Free",
      organizerId: eventData.organizerId || eventData.organizer?.id || 0,
      organizer: {
        name: eventData.organizer?.name || eventData.organizer?.companyName,
        logo: eventData.organizer?.logo,
        description: eventData.organizer?.description,
        email: eventData.organizer?.email,
        phone: eventData.organizer?.phone,
        website: eventData.organizer?.website
      },
      // Additional fields for the event detail page
      ticketTypes: eventData.ticketTypes || [],
      schedule: eventData.schedule || [],
      faqs: eventData.faqs || [],
      relatedEvents: formattedRelatedEvents
    }

    return {
      event: formattedEvent
    }
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
  static async updateEvent(id: string, eventData: Partial<EventType>) {
    return await apiClient.put<{ event: EventType; message: string }>(`/api/organizer/events/${id}`, eventData)
  }

  /**
   * Delete an event
   */
  static async deleteEvent(id: string) {
    return await apiClient.delete<{ message: string }>(`/api/organizer/events/${id}`)
  }

  /**
   * Fetch events created by the logged-in organizer
   */
  static async getOrganizerEvents() {
    return await apiClient.get<{ events: EventType[] }>("/api/organizer/events")
  }

  /**
   * Fetch events booked by the logged-in user
   */
  static async getUserBookings() {
    return await apiClient.get<{ events: EventType[] }>("/api/attendee/bookings")
  }

  /**
   * Book an event
   */
  static async bookEvent(eventId: string) {
    return await apiClient.post<{ message: string }>(`/api/attendee/bookings`, { eventId })
  }

  /**
   * Cancel a booking
   */
  static async cancelBooking(eventId: string) {
    return await apiClient.delete<{ message: string }>(`/api/attendee/bookings/${eventId}`)
  }

  /**
   * Approve an event (admin only)
   */
  static async approveEvent(id: string) {
    return await apiClient.put<{ message: string }>(`/api/admin/events/${id}/approve`, {})
  }

  /**
   * Reject an event (admin only)
   */
  static async rejectEvent(id: string, reason: string) {
    return await apiClient.put<{ message: string }>(`/api/admin/events/${id}/reject`, { reason })
  }

  /**
   * Get pending events (admin only)
   */
  static async getPendingEvents() {
    return await apiClient.get<{ events: EventType[] }>("/api/admin/events/pending")
  }
}
