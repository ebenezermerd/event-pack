"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Loader2 } from "lucide-react"

interface AuthRouteGuardProps {
  children: React.ReactNode
}

/**
 * Guard for authentication pages (login/register)
 * Redirects to appropriate dashboard if already authenticated
 */
export default function AuthRouteGuard({ children }: AuthRouteGuardProps) {
  const { isAuthenticated, role, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get("returnUrl")

  useEffect(() => {
    if (loading) return

    if (isAuthenticated) {
      // Redirect to appropriate dashboard based on role
      if (returnUrl) {
        router.push(returnUrl)
      } else {
        switch (role) {
          case "admin":
            router.push("/dashboard/admin")
            break
          case "organizer":
            router.push("/dashboard/organizer")
            break
          case "attendee":
            router.push("/dashboard")
            break
          default:
            router.push("/")
        }
      }
    }
  }, [isAuthenticated, role, loading, router, returnUrl])

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // If already authenticated, don't render anything (will redirect)
  if (isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, render children (login/register form)
  return <>{children}</>
}
