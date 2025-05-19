"use client"

import type React from "react"
import ProtectedRoute from "@/components/protected-route"

interface OrganizerRouteGuardProps {
  children: React.ReactNode
}

/**
 * Route guard specifically for organizer routes
 * Redirects to login if not authenticated or to unauthorized if not an organizer
 */
export default function OrganizerRouteGuard({ children }: OrganizerRouteGuardProps) {
  return (
    <ProtectedRoute allowedRoles={["organizer"]} redirectTo="/login">
      {children}
    </ProtectedRoute>
  )
}
