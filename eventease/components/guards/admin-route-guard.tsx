"use client"

import type React from "react"
import ProtectedRoute from "@/components/protected-route"

interface AdminRouteGuardProps {
  children: React.ReactNode
}

/**
 * Route guard specifically for admin routes
 * Redirects to login if not authenticated or to unauthorized if not an admin
 */
export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  return (
    <ProtectedRoute allowedRoles={["admin"]} redirectTo="/login">
      {children}
    </ProtectedRoute>
  )
}
