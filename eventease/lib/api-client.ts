import { toast } from "@/components/ui/use-toast"

// Define the API URL using environment variable or fallback to localhost:3000
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

// Interface for API options
interface ApiOptions {
  headers?: Record<string, string>
  withAuth?: boolean
  withCredentials?: boolean
  [key: string]: any
}

// Interface for API error
export interface ApiError {
  status: number
  message: string
  data?: any
}

// API Client class
class ApiClient {
  /**
   * Make a GET request
   */
  async get<T = any>(url: string, options: ApiOptions = {}): Promise<T> {
    return this.request<T>("GET", url, null, options)
  }

  /**
   * Make a POST request
   */
  async post<T = any>(url: string, data: any = null, options: ApiOptions = {}): Promise<T> {
    return this.request<T>("POST", url, data, options)
  }

  /**
   * Make a PUT request
   */
  async put<T = any>(url: string, data: any = null, options: ApiOptions = {}): Promise<T> {
    return this.request<T>("PUT", url, data, options)
  }

  /**
   * Make a PATCH request
   */
  async patch<T = any>(url: string, data: any = null, options: ApiOptions = {}): Promise<T> {
    return this.request<T>("PATCH", url, data, options)
  }

  /**
   * Make a DELETE request
   */
  async delete<T = any>(url: string, options: ApiOptions = {}): Promise<T> {
    return this.request<T>("DELETE", url, null, options)
  }

  /**
   * Make a request to the API
   */
  async request<T = any>(method: string, url: string, data: any = null, options: ApiOptions = {}): Promise<T> {
    // Default options
    const { headers = {}, withAuth = true, withCredentials = true, ...restOptions } = options

    // Build request URL
    const requestUrl = url.startsWith("http") ? url : `${API_URL}${url}`

    // Build headers
    const requestHeaders: Record<string, string> = { ...headers }

    // If it's not a FormData object, set Content-Type to application/json
    if (!(data instanceof FormData) && data !== null) {
      requestHeaders["Content-Type"] = "application/json"
    }

    // Add Authorization header if withAuth is true
    if (withAuth) {
      const token = localStorage.getItem("token")
      if (token) {
        requestHeaders["Authorization"] = `Bearer ${token}`
      }
    }

    // Build request options
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      credentials: withCredentials ? "include" : "same-origin", // Include cookies in cross-origin requests when needed
      ...restOptions,
    }

    // Add body if it's not a GET request
    if (method !== "GET" && data !== null) {
      requestOptions.body = data instanceof FormData ? data : JSON.stringify(data)
    }

    try {
      // Make the request
      const response = await fetch(requestUrl, requestOptions)

      // Handle HTTP errors
      if (!response.ok) {
        let errorData: any = {}

        try {
          // Try to parse error response as JSON
          errorData = await response.json()
        } catch (e) {
          // If parsing fails, use status text
          errorData = { message: response.statusText }
        }

        // Handle authentication errors
        if (response.status === 401) {
          // Clear authentication data
          localStorage.removeItem("token")
          localStorage.removeItem("userRole")

          // Show toast message
          toast({
            title: "Session expired",
            description: "Please log in again",
            variant: "destructive",
          })

          // Redirect to login page
          window.location.href = "/login"
        }

        // Create error object
        const error: ApiError = {
          status: response.status,
          message: errorData.message || "An error occurred",
          data: errorData,
        }

        throw error
      }

      // For 204 No Content responses
      if (response.status === 204) {
        return {} as T
      }

      // Parse JSON response
      return await response.json()
    } catch (error) {
      // Log error
      console.error("API request failed:", error)

      // Rethrow error
      throw error
    }
  }
}

// Create and export API client instance
export const apiClient = new ApiClient()

// Helper function to handle API errors
export const handleApiError = (error: any): string => {
  if (error instanceof Error) {
    return error.message
  }
  return "An unknown error occurred"
}
