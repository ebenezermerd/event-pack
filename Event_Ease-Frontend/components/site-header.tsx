"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Logo } from "@/components/logo"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"

export function SiteHeader() {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith("/dashboard")
  const { isAuthenticated, role, logout } = useAuth()

  const navItems = [
    { href: "/events", label: "Browse Events" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ]

  // Add My Events link for authenticated attendees
  if (isAuthenticated && role === "attendee") {
    navItems.push({ href: "/my-events", label: "My Events" })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Logo />
          <nav className="ml-6 hidden md:flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-foreground",
                  pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
                    ? "text-foreground font-semibold"
                    : "text-foreground/60",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center">
            <ModeToggle />
            {!isAuthenticated && (
              <>
                <Link href="/login" className="ml-4">
                  <Button variant="ghost" className="text-sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" className="ml-2">
                  <Button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:opacity-90 text-sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
            {isAuthenticated && (role === "admin" || role === "organizer") && (
              <Link href={role === "admin" ? "/dashboard/admin" : "/dashboard/organizer"} className="ml-4">
                <Button variant="outline" className="text-sm">
                  Dashboard
                </Button>
              </Link>
            )}
            {isAuthenticated && (
              <Button variant="ghost" onClick={logout} className="ml-4 text-sm">
                Sign Out
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}