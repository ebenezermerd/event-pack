"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAuth } from "./AuthContext"
import { LocationService, type Location } from "@/lib/services/location-service"
import { toast } from "@/components/ui/use-toast"
import { handleApiError } from "@/lib/api-client"

interface PopularCity {
  city: string
  country: string
  eventCount: number
}

interface LocationContextType {
  // Location data
  locations: Location[]
  popularCities: PopularCity[]
  currentLocation: Location | null

  // Location actions
  fetchLocations: () => Promise<void>
  fetchLocationById: (id: number) => Promise<Location | null>
  fetchLocationsByCity: (city: string) => Promise<Location[]>
  fetchPopularCities: () => Promise<void>
  createLocation: (locationData: Partial<Location>) => Promise<boolean>
  updateLocation: (id: number, locationData: Partial<Location>) => Promise<boolean>
  deleteLocation: (id: number) => Promise<boolean>

  // Location state
  isLoading: boolean
  error: string | null
}

// Create context with default values
const LocationContext = createContext<LocationContextType>({
  locations: [],
  popularCities: [],
  currentLocation: null,

  fetchLocations: async () => {},
  fetchLocationById: async () => null,
  fetchLocationsByCity: async () => [],
  fetchPopularCities: async () => {},
  createLocation: async () => false,
  updateLocation: async () => false,
  deleteLocation: async () => false,

  isLoading: false,
  error: null,
})

// Hook to use the location context
export const useLocations = () => useContext(LocationContext)

// Provider component
export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const { role, isAuthenticated } = useAuth()

  // State for locations
  const [locations, setLocations] = useState<Location[]>([])
  const [popularCities, setPopularCities] = useState<PopularCity[]>([])
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)

  // State for loading and errors
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all locations
  const fetchLocations = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await LocationService.getLocations()
      setLocations(data.locations)
    } catch (err) {
      console.error("Error fetching locations:", err)
      setError(handleApiError(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch popular cities
  const fetchPopularCities = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await LocationService.getPopularCities()
      setPopularCities(data.cities)
    } catch (err) {
      console.error("Error fetching popular cities:", err)
      setError(handleApiError(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch a single location by ID
  const fetchLocationById = useCallback(async (id: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await LocationService.getLocationById(id)
      setCurrentLocation(data.location)
      return data.location
    } catch (err) {
      console.error("Error fetching location:", err)
      setError(handleApiError(err))
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch locations by city
  const fetchLocationsByCity = useCallback(async (city: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await LocationService.getLocationsByCity(city)
      return data.locations
    } catch (err) {
      console.error("Error fetching locations by city:", err)
      setError(handleApiError(err))
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create a new location
  const createLocation = useCallback(
    async (locationData: Partial<Location>) => {
      if (!isAuthenticated || (role !== "organizer" && role !== "admin")) {
        setError("You must be logged in as an organizer or admin to create locations")
        return false
      }

      setIsLoading(true)
      setError(null)

      try {
        const data = await LocationService.createLocation(locationData)

        // Show success message
        toast({
          title: "Location Created",
          description: data.message || "Location has been created successfully",
        })

        // Refresh locations
        fetchLocations()
        return true
      } catch (err) {
        console.error("Error creating location:", err)
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
    [isAuthenticated, role, fetchLocations],
  )

  // Update an existing location
  const updateLocation = useCallback(
    async (id: number, locationData: Partial<Location>) => {
      if (!isAuthenticated) {
        setError("You must be logged in to update locations")
        return false
      }

      setIsLoading(true)
      setError(null)

      try {
        const data = await LocationService.updateLocation(id, locationData)

        // Show success message
        toast({
          title: "Location Updated",
          description: data.message || "Location has been updated successfully",
        })

        // Refresh locations and current location
        fetchLocations()
        if (currentLocation?.id === id) {
          setCurrentLocation(data.location)
        }

        return true
      } catch (err) {
        console.error("Error updating location:", err)
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
    [isAuthenticated, currentLocation, fetchLocations],
  )

  // Delete a location (admin only)
  const deleteLocation = useCallback(
    async (id: number) => {
      if (!isAuthenticated || role !== "admin") {
        setError("You must be logged in as an admin to delete locations")
        return false
      }

      setIsLoading(true)
      setError(null)

      try {
        const data = await LocationService.deleteLocation(id)

        // Show success message
        toast({
          title: "Location Deleted",
          description: data.message || "Location has been deleted successfully",
        })

        // Remove from locations
        setLocations((prev) => prev.filter((location) => location.id !== id))

        // If this is the current location, clear it
        if (currentLocation?.id === id) {
          setCurrentLocation(null)
        }

        return true
      } catch (err) {
        console.error("Error deleting location:", err)
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
    [isAuthenticated, role, currentLocation],
  )

  // Initial data loading
  useEffect(() => {
    fetchLocations()
    fetchPopularCities()
  }, [fetchLocations, fetchPopularCities])

  const value = {
    locations,
    popularCities,
    currentLocation,

    fetchLocations,
    fetchLocationById,
    fetchLocationsByCity,
    fetchPopularCities,
    createLocation,
    updateLocation,
    deleteLocation,

    isLoading,
    error,
  }

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
}

export default LocationContext
