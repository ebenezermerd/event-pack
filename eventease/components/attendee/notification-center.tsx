"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

// Mock data - would be replaced with real API calls
const mockNotifications = [
  {
    id: 1,
    title: "Ticket Confirmed",
    message: "Your ticket for Addis Tech Summit 2024 has been confirmed.",
    date: new Date(2024, 3, 20, 14, 30), // April 20, 2024, 2:30 PM
    read: false,
    type: "ticket",
  },
  {
    id: 2,
    title: "Event Reminder",
    message: "Ethiopian Coffee Festival is coming up in 2 days. Don't forget to attend!",
    date: new Date(2024, 3, 19, 10, 15), // April 19, 2024, 10:15 AM
    read: false,
    type: "reminder",
  },
  {
    id: 3,
    title: "New Event Recommendation",
    message: "Based on your interests, we think you might enjoy the Cultural Heritage Exhibition.",
    date: new Date(2024, 3, 18, 9, 45), // April 18, 2024, 9:45 AM
    read: true,
    type: "recommendation",
  },
  {
    id: 4,
    title: "Price Drop Alert",
    message: "Tickets for Business Innovation Summit are now 15% off.",
    date: new Date(2024, 3, 17, 16, 20), // April 17, 2024, 4:20 PM
    read: true,
    type: "price",
  },
  {
    id: 5,
    title: "Event Cancelled",
    message: "Unfortunately, the Fashion Show event has been cancelled. Your refund has been processed.",
    date: new Date(2024, 3, 15, 11, 10), // April 15, 2024, 11:10 AM
    read: true,
    type: "cancellation",
  },
]

export function NotificationCenter() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [open, setOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ticket":
        return "🎟️"
      case "reminder":
        return "⏰"
      case "recommendation":
        return "🔍"
      case "price":
        return "💰"
      case "cancellation":
        return "❌"
      default:
        return "📣"
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        <Separator />
        {notifications.length > 0 ? (
          <>
            <ScrollArea className="h-[300px]">
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors",
                      !notification.read && "bg-muted/30",
                    )}
                    onClick={() => {
                      markAsRead(notification.id)
                      setOpen(false)
                    }}
                  >
                    <div className="text-xl">{getNotificationIcon(notification.type)}</div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-start justify-between">
                        <p className={cn("text-sm font-medium", !notification.read && "font-semibold")}>
                          {notification.title}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(notification.date, { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator />
            <div className="p-2">
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <a href="/notifications">View all notifications</a>
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Bell className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
