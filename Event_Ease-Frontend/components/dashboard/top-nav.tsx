"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Bell, ChevronRight, LogOut, Settings, CreditCard, FileText, Menu, UserCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ModeToggle } from "@/components/mode-toggle"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "@/components/ui/use-toast"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface TopNavProps {
  onMobileMenuToggle: () => void
}

export function TopNav({ onMobileMenuToggle }: TopNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, role, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    }
  }

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
      
      // Make labels more readable
      let label = path.charAt(0).toUpperCase() + path.slice(1);
      // Replace hyphens with spaces
      label = label.replace(/-/g, ' ');
      
      breadcrumbs.push({
        label,
        href: index === 0 ? `/${path}` : `${breadcrumbs[breadcrumbs.length - 1].href}/${path}`,
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <nav className="px-3 sm:px-6 flex items-center justify-between bg-background h-full">
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
              <AvatarImage src={user?.avatar || "/placeholder.svg?height=32&width=32"} alt={user?.name || "User"} />
              <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className="w-[280px] sm:w-80 p-4">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar || "/placeholder.svg?height=40&width=40"} alt={user?.name || "User"} />
                <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground">{user?.email || "user@example.com"}</p>
                <p className="text-xs mt-1 text-primary capitalize">{role || "User"}</p>
              </div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="flex cursor-pointer items-center gap-2 p-2 rounded-md">
                <Settings className="h-4 w-4" />
                <span>Account Settings</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/${role}/profile`} className="flex cursor-pointer items-center gap-2 p-2 rounded-md">
                <UserCircle className="h-4 w-4" />
                <span>My Profile</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/terms" className="flex cursor-pointer items-center gap-2 p-2 rounded-md">
                <FileText className="h-4 w-4" />
                <span>Terms & Policies</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            
            <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
              <div className="flex items-center gap-2 p-2 rounded-md text-destructive">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
