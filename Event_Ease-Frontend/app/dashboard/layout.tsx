"use client"

import type React from "react"
import { usePathname, useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { TopNav } from "@/components/dashboard/top-nav"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Loader2 } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, role: userRole, loading: isLoading } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Handle initial page load and window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true)
      }
    }

    // Set initial state based on window size
    handleResize()

    // Add listener for window resize
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    // Close mobile menu when path changes
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Verify access rights
  useEffect(() => {
    if (!isLoading && isAuthenticated && userRole) {
      // Redirect to appropriate dashboard if accessing general /dashboard
      if (pathname === "/dashboard") {
        if (userRole === "admin") {
          router.replace("/dashboard/admin")
        } else if (userRole === "attendee") {
          router.replace("/dashboard/attendee")
        }
        // Organizers stay at /dashboard or go to /dashboard/organizer
      }
      
      // Prevent access to wrong role dashboard
      if (
        (pathname?.includes("/dashboard/admin") && userRole !== "admin") ||
        (pathname?.includes("/dashboard/organizer") && userRole !== "organizer") ||
        (pathname?.includes("/dashboard/attendee") && userRole !== "attendee")
      ) {
        // Redirect to the appropriate dashboard
        router.replace(`/dashboard/${userRole.toLowerCase()}`)
      }
    } else if (!isLoading && !isAuthenticated) {
      // Redirect to login if not authenticated
      router.replace("/auth/login?redirect=" + encodeURIComponent(pathname || "/dashboard"))
    }
  }, [isAuthenticated, isLoading, userRole, pathname, router])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // Show loading state while authentication is being verified
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Once authenticated, show the dashboard
  return (
    <div className="flex h-screen overflow-hidden bg-muted/10">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        mobileOpen={isMobileMenuOpen}
        onMobileOpenChange={setIsMobileMenuOpen}
      />
      <div
        className={`w-full flex flex-1 flex-col transition-all duration-300 ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"}`}
      >
        <header className="h-16 border-b bg-background">
          <TopNav onMobileMenuToggle={toggleMobileMenu} />
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-background">{children}</main>
      </div>
    </div>
  )
}
