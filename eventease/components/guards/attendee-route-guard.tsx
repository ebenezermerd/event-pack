"use client"

import type React from "react"
import ProtectedRoute from "@/components/protected-route"

interface AttendeeRouteGuardProps {
  children: React.ReactNode
}

/**
 * Route guard specifically for attendee routes
 * Redirects to login if not authenticated or to unauthorized if not an attendee
 */
export default function AttendeeRouteGuard({ children }: AttendeeRouteGuardProps) {
  return (
    <ProtectedRoute allowedRoles={["attendee"]} redirectTo="/login">
      {children}
    </ProtectedRoute>
  )
}
