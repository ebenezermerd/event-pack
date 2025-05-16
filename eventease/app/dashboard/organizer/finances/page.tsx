"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Download, Filter, Search, BarChart3, PieChart, TrendingUp, DollarSign } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { OrganizerRouteGuard } from "@/components/guards/organizer-route-guard"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"

// Add interfaces for financial data
interface FinancialStats {
  totalRevenue: number
  pendingRevenue: number
  refundedAmount: number
}

interface Transaction {
  id: string
  eventId: string
  event: string
  date: string
  amount: string
  attendee: string
  paymentMethod: string
  status: "completed" | "pending" | "failed" | "refunded"
}

interface EventRevenue {
  id: string
  name: string
  date: string
  ticketsSold: number
  grossRevenue: number
  platformFee: number
  netRevenue: number
}

// Update the component to include data fetching
export default function OrganizerFinancesPage() {
  const [date, setDate] = useState<Date>()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedEvent, setSelectedEvent] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<FinancialStats>({
    totalRevenue: 0,
    pendingRevenue: 0,
    refundedAmount: 0,
  })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [revenueByEvent, setRevenueByEvent] = useState<EventRevenue[]>([])
  const [events, setEvents] = useState<{ id: string; name: string }[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await apiClient.get("/organizer/events")
        if (response.data.success) {
          setEvents([
            { id: "all", name: "All Events" },
            ...response.data.events.map((event) => ({
              id: event.id,
              name: event.title,
            })),
          ])
        }
      } catch (error) {
        console.error("Error fetching events:", error)
        toast({
          title: "Error",
          description: "Failed to load events",
          variant: "destructive",
        })
      }
    }

    fetchEvents()
  }, [toast])

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setIsLoading(true)

        // Build query params
        const params = new URLSearchParams()
        if (date) params.append("date", date.toISOString())
        if (selectedEvent !== "all") params.append("eventId", selectedEvent)
        if (filterStatus !== "all") params.append("status", filterStatus)
        if (searchTerm) params.append("search", searchTerm)

        const response = await apiClient.get(`/organizer/finances?${params.toString()}`)

        if (response.data.success) {
          setStats(response.data.stats)
          setTransactions(response.data.transactions)
          setRevenueByEvent(response.data.revenueByEvent)
        } else {
          toast({
            title: "Error",
            description: "Failed to load financial data",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching financial data:", error)
        toast({
          title: "Error",
          description: "Failed to load financial data. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchFinancialData()
  }, [date, searchTerm, filterStatus, selectedEvent, toast])

  // Filter transactions based on selected event, search term and status
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesEvent = selectedEvent === "all" || transaction.eventId === selectedEvent
    const matchesSearch =
      transaction.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.attendee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase())

    if (filterStatus === "all") return matchesEvent && matchesSearch
    return matchesEvent && matchesSearch && transaction.status === filterStatus
  })

  // Filter revenue data based on selected event
  const filteredRevenueData =
    selectedEvent === "all" ? revenueByEvent : revenueByEvent.filter((event) => event.id === selectedEvent)

  return (
    <OrganizerRouteGuard>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
            <p className="text-muted-foreground">Track your event revenue and payment transactions</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by event" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Rest of the component remains the same, but replace the hardcoded data with the state variables */}
        {/* For example, in the stats cards: */}
        <div className="grid gap-4 md:grid-cols-3">
          {isLoading ? (
            Array(3)
              .fill(0)
              .map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-4 w-32 bg-muted rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-7 w-32 bg-muted rounded mb-1"></div>
                    <div className="h-4 w-40 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))
          ) : (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">ETB {stats.totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedEvent === "all"
                      ? "From all completed transactions"
                      : `From ${events.find((e) => e.id === selectedEvent)?.name}`}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">ETB {stats.pendingRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">From pending transactions</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Refunded Amount</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">ETB {stats.refundedAmount.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">Total refunded to attendees</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <Tabs defaultValue="transactions" className="w-full">
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="revenue">Revenue by Event</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  {selectedEvent === "all"
                    ? "View all payment transactions for your events"
                    : `View payment transactions for ${events.find((e) => e.id === selectedEvent)?.name}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            !date && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Filter by date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Attendee</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    {/* And in the tables, replace the hardcoded data with the filtered data */}
                    {/* For example, in the transactions table: */}
                    <TableBody>
                      {isLoading ? (
                        Array(5)
                          .fill(0)
                          .map((_, i) => (
                            <TableRow key={i}>
                              <TableCell>
                                <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-40 bg-muted rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-6 w-20 bg-muted rounded animate-pulse"></div>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : filteredTransactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                            No transactions found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTransactions.map((transaction, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{transaction.id}</TableCell>
                            <TableCell>{transaction.event}</TableCell>
                            <TableCell>{transaction.date}</TableCell>
                            <TableCell>{transaction.attendee}</TableCell>
                            <TableCell>{transaction.paymentMethod}</TableCell>
                            <TableCell>{transaction.amount}</TableCell>
                            <TableCell>
                              <Badge
                                className={cn(
                                  transaction.status === "completed"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                    : transaction.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                      : transaction.status === "failed"
                                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                                )}
                              >
                                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                              </Badge>
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

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Event</CardTitle>
                <CardDescription>
                  {selectedEvent === "all"
                    ? "Breakdown of revenue for each of your events"
                    : `Revenue breakdown for ${events.find((e) => e.id === selectedEvent)?.name}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Tickets Sold</TableHead>
                        <TableHead>Gross Revenue</TableHead>
                        <TableHead>Platform Fee</TableHead>
                        <TableHead>Net Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRevenueData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                            No revenue data found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRevenueData.map((event) => (
                          <TableRow key={event.id}>
                            <TableCell className="font-medium">{event.name}</TableCell>
                            <TableCell>{event.date}</TableCell>
                            <TableCell>{event.ticketsSold}</TableCell>
                            <TableCell>ETB {event.grossRevenue.toLocaleString()}</TableCell>
                            <TableCell>ETB {event.platformFee.toLocaleString()}</TableCell>
                            <TableCell className="font-medium">ETB {event.netRevenue.toLocaleString()}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payout History</CardTitle>
                <CardDescription>Record of payments transferred to your bank account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payout ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Bank Account</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">PAY-001</TableCell>
                        <TableCell>May 20, 2024</TableCell>
                        <TableCell>ETB 57,000</TableCell>
                        <TableCell>CBE **** 1234</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Completed
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">PAY-002</TableCell>
                        <TableCell>May 27, 2024</TableCell>
                        <TableCell>ETB 24,225</TableCell>
                        <TableCell>CBE **** 1234</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Completed
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">PAY-003</TableCell>
                        <TableCell>June 2, 2024</TableCell>
                        <TableCell>ETB 7,980</TableCell>
                        <TableCell>CBE **** 1234</TableCell>
                        <TableCell>
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                            Processing
                          </Badge>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Financial Analytics</CardTitle>
                <CardDescription>
                  {selectedEvent === "all"
                    ? "Visual breakdown of your financial performance"
                    : `Financial analytics for ${events.find((e) => e.id === selectedEvent)?.name}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Revenue Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <PieChart className="h-16 w-16 mx-auto mb-2 opacity-50" />
                        <p>Revenue chart visualization would appear here</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Revenue Trends
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <BarChart3 className="h-16 w-16 mx-auto mb-2 opacity-50" />
                        <p>Trend chart visualization would appear here</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Financial Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Average Transaction Value</p>
                          <p className="text-xl font-bold">ETB 450.00</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Revenue per Attendee</p>
                          <p className="text-xl font-bold">ETB 650.00</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Refund Rate</p>
                          <p className="text-xl font-bold">3.2%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </OrganizerRouteGuard>
  )
}
