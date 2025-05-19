"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Download, MoreHorizontal, Check, X, Eye, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface Order {
  id: string
  orderNumber: string
  customer: {
    name: string
    email: string
    avatar?: string
  }
  event: {
    id: string
    name: string
    date: string
  }
  orderDate: string
  amount: number
  status: "completed" | "pending" | "cancelled" | "refunded"
  paymentMethod: string
  tickets: Array<{
    type: string
    quantity: number
    price: number
  }>
}

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isRefunding, setIsRefunding] = useState(false)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [selectedDates, setSelectedDates] = useState<string>("all")
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/organizer/orders")
        if (!response.ok) {
          throw new Error("Failed to fetch orders")
        }
        const data = await response.json()
        setOrders(data.orders)
      } catch (err) {
        console.error("Error fetching orders:", err)
        setError("Failed to load orders. Please try again later.")
        toast({
          title: "Error",
          description: "Failed to load orders. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [toast])

  const handleMarkAsPaid = async (orderId: string) => {
    try {
      const response = await fetch(`/api/organizer/orders/${orderId}/mark-paid`, {
        method: "PUT",
      })

      if (!response.ok) {
        throw new Error("Failed to update order status")
      }

      // Update local state
      setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: "completed" } : order)))

      toast({
        title: "Success",
        description: "Order has been marked as paid",
        variant: "default",
      })
    } catch (err) {
      console.error("Error updating order:", err)
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      })
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/organizer/orders/${orderId}/cancel`, {
        method: "PUT",
      })

      if (!response.ok) {
        throw new Error("Failed to cancel order")
      }

      // Update local state
      setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: "cancelled" } : order)))

      toast({
        title: "Success",
        description: "Order has been cancelled",
        variant: "default",
      })
    } catch (err) {
      console.error("Error cancelling order:", err)
      toast({
        title: "Error",
        description: "Failed to cancel order",
        variant: "destructive",
      })
    }
  }

  const handleProcessRefund = async () => {
    if (!selectedOrder) return

    try {
      const response = await fetch(`/api/organizer/orders/${selectedOrder.id}/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: document.querySelector<HTMLSelectElement>("#refundReason")?.value,
          sendNotification: document.querySelector<HTMLInputElement>("#sendNotification")?.checked,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to process refund")
      }

      // Update local state
      setOrders(orders.map((order) => (order.id === selectedOrder.id ? { ...order, status: "refunded" } : order)))

      toast({
        title: "Success",
        description: "Refund has been processed successfully",
        variant: "default",
      })

      setIsRefunding(false)
      setSelectedOrder(null)
    } catch (err) {
      console.error("Error processing refund:", err)
      toast({
        title: "Error",
        description: "Failed to process refund",
        variant: "destructive",
      })
    }
  }

  const handleExportOrders = async () => {
    try {
      const format = document.querySelector<HTMLSelectElement>("#exportFormat")?.value
      const dateRange = document.querySelector<HTMLSelectElement>("#dateRange")?.value

      const response = await fetch("/api/organizer/orders/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          format,
          dateRange,
          orderIds: selectedRows.length > 0 ? selectedRows : undefined,
          includeFields: {
            id: document.querySelector<HTMLInputElement>("#include-id")?.checked,
            customer: document.querySelector<HTMLInputElement>("#include-customer")?.checked,
            event: document.querySelector<HTMLInputElement>("#include-event")?.checked,
            tickets: document.querySelector<HTMLInputElement>("#include-tickets")?.checked,
            payment: document.querySelector<HTMLInputElement>("#include-payment")?.checked,
            status: document.querySelector<HTMLInputElement>("#include-status")?.checked,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to export orders")
      }

      // Handle file download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `orders-export-${new Date().toISOString().split("T")[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)

      setExportModalOpen(false)
      toast({
        title: "Success",
        description: "Orders exported successfully",
        variant: "default",
      })
    } catch (err) {
      console.error("Error exporting orders:", err)
      toast({
        title: "Error",
        description: "Failed to export orders",
        variant: "destructive",
      })
    }
  }

  const toggleSelectRow = (id: string) => {
    setSelectedRows((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id)
      } else {
        return [...current, id]
      }
    })
  }

  const selectAllRows = (checked: boolean) => {
    if (checked) {
      setSelectedRows(filteredOrders.map((order) => order.id))
    } else {
      setSelectedRows([])
    }
  }

  // Filter orders based on search, status, and date
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.event.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || order.status === filterStatus

    // Basic date filtering
    let matchesDate = true
    const orderDate = new Date(order.orderDate)
    const now = new Date()

    if (selectedDates === "today") {
      const today = new Date()
      matchesDate = orderDate.toDateString() === today.toDateString()
    } else if (selectedDates === "yesterday") {
      const yesterday = new Date(now)
      yesterday.setDate(now.getDate() - 1)
      matchesDate = orderDate.toDateString() === yesterday.toDateString()
    } else if (selectedDates === "thisWeek") {
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      matchesDate = orderDate >= startOfWeek
    } else if (selectedDates === "thisMonth") {
      matchesDate = orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()
    }

    return matchesSearch && matchesStatus && matchesDate
  })

  // Calculate totals
  const totalSelected = selectedRows.length
  const totalAmount = filteredOrders
    .filter((order) => selectedRows.includes(order.id))
    .reduce((sum, order) => sum + order.amount, 0)

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground">Manage your event orders and payments</p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-10" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order List</CardTitle>
            <CardDescription>View and manage all customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Skeleton className="h-4 w-4" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-24" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-24" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                    <TableHead className="text-right">
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-4" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-16" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-8 w-16 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground">Manage your event orders and payments</p>
          </div>
        </div>

        <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Error Loading Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 dark:text-red-400">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage your event orders and payments</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => setExportModalOpen(true)}>
          <Download className="h-4 w-4" />
          Export Orders
        </Button>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedDates} onValueChange={setSelectedDates}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Order management interface */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="recent">Recent Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending Payment</TabsTrigger>
          <TabsTrigger value="refunds">Refunds</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Order List</CardTitle>
                  <CardDescription>View and manage all customer orders</CardDescription>
                </div>
                {selectedRows.length > 0 && (
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <span className="font-medium">{totalSelected}</span> selected ({totalAmount.toLocaleString()} ETB)
                    </div>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Download className="h-3.5 w-3.5" />
                      Export Selected
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">
                        <Checkbox
                          onCheckedChange={(checked) => selectAllRows(checked as boolean)}
                          checked={selectedRows.length === filteredOrders.length && filteredOrders.length > 0}
                        />
                      </TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                          No orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedRows.includes(order.id)}
                              onCheckedChange={() => toggleSelectRow(order.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.orderNumber}</p>
                              <p className="text-xs text-muted-foreground">{order.paymentMethod}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarImage
                                  src={order.customer.avatar || "/placeholder.svg?height=28&width=28"}
                                  alt={order.customer.name}
                                />
                                <AvatarFallback>{order.customer.name.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{order.customer.name}</p>
                                <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{order.event.name}</p>
                              <p className="text-xs text-muted-foreground">{order.event.date}</p>
                            </div>
                          </TableCell>
                          <TableCell>{order.orderDate}</TableCell>
                          <TableCell>{order.amount.toLocaleString()} ETB</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                order.status === "completed"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : order.status === "cancelled"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                    : order.status === "refunded"
                                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              }
                            >
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setIsRefunding(false)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View details</span>
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedOrder(order)
                                      setIsRefunding(false)
                                    }}
                                  >
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>Send Receipt</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {order.status === "completed" && (
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => {
                                        setSelectedOrder(order)
                                        setIsRefunding(true)
                                      }}
                                    >
                                      Process Refund
                                    </DropdownMenuItem>
                                  )}
                                  {order.status === "pending" && (
                                    <>
                                      <DropdownMenuItem
                                        className="text-green-600"
                                        onClick={() => handleMarkAsPaid(order.id)}
                                      >
                                        Mark as Paid
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={() => handleCancelOrder(order.id)}
                                      >
                                        Cancel Order
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Orders from the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.filter(
                      (order) => new Date(order.orderDate) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    ).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                          No recent orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders
                        .filter((order) => new Date(order.orderDate) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
                        .map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{order.orderNumber}</p>
                                <p className="text-xs text-muted-foreground">{order.paymentMethod}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-7 w-7">
                                  <AvatarImage
                                    src={order.customer.avatar || "/placeholder.svg?height=28&width=28"}
                                    alt={order.customer.name}
                                  />
                                  <AvatarFallback>{order.customer.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">{order.customer.name}</p>
                                  <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{order.event.name}</p>
                                <p className="text-xs text-muted-foreground">{order.event.date}</p>
                              </div>
                            </TableCell>
                            <TableCell>{order.orderDate}</TableCell>
                            <TableCell>{order.amount.toLocaleString()} ETB</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  order.status === "completed"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                    : order.status === "cancelled"
                                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                      : order.status === "refunded"
                                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                }
                              >
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setIsRefunding(false)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View details</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payments</CardTitle>
              <CardDescription>Orders awaiting payment confirmation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.filter((order) => order.status === "pending").length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          No pending orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders
                        .filter((order) => order.status === "pending")
                        .map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{order.orderNumber}</p>
                                <p className="text-xs text-muted-foreground">{order.paymentMethod}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-7 w-7">
                                  <AvatarImage
                                    src={order.customer.avatar || "/placeholder.svg?height=28&width=28"}
                                    alt={order.customer.name}
                                  />
                                  <AvatarFallback>{order.customer.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">{order.customer.name}</p>
                                  <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{order.event.name}</p>
                                <p className="text-xs text-muted-foreground">{order.event.date}</p>
                              </div>
                            </TableCell>
                            <TableCell>{order.orderDate}</TableCell>
                            <TableCell>{order.amount.toLocaleString()} ETB</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 gap-1"
                                  onClick={() => {
                                    setSelectedOrder(order)
                                    setIsRefunding(false)
                                  }}
                                >
                                  <Eye className="h-3 w-3" />
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 gap-1"
                                  onClick={() => handleMarkAsPaid(order.id)}
                                >
                                  <Check className="h-3 w-3" />
                                  Mark Paid
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 gap-1 text-red-600"
                                  onClick={() => handleCancelOrder(order.id)}
                                >
                                  <X className="h-3 w-3" />
                                  Cancel
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refunds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Refunds</CardTitle>
              <CardDescription>Track refunded orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.filter((order) => order.status === "refunded").length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          No refunded orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders
                        .filter((order) => order.status === "refunded")
                        .map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{order.orderNumber}</p>
                                <p className="text-xs text-muted-foreground">{order.paymentMethod}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-7 w-7">
                                  <AvatarImage
                                    src={order.customer.avatar || "/placeholder.svg?height=28&width=28"}
                                    alt={order.customer.name}
                                  />
                                  <AvatarFallback>{order.customer.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">{order.customer.name}</p>
                                  <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{order.event.name}</p>
                                <p className="text-xs text-muted-foreground">{order.event.date}</p>
                              </div>
                            </TableCell>
                            <TableCell>{order.orderDate}</TableCell>
                            <TableCell>{order.amount.toLocaleString()} ETB</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setIsRefunding(false)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View details</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>{isRefunding ? "Process Refund" : "Order Details"}</DialogTitle>
              <DialogDescription>
                {isRefunding
                  ? "Review order information before processing refund"
                  : `Order ${selectedOrder.orderNumber} placed on ${selectedOrder.orderDate}`}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4 overflow-y-auto pr-2">
              {isRefunding && (
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-400">Refund Confirmation</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
                      You are about to process a refund for this order. This action cannot be undone and will refund the
                      full amount of {selectedOrder.amount.toLocaleString()} ETB to the customer.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{selectedOrder.orderNumber}</h3>
                  <p className="text-sm text-muted-foreground">Placed on {selectedOrder.orderDate}</p>
                </div>
                <Badge
                  className={
                    selectedOrder.status === "completed"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : selectedOrder.status === "cancelled"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        : selectedOrder.status === "refunded"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }
                >
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </Badge>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Customer Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar>
                        <AvatarImage
                          src={selectedOrder.customer.avatar || "/placeholder.svg?height=40&width=40"}
                          alt={selectedOrder.customer.name}
                        />
                        <AvatarFallback>{selectedOrder.customer.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedOrder.customer.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedOrder.customer.email}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Payment Method</Label>
                      <p className="text-sm">{selectedOrder.paymentMethod}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Event Information</h4>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Event Name</Label>
                      <p className="text-sm font-medium">{selectedOrder.event.name}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Event Date</Label>
                      <p className="text-sm">{selectedOrder.event.date}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-3">Order Items</h4>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ticket Type</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-center">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.tickets.map((ticket, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{ticket.type}</TableCell>
                          <TableCell className="text-center">{ticket.quantity}</TableCell>
                          <TableCell className="text-center">{ticket.price.toLocaleString()} ETB</TableCell>
                          <TableCell className="text-right">
                            {(ticket.quantity * ticket.price).toLocaleString()} ETB
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex flex-col items-end mt-4 space-y-1">
                  <div className="flex justify-between w-48">
                    <span className="text-sm text-muted-foreground">Subtotal:</span>
                    <span className="text-sm font-medium">{selectedOrder.amount.toLocaleString()} ETB</span>
                  </div>
                  <div className="flex justify-between w-48">
                    <span className="text-sm text-muted-foreground">Service Fee:</span>
                    <span className="text-sm font-medium">0.00 ETB</span>
                  </div>
                  <Separator className="w-48" />
                  <div className="flex justify-between w-48">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold">{selectedOrder.amount.toLocaleString()} ETB</span>
                  </div>
                </div>
              </div>

              {isRefunding && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Refund Details</h4>
                    <div className="grid gap-2">
                      <Label htmlFor="refundReason">Reason for Refund</Label>
                      <Select defaultValue="customerRequest" id="refundReason">
                        <SelectTrigger>
                          <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="customerRequest">Customer Request</SelectItem>
                          <SelectItem value="eventCancelled">Event Cancelled</SelectItem>
                          <SelectItem value="eventRescheduled">Event Rescheduled</SelectItem>
                          <SelectItem value="ticketIssue">Ticket Issue</SelectItem>
                          <SelectItem value="paymentError">Payment Error</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox id="sendNotification" defaultChecked />
                      <label
                        htmlFor="sendNotification"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Notify customer of refund status via email
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>

            <DialogFooter className="flex justify-between mt-4 pt-2 border-t">
              {isRefunding ? (
                <>
                  <Button variant="outline" onClick={() => setIsRefunding(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleProcessRefund}>
                    Process Refund
                  </Button>
                </>
              ) : (
                <>
                  <div>
                    {selectedOrder.status === "completed" && (
                      <Button variant="outline" className="mr-2" onClick={() => setIsRefunding(true)}>
                        Process Refund
                      </Button>
                    )}
                  </div>
                  <Button onClick={() => setSelectedOrder(null)}>Done</Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Export Orders Dialog */}
      <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Orders</DialogTitle>
            <DialogDescription>Choose the data format and options for exporting orders</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="exportFormat" className="text-right">
                Format
              </Label>
              <Select defaultValue="csv" id="exportFormat">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dateRange" className="text-right">
                Date Range
              </Label>
              <Select defaultValue="all" id="dateRange">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="thisWeek">This Week</SelectItem>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-medium">Include Fields</h4>
              <div className="grid grid-cols-2 gap-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-id" defaultChecked />
                  <label
                    htmlFor="include-id"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Order ID
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-customer" defaultChecked />
                  <label
                    htmlFor="include-customer"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Customer Details
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-event" defaultChecked />
                  <label
                    htmlFor="include-event"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Event Details
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-tickets" defaultChecked />
                  <label
                    htmlFor="include-tickets"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Ticket Details
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-payment" defaultChecked />
                  <label
                    htmlFor="include-payment"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Payment Info
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-status" defaultChecked />
                  <label
                    htmlFor="include-status"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Order Status
                  </label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleExportOrders}>
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
