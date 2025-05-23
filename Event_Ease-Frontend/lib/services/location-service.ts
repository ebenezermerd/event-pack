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

// Mock data for fallback
const mockLocations: Location[] = [
  {
    id: 1,
    name: "Addis Ababa Exhibition Center",
    city: "Addis Ababa",
    region: "Addis Ababa",
    country: "Ethiopia",
    eventCount: 12
  },
  {
    id: 2,
    name: "Millennium Hall",
    city: "Addis Ababa",
    region: "Addis Ababa",
    country: "Ethiopia",
    eventCount: 8
  },
  {
    id: 3,
    name: "Hawassa City Stadium",
    city: "Hawassa",
    region: "SNNPR",
    country: "Ethiopia",
    eventCount: 5
  }
];

const mockPopularCities = [
  { city: "Addis Ababa", country: "Ethiopia", eventCount: 25 },
  { city: "Hawassa", country: "Ethiopia", eventCount: 10 },
  { city: "Bahir Dar", country: "Ethiopia", eventCount: 8 },
  { city: "Adama", country: "Ethiopia", eventCount: 6 },
  { city: "Mekelle", country: "Ethiopia", eventCount: 5 }
];

/**
 * Service for handling location-related API calls
 */
export class LocationService {
  /**
   * Fetch all locations
   */
  static async getLocations() {
    try {
      return await apiClient.get<{ locations: Location[] }>("/api/locations")
    } catch (error) {
      console.warn("Failed to fetch locations from API, using fallback data:", error);
      // Return mock data as fallback
      return { locations: mockLocations };
    }
  }

  /**
   * Fetch a single location by ID
   */
  static async getLocationById(id: number) {
    try {
      return await apiClient.get<{ location: Location }>(`/api/locations/${id}`)
    } catch (error) {
      console.warn(`Failed to fetch location ${id} from API, using fallback data:`, error);
      // Return mock data as fallback
      const location = mockLocations.find(loc => loc.id === id) || mockLocations[0];
      return { location };
    }
  }

  /**
   * Fetch locations by city
   */
  static async getLocationsByCity(city: string) {
    try {
      return await apiClient.get<{ locations: Location[] }>(`/api/locations/city/${city}`)
    } catch (error) {
      console.warn(`Failed to fetch locations for city ${city} from API, using fallback data:`, error);
      // Return mock data as fallback
      const locations = mockLocations.filter(loc => 
        loc.city.toLowerCase().includes(city.toLowerCase())
      );
      return { locations: locations.length ? locations : mockLocations };
    }
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
    try {
      return await apiClient.get<{ cities: { city: string; country: string; eventCount: number }[] }>(
        "/api/locations/popular-cities",
      )
    } catch (error) {
      console.warn("Failed to fetch popular cities from API, using fallback data:", error);
      // Return mock data as fallback
      return { cities: mockPopularCities };
    }
  }
}
