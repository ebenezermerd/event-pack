"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import {
  BarChart3,
  Calendar,
  CreditCard,
  HelpCircle,
  Home,
  Settings,
  Ticket,
  Users,
  Building,
  FileText,
  PieChart,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// This would come from authentication in a real app
type UserRole = "admin" | "organizer" | "attendee"

interface DashboardSidebarProps {
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  mobileOpen?: boolean
  onMobileOpenChange?: (open: boolean) => void
}

export function DashboardSidebar({
  collapsed: externalCollapsed,
  onCollapsedChange,
  mobileOpen,
  onMobileOpenChange,
}: DashboardSidebarProps) {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<UserRole>("organizer")
  const [internalCollapsed, setInternalCollapsed] = useState(false)

  // Use either controlled or uncontrolled state
  const collapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed
  const isMobileMenuOpen = mobileOpen !== undefined ? mobileOpen : false

  // For demo purposes, allow switching roles
  useEffect(() => {
    // Check if we're in the admin section
    if (pathname?.includes("/dashboard/admin")) {
      setUserRole("admin")
    } else if (pathname?.includes("/dashboard/organizer")) {
      setUserRole("organizer")
    }
  }, [pathname])

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href)
  }

  function handleNavigation() {
    if (onMobileOpenChange) {
      onMobileOpenChange(false)
    }
  }

  function toggleSidebar() {
    if (onCollapsedChange) {
      onCollapsedChange(!collapsed)
    } else {
      setInternalCollapsed(!internalCollapsed)
    }
  }

  function NavItem({
    href,
    icon: Icon,
    children,
    active = false,
  }: {
    href: string
    icon: any
    children: React.ReactNode
    active?: boolean
  }) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={href}
              onClick={handleNavigation}
              className={cn(
                "flex items-center px-3 py-2 text-sm rounded-md transition-colors hover:bg-muted group",
                active ? "bg-muted font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
              <span className={cn("transition-opacity duration-200", collapsed ? "opacity-0 w-0" : "opacity-100")}>
                {children}
              </span>
            </Link>
          </TooltipTrigger>
          {collapsed && <TooltipContent side="right">{children}</TooltipContent>}
        </Tooltip>
      </TooltipProvider>
    )
  }

  function NavSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <div>
        {!collapsed && (
          <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
        )}
        <div className="space-y-1">{children}</div>
      </div>
    )
  }

  return (
    <>
      <nav
        className={cn(
          "fixed inset-y-0 left-0 z-[70] bg-background transform transition-all duration-300 ease-in-out border-r",
          collapsed ? "w-16" : "w-64",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="h-full flex flex-col">
          <div className={cn("h-16 px-4 flex items-center border-b justify-between")}>
            {!collapsed && (
              <div className="flex items-center gap-3 overflow-hidden">
                <Logo />
                <span className="text-lg font-semibold truncate">EventEase</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className={cn("ml-auto", collapsed && "mx-auto")}
              onClick={toggleSidebar}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-4">
            <div className="space-y-6">
              <NavSection title="Overview">
                <NavItem href="/dashboard" icon={Home} active={isActive("/dashboard")}>
                  Dashboard
                </NavItem>
              </NavSection>

              {/* Admin-specific menu items */}
              {userRole === "admin" && (
                <>
                  <NavSection title="Administration">
                    <NavItem href="/dashboard/admin/users" icon={Users} active={isActive("/dashboard/admin/users")}>
                      User Management
                    </NavItem>
                    <NavItem
                      href="/dashboard/admin/organizations"
                      icon={Building}
                      active={isActive("/dashboard/admin/organizations")}
                    >
                      Organizations
                    </NavItem>
                    <NavItem
                      href="/dashboard/admin/approvals"
                      icon={CheckCircle2}
                      active={isActive("/dashboard/admin/approvals")}
                    >
                      Event Approvals
                    </NavItem>
                  </NavSection>
                  <NavSection title="Reports">
                    <NavItem
                      href="/dashboard/admin/reports/financial"
                      icon={CreditCard}
                      active={isActive("/dashboard/admin/reports/financial")}
                    >
                      Financial Reports
                    </NavItem>
                    <NavItem
                      href="/dashboard/admin/reports/analytics"
                      icon={BarChart3}
                      active={isActive("/dashboard/admin/reports/analytics")}
                    >
                      Platform Analytics
                    </NavItem>
                  </NavSection>
                </>
              )}

              {/* Organizer-specific menu items */}
              {userRole === "organizer" && (
                <>
                  <NavSection title="Event Management">
                    <NavItem
                      href="/dashboard/organizer/events"
                      icon={Calendar}
                      active={isActive("/dashboard/organizer/events")}
                    >
                      My Events
                    </NavItem>
                    <NavItem
                      href="/dashboard/organizer/events/create"
                      icon={FileText}
                      active={isActive("/dashboard/organizer/events/create")}
                    >
                      Create Event
                    </NavItem>
                    <NavItem
                      href="/dashboard/organizer/orders"
                      icon={ShoppingCart}
                      active={isActive("/dashboard/organizer/orders")}
                    >
                      Orders
                    </NavItem>
                    <NavItem
                      href="/dashboard/organizer/attendees"
                      icon={Users}
                      active={isActive("/dashboard/organizer/attendees")}
                    >
                      Attendees
                    </NavItem>
                    <NavItem
                      href="/dashboard/organizer/tickets"
                      icon={Ticket}
                      active={isActive("/dashboard/organizer/tickets")}
                    >
                      Tickets
                    </NavItem>
                  </NavSection>
                  <NavSection title="Analytics">
                    <NavItem
                      href="/dashboard/organizer/analytics"
                      icon={PieChart}
                      active={isActive("/dashboard/organizer/analytics")}
                    >
                      Event Analytics
                    </NavItem>
                    <NavItem
                      href="/dashboard/organizer/finances"
                      icon={CreditCard}
                      active={isActive("/dashboard/organizer/finances")}
                    >
                      Financial Reports
                    </NavItem>
                  </NavSection>
                  <NavSection title="History">
                    <NavItem
                      href="/dashboard/organizer/past-events"
                      icon={Clock}
                      active={isActive("/dashboard/organizer/past-events")}
                    >
                      Past Events
                    </NavItem>
                  </NavSection>
                </>
              )}

              {/* Settings for all roles */}
              <NavSection title="Settings">
                <NavItem href="/dashboard/settings" icon={Settings} active={isActive("/dashboard/settings")}>
                  Account Settings
                </NavItem>
                <NavItem href="/dashboard/help" icon={HelpCircle} active={isActive("/dashboard/help")}>
                  Help & Support
                </NavItem>
              </NavSection>
            </div>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[65] lg:hidden"
          onClick={() => {
            if (onMobileOpenChange) {
              onMobileOpenChange(false)
            }
          }}
        />
      )}
    </>
  )
}
