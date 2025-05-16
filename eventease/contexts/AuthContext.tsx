"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { apiClient, handleApiError } from "@/lib/api-client"

// Define the user types
export type UserRole = "admin" | "organizer" | "attendee" | null
export type OrganizerStatus = "pending" | "approved" | "rejected" | null

// Define user interface
export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
  role: UserRole
  createdAt?: string
  updatedAt?: string
}

// Define organizer interface
export interface Organizer {
  id: number
  name: string
  email: string
  phone?: string
  address?: string
  description?: string
  logo?: string
  status: OrganizerStatus
  verified: boolean
  createdAt?: string
  updatedAt?: string
}

// Define the context value type
interface AuthContextType {
  user: User | null
  organizer: Organizer | null
  token: string | null
  role: UserRole
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  login: (email: string, password: string, role: UserRole) => Promise<void>
  register: (userData: any, role: UserRole) => Promise<boolean>
  logout: () => void
  updateProfile: (userData: Partial<User | Organizer>) => Promise<boolean>
  checkIsAuthenticated: () => boolean
  clearError: () => void
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  organizer: null,
  token: null,
  role: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  login: async () => {},
  register: async () => false,
  logout: () => {},
  updateProfile: async () => false,
  checkIsAuthenticated: () => false,
  clearError: () => {},
})

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext)

// Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()

  // State
  const [user, setUser] = useState<User | null>(null)
  const [organizer, setOrganizer] = useState<Organizer | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [role, setRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  // Clear error function
  const clearError = () => setError(null)

  // Check if user is authenticated on mount
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true)

      try {
        // Check for token in localStorage
        const storedToken = localStorage.getItem("token")
        const storedRole = localStorage.getItem("userRole") as UserRole

        if (!storedToken || !storedRole) {
          setIsAuthenticated(false)
          setLoading(false)
          return
        }

        // Call API to validate token and get user data
        let endpoint = ""

        if (storedRole === "organizer") {
          endpoint = `/api/organizer/profile`
        } else if (storedRole === "attendee") {
          endpoint = `/api/user/me`
        } else if (storedRole === "admin") {
          endpoint = `/api/admin/me`
        } else {
          throw new Error("Invalid user role")
        }

        const data = await apiClient.get(endpoint)

        if (storedRole === "organizer") {
          setOrganizer(data.organizer)
          setUser(null)
        } else {
          setUser(data.user)
          setOrganizer(null)
        }

        setToken(storedToken)
        setRole(storedRole)
        setIsAuthenticated(true)
      } catch (err) {
        console.error("Auth initialization error:", err)

        // Clear stored data on error
        localStorage.removeItem("token")
        localStorage.removeItem("userRole")

        setError(handleApiError(err))
        setIsAuthenticated(false)
        setUser(null)
        setOrganizer(null)
        setToken(null)
        setRole(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  // Update the login function to handle role-specific responses
  const login = async (email: string, password: string, userRole: UserRole) => {
    setLoading(true)
    setError(null)

    try {
      // Use a single endpoint but pass the role
      const endpoint = `/api/auth/login`

      const data = await apiClient.post(endpoint, {
        email,
        password,
        role: userRole,
      })

      // Save token and role
      localStorage.setItem("token", data.token)
      localStorage.setItem("userRole", userRole || "")

      // Set state based on role
      if (userRole === "organizer") {
        setOrganizer(
          data.organizer || {
            id: data.user?.id,
            name: data.user?.name || email.split("@")[0],
            email: email,
            status: data.organizer?.status || "pending",
            verified: data.organizer?.verified || false,
          },
        )
        setUser(data.user || null)
      } else {
        setUser(
          data.user || {
            id: data.user?.id,
            firstName: data.user?.name?.split(" ")[0] || email.split("@")[0],
            lastName: data.user?.name?.split(" ").slice(1).join(" ") || "",
            email: email,
            role: userRole,
          },
        )
        setOrganizer(null)
      }

      setToken(data.token)
      setRole(userRole)
      setIsAuthenticated(true)

      // Show success message
      toast({
        title: "Success",
        description: "Logged in successfully",
      })

      // Redirect based on user role and status
      if (userRole === "organizer") {
        const organizerStatus = data.organizer?.status
        const redirectPath = organizerStatus === "approved" ? "/dashboard/organizer" : "/dashboard/organizer/pending"
        router.push(redirectPath)
      } else if (userRole === "admin") {
        router.push("/dashboard/admin")
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError(handleApiError(err))
      setIsAuthenticated(false)

      // Show error message
      toast({
        title: "Login Failed",
        description: handleApiError(err),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Update the register function to handle role-specific registrations
  const register = async (userData: any, userRole: UserRole): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      // Use a single endpoint but handle different data structures
      const endpoint = `/api/auth/register`

      // If userData is FormData, append the role
      if (userData instanceof FormData) {
        userData.append("role", userRole || "attendee")
      } else {
        // Otherwise add it to the object
        userData.role = userRole || "attendee"
      }

      // Send registration request
      await apiClient.post(endpoint, userData, {
        // Don't set Content-Type for FormData
        headers: userData instanceof FormData ? {} : undefined,
      })

      // Show success message
      toast({
        title: "Registration Successful",
        description:
          userRole === "organizer"
            ? "Your registration is pending approval. You can now login."
            : "Registration successful. You can now login.",
      })

      return true
    } catch (err) {
      console.error("Registration error:", err)
      setError(handleApiError(err))

      // Show error message
      toast({
        title: "Registration Failed",
        description: handleApiError(err),
        variant: "destructive",
      })

      return false
    } finally {
      setLoading(false)
    }
  }

  // Update profile function
  const updateProfile = async (userData: Partial<User | Organizer>): Promise<boolean> => {
    if (!isAuthenticated || !token) {
      setError("You must be logged in to update your profile")
      return false
    }

    setLoading(true)
    setError(null)

    try {
      let endpoint = ""

      if (role === "organizer") {
        endpoint = `/api/organizer/profile`
      } else if (role === "attendee") {
        endpoint = `/api/user/profile`
      } else if (role === "admin") {
        endpoint = `/api/admin/profile`
      } else {
        throw new Error("Invalid user role")
      }

      // Send update request
      const data = await apiClient.put(endpoint, userData, {
        // Don't set Content-Type for FormData
        headers: userData instanceof FormData ? {} : undefined,
      })

      // Update local state
      if (role === "organizer") {
        setOrganizer((prev) => ({ ...prev!, ...data.organizer }))
      } else {
        setUser((prev) => ({ ...prev!, ...data.user }))
      }

      // Show success message
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      })

      return true
    } catch (err) {
      console.error("Profile update error:", err)
      setError(handleApiError(err))

      // Show error message
      toast({
        title: "Update Failed",
        description: handleApiError(err),
        variant: "destructive",
      })

      return false
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    // Clear state
    setUser(null)
    setOrganizer(null)
    setToken(null)
    setRole(null)
    setIsAuthenticated(false)

    // Clear storage
    localStorage.removeItem("token")
    localStorage.removeItem("userRole")

    // Show success message
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    })

    // Redirect to login
    router.push("/login")
  }

  // Check if user is authenticated
  const checkIsAuthenticated = () => {
    return isAuthenticated
  }

  // Context value
  const value = {
    user,
    organizer,
    token,
    role,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    checkIsAuthenticated,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
