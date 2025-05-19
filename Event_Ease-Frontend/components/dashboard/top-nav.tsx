"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, ChevronRight, LogOut, Settings, CreditCard, FileText, Menu } from "lucide-react"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface TopNavProps {
  onMobileMenuToggle: () => void
}

export function TopNav({ onMobileMenuToggle }: TopNavProps) {
  const pathname = usePathname()

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (!pathname) return [{ label: "Dashboard", href: "/dashboard" }]

    const paths = pathname.split("/").filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [{ label: "Dashboard", href: "/dashboard" }]

    let currentPath = ""
    paths.forEach((path, index) => {
      // Skip the first "dashboard" path since we already added it
      if (index === 0 && path === "dashboard") return

      currentPath += `/${path}`
      breadcrumbs.push({
        label: path.charAt(0).toUpperCase() + path.slice(1),
        href: index === 0 ? `/${path}` : `${breadcrumbs[breadcrumbs.length - 1].href}/${path}`,
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <nav className="px-3 sm:px-6 flex items-center justify-between bg-background border-b h-full">
      <div className="font-medium text-sm flex items-center space-x-1 truncate max-w-[300px]">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden mr-2"
          onClick={onMobileMenuToggle}
          aria-label="Toggle mobile menu"
        >
          <Menu className="h-5 w-5 text-muted-foreground" />
        </Button>

        {breadcrumbs.map((item, index) => (
          <div key={item.label} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />}
            {index < breadcrumbs.length - 1 ? (
              <Link href={item.href || "#"} className="text-muted-foreground hover:text-foreground transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 sm:gap-4 ml-auto">
        <button
          type="button"
          className="p-1.5 sm:p-2 hover:bg-muted rounded-full transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
        </button>

        <ModeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Avatar className="h-7 w-7 sm:h-8 sm:w-8 cursor-pointer">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className="w-[280px] sm:w-80 p-0">
            <div className="p-4">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">User Name</p>
                  <p className="text-xs text-muted-foreground">user@example.com</p>
                </div>
              </div>

              <div className="space-y-1">
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-muted text-sm"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
                <Link
                  href="/dashboard/billing"
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-muted text-sm"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Billing</span>
                </Link>
                <Link href="/terms" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted text-sm">
                  <FileText className="h-4 w-4" />
                  <span>Terms & Policies</span>
                </Link>
                <Link href="/logout" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted text-sm">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Link>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
