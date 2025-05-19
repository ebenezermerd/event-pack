"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import ProtectedRoute from "@/components/protected-route"

export default function DashboardPage() {
  const router = useRouter()
  const { role, isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (loading) return

    if (isAuthenticated) {
      // Redirect based on user role
      switch (role) {
        case "admin":
          router.push("/dashboard/admin")
          break
        case "organizer":
          router.push("/dashboard/organizer")
          break
        case "attendee":
          router.push("/my-events") // Redirect attendees to their events page
          break
        default:
          // If role is not recognized, redirect to home
          router.push("/")
      }
    }
  }, [role, isAuthenticated, loading, router])

  return (
    <ProtectedRoute>
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Redirecting to your dashboard...</p>
        </div>
      </div>
    </ProtectedRoute>
  )
}
