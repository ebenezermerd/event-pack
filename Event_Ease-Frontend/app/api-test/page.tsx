"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function ApiTestPage() {
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
    data?: any
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAutoTesting, setIsAutoTesting] = useState(false)
  const [apiUrl, setApiUrl] = useState("http://localhost:3000")

  // Function to test the API connection
  const testApiConnection = async () => {
    setIsLoading(true)
    try {
      console.log(`Testing connection to: ${apiUrl}`)

      // Try to hit the backend root endpoint
      const response = await fetch(apiUrl)
      const text = await response.text()

      console.log("Backend response:", text)

      setTestResult({
        success: true,
        message: "Successfully connected to the backend!",
        data: { response: text },
      })
    } catch (error) {
      console.error("API connection test failed:", error)
      setTestResult({
        success: false,
        message: "Failed to connect to the backend",
        data: { error: String(error) },
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Function to test user registration
  const testUserRegistration = async () => {
    setIsLoading(true)
    try {
      // Generate a random email to avoid duplicate user errors
      const randomEmail = `test${Math.floor(Math.random() * 10000)}@example.com`
      const randomPhone = `123${Math.floor(Math.random() * 10000000)}`

      console.log(`Testing user registration with email: ${randomEmail} and phone: ${randomPhone}`)

      const userData = {
        firstName: "Test",
        lastName: "User",
        phone: randomPhone,
        email: randomEmail,
        password: "password123",
        address: "123 Test St",
      }

      console.log("Registration payload:", userData)

      const response = await apiClient.post("/api/user/register", userData)

      console.log("Registration response:", response)

      setTestResult({
        success: true,
        message: "Successfully registered a test user!",
        data: response,
      })
    } catch (error) {
      console.error("User registration test failed:", error)
      setTestResult({
        success: false,
        message: "Failed to register test user",
        data: { error: String(error) },
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Function to test CORS
  const testCors = async () => {
    setIsLoading(true)
    try {
      console.log(`Testing CORS with API URL: ${apiUrl}`)

      // Make a preflight request
      const response = await fetch(apiUrl, {
        method: "OPTIONS",
        headers: {
          Origin: window.location.origin,
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "Content-Type, Authorization",
        },
      })

      const headers = {}
      response.headers.forEach((value, key) => {
        headers[key] = value
      })

      console.log("CORS preflight response headers:", headers)

      setTestResult({
        success: response.ok,
        message: response.ok ? "CORS is properly configured!" : "CORS test failed",
        data: {
          status: response.status,
          statusText: response.statusText,
          headers: headers,
        },
      })
    } catch (error) {
      console.error("CORS test failed:", error)
      setTestResult({
        success: false,
        message: "CORS test failed with an error",
        data: { error: String(error) },
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-run tests when the page loads if isAutoTesting is true
  useEffect(() => {
    if (isAutoTesting) {
      testApiConnection()
    }

    // Log environment information
    console.log("Frontend environment:", {
      apiUrl: apiClient,
      nodeEnv: process.env.NODE_ENV,
      nextPublicApiUrl: process.env.NEXT_PUBLIC_API_URL,
    })
  }, [isAutoTesting])

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>API Connection Test</CardTitle>
          <CardDescription>Test the connection between the frontend and backend</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="apiUrl" className="text-sm font-medium">
              API URL:
            </label>
            <input
              id="apiUrl"
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
            />
          </div>

          {testResult && (
            <Alert variant={testResult.success ? "default" : "destructive"}>
              <div className="flex items-center gap-2">
                {testResult.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <AlertTitle>{testResult.success ? "Success" : "Error"}</AlertTitle>
              </div>
              <AlertDescription className="mt-2">
                {testResult.message}
                {testResult.data && (
                  <pre className="mt-2 bg-slate-100 p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(testResult.data, null, 2)}
                  </pre>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button onClick={testApiConnection} disabled={isLoading} className="flex items-center gap-2">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Test Backend Connection
          </Button>
          <Button
            onClick={testUserRegistration}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Test User Registration
          </Button>
          <Button onClick={testCors} disabled={isLoading} variant="secondary" className="flex items-center gap-2">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Test CORS
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-8 max-w-2xl mx-auto">
        <h2 className="text-lg font-semibold mb-2">Connection Status</h2>
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Frontend</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Running on:{" "}
                <span className="font-mono">{typeof window !== "undefined" ? window.location.origin : "Server"}</span>
              </p>
              <p className="text-sm">
                API URL: <span className="font-mono">{process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}</span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Backend</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Expected at: <span className="font-mono">{apiUrl}</span>
              </p>
              <p className="text-sm">
                Status:{" "}
                <span className={`font-mono ${testResult?.success ? "text-green-500" : "text-red-500"}`}>
                  {testResult ? (testResult.success ? "Connected" : "Failed") : "Unknown"}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
