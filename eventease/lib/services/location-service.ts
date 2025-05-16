import { apiClient } from "@/lib/api-client"

/**
 * Location type definition
 */
export interface Location {
  id: number
  name: string
  address?: string
  city: string
  region?: string
  country: string
  postalCode?: string
  latitude?: number
  longitude?: number
  capacity?: number
  amenities?: string[]
  eventCount?: number
}

/**
 * Service for handling location-related API calls
 */
export class LocationService {
  /**
   * Fetch all locations
   */
  static async getLocations() {
    return await apiClient.get<{ locations: Location[] }>("/api/locations")
  }

  /**
   * Fetch a single location by ID
   */
  static async getLocationById(id: number) {
    return await apiClient.get<{ location: Location }>(`/api/locations/${id}`)
  }

  /**
   * Fetch locations by city
   */
  static async getLocationsByCity(city: string) {
    return await apiClient.get<{ locations: Location[] }>(`/api/locations/city/${city}`)
  }

  /**
   * Create a new location (organizer or admin)
   */
  static async createLocation(locationData: Partial<Location>) {
    return await apiClient.post<{ location: Location; message: string }>("/api/locations", locationData)
  }

  /**
   * Update an existing location (owner or admin)
   */
  static async updateLocation(id: number, locationData: Partial<Location>) {
    return await apiClient.put<{ location: Location; message: string }>(`/api/locations/${id}`, locationData)
  }

  /**
   * Delete a location (admin only)
   */
  static async deleteLocation(id: number) {
    return await apiClient.delete<{ message: string }>(`/api/locations/${id}`)
  }

  /**
   * Get popular cities with event counts
   */
  static async getPopularCities() {
    return await apiClient.get<{ cities: { city: string; country: string; eventCount: number }[] }>(
      "/api/locations/popular-cities",
    )
  }
}
