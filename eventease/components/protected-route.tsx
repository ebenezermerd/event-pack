"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
  redirectTo?: string
  requireAuth?: boolean
}

/**
 * Protected route component that restricts access based on authentication and user roles
 */
export default function ProtectedRoute({
  children,
  allowedRoles = [],
  redirectTo = "/login",
  requireAuth = true,
}: ProtectedRouteProps) {
  const { isAuthenticated, role, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    // Skip authorization check if not required
    if (!requireAuth) {
      setIsAuthorized(true)
      return
    }

    // Wait until authentication check is complete
    if (loading) return

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page",
        variant: "destructive",
      })
      router.push(`${redirectTo}?returnUrl=${encodeURIComponent(pathname)}`)
      setIsAuthorized(false)
      return
    }

    // If authenticated but role is not allowed, redirect to unauthorized
    if (allowedRoles.length > 0 && !allowedRoles.includes(role || "")) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      })
      router.push("/unauthorized")
      setIsAuthorized(false)
      return
    }

    // User is authorized
    setIsAuthorized(true)
  }, [isAuthenticated, role, loading, router, allowedRoles, redirectTo, pathname, requireAuth])

  // Show loading indicator while checking authentication
  if (loading || isAuthorized === null) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    )
  }

  // If not authorized, don't render anything (will redirect)
  if (!isAuthorized) {
    return null
  }

  // If authorized, render children
  return <>{children}</>
}
