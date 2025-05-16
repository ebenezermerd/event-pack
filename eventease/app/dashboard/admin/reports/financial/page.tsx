"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Download, Filter, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AdminRouteGuard } from "@/components/guards/admin-route-guard"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface FinancialSummary {
  totalRevenue: number
  platformFees: number
  netRevenue: number
}

interface RevenuePeriod {
  period: string
  revenue: number
  platformFee: number
  netRevenue: number
}

interface RevenueByEvent {
  eventId: string
  eventTitle: string
  revenue: number
  platformFee: number
  netRevenue: number
}

export default function AdminFinancialReportsPage() {
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterOrganizer, setFilterOrganizer] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    totalRevenue: 0,
    platformFees: 0,
    netRevenue: 0,
  })
  const [revenueByPeriod, setRevenueByPeriod] = useState<RevenuePeriod[]>([])
  const [revenueByEvent, setRevenueByEvent] = useState<RevenueByEvent[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setIsLoading(true)

        // Build query params
        const params = new URLSearchParams()
        if (startDate) params.append("startDate", startDate.toISOString())
        if (endDate) params.append("endDate", endDate.toISOString())
        if (filterOrganizer !== "all") params.append("organizerId", filterOrganizer)

        const response = await apiClient.get(`/admin/reports/financial?${params.toString()}`)

        if (response.data.success) {
          setFinancialSummary({
            totalRevenue: response.data.report.totalRevenue,
            platformFees: response.data.report.platformFees,
            netRevenue: response.data.report.netRevenue,
          })
          setRevenueByPeriod(response.data.report.revenueByPeriod)
          setRevenueByEvent(response.data.report.revenueByEvent)
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
  }, [startDate, endDate, filterOrganizer, toast])

  return (
    <AdminRouteGuard>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
            <p className="text-muted-foreground">Platform-wide financial analytics and reporting</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    <div className="h-4 w-40 bg-muted rounded"></div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-7 w-32 bg-muted rounded mb-1"></div>
                  <div className="h-4 w-24 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Platform Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">ETB {financialSummary.totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-green-500">↑ 15%</span> from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Platform Fees Collected</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">ETB {financialSummary.platformFees.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-green-500">↑ 12%</span> from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Net Revenue to Organizers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">ETB {financialSummary.netRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-green-500">↑ 8%</span> from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Transaction Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ETB{" "}
                    {financialSummary.totalRevenue > 0
                      ? (
                          financialSummary.totalRevenue /
                          (revenueByEvent.reduce((sum, event) => sum + event.revenue, 0) / 100)
                        ).toFixed(2)
                      : "0.00"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-green-500">↑ 5%</span> from last month
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by organizer or event..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("w-[180px] justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Start date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("w-[180px] justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>End date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
              </PopoverContent>
            </Popover>
            <Select value={filterOrganizer} onValueChange={setFilterOrganizer}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by organizer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizers</SelectItem>
                <SelectItem value="tech-association">Tech Association</SelectItem>
                <SelectItem value="coffee-exporters">Coffee Exporters</SelectItem>
                <SelectItem value="national-museum">National Museum</SelectItem>
                <SelectItem value="addis-chamber">Addis Chamber</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="revenue" className="w-full">
          <TabsList>
            <TabsTrigger value="revenue">Revenue by Organizer</TabsTrigger>
            <TabsTrigger value="events">Revenue by Event</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Organizer</CardTitle>
                <CardDescription>Financial performance of each organizer on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Organizer</TableHead>
                        <TableHead>Total Events</TableHead>
                        <TableHead>Tickets Sold</TableHead>
                        <TableHead>Gross Revenue</TableHead>
                        <TableHead>Platform Fee</TableHead>
                        <TableHead>Net Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading
                        ? [...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                              <TableCell>
                                <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-8 bg-muted rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                              </TableCell>
                            </TableRow>
                          ))
                        : [
                            {
                              name: "Tech Association",
                              events: 5,
                              tickets: 1245,
                              revenue: 622500,
                              fee: 31125,
                              net: 591375,
                            },
                            {
                              name: "Coffee Exporters",
                              events: 3,
                              tickets: 850,
                              revenue: 255000,
                              fee: 12750,
                              net: 242250,
                            },
                            {
                              name: "National Museum",
                              events: 4,
                              tickets: 620,
                              revenue: 124000,
                              fee: 6200,
                              net: 117800,
                            },
                            { name: "Addis Chamber", events: 2, tickets: 180, revenue: 180000, fee: 9000, net: 171000 },
                            { name: "iceaddis", events: 3, tickets: 320, revenue: 80000, fee: 4000, net: 76000 },
                          ]
                            .filter((org) =>
                              searchTerm ? org.name.toLowerCase().includes(searchTerm.toLowerCase()) : true,
                            )
                            .map((org, i) => (
                              <TableRow key={i}>
                                <TableCell className="font-medium">{org.name}</TableCell>
                                <TableCell>{org.events}</TableCell>
                                <TableCell>{org.tickets}</TableCell>
                                <TableCell>ETB {org.revenue.toLocaleString()}</TableCell>
                                <TableCell>ETB {org.fee.toLocaleString()}</TableCell>
                                <TableCell>ETB {org.net.toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Event</CardTitle>
                <CardDescription>Financial performance of individual events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event Name</TableHead>
                        <TableHead>Organizer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Tickets Sold</TableHead>
                        <TableHead>Gross Revenue</TableHead>
                        <TableHead>Platform Fee</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading
                        ? [...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                              <TableCell>
                                <div className="h-4 w-40 bg-muted rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                              </TableCell>
                            </TableRow>
                          ))
                        : revenueByEvent
                            .filter((event) =>
                              searchTerm ? event.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) : true,
                            )
                            .map((event, i) => (
                              <TableRow key={i}>
                                <TableCell className="font-medium">{event.eventTitle}</TableCell>
                                <TableCell>Organizer Name</TableCell>
                                <TableCell>Event Date</TableCell>
                                <TableCell>{Math.floor(event.revenue / 250)}</TableCell>
                                <TableCell>ETB {event.revenue.toLocaleString()}</TableCell>
                                <TableCell>ETB {event.platformFee.toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>All payment transactions across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Organizer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading
                        ? [...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                              <TableCell>
                                <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-40 bg-muted rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                              </TableCell>
                            </TableRow>
                          ))
                        : [
                            {
                              id: "TRX-001",
                              event: "Addis Tech Summit 2024",
                              organizer: "Tech Association",
                              date: "May 15, 2024",
                              method: "Telebirr",
                              amount: "ETB 500.00",
                              status: "completed",
                            },
                            {
                              id: "TRX-002",
                              event: "Addis Tech Summit 2024",
                              organizer: "Tech Association",
                              date: "May 15, 2024",
                              method: "CBE",
                              amount: "ETB 500.00",
                              status: "completed",
                            },
                            {
                              id: "TRX-003",
                              event: "Ethiopian Coffee Festival",
                              organizer: "Coffee Exporters",
                              date: "May 22, 2024",
                              method: "Telebirr",
                              amount: "ETB 300.00",
                              status: "completed",
                            },
                            {
                              id: "TRX-004",
                              event: "Ethiopian Coffee Festival",
                              organizer: "Coffee Exporters",
                              date: "May 22, 2024",
                              method: "Dashen Bank",
                              amount: "ETB 300.00",
                              status: "pending",
                            },
                            {
                              id: "TRX-005",
                              event: "Cultural Heritage Exhibition",
                              organizer: "National Museum",
                              date: "May 28, 2024",
                              method: "Credit Card",
                              amount: "ETB 200.00",
                              status: "completed",
                            },
                          ]
                            .filter((tx) =>
                              searchTerm
                                ? tx.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  tx.organizer.toLowerCase().includes(searchTerm.toLowerCase())
                                : true,
                            )
                            .map((tx, i) => (
                              <TableRow key={i}>
                                <TableCell className="font-medium">{tx.id}</TableCell>
                                <TableCell>{tx.event}</TableCell>
                                <TableCell>{tx.organizer}</TableCell>
                                <TableCell>{tx.date}</TableCell>
                                <TableCell>{tx.method}</TableCell>
                                <TableCell>{tx.amount}</TableCell>
                                <TableCell>
                                  <Badge
                                    className={cn(
                                      tx.status === "completed"
                                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                        : tx.status === "pending"
                                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                                    )}
                                  >
                                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
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
                <CardDescription>Record of payments transferred to organizers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payout ID</TableHead>
                        <TableHead>Organizer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading
                        ? [...Array(3)].map((_, i) => (
                            <TableRow key={i}>
                              <TableCell>
                                <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                              </TableCell>
                            </TableRow>
                          ))
                        : [
                            {
                              id: "PAY-001",
                              organizer: "Tech Association",
                              date: "May 20, 2024",
                              amount: "ETB 57,000",
                              status: "Completed",
                            },
                            {
                              id: "PAY-002",
                              organizer: "Coffee Exporters",
                              date: "May 27, 2024",
                              amount: "ETB 24,225",
                              status: "Completed",
                            },
                            {
                              id: "PAY-003",
                              organizer: "National Museum",
                              date: "June 2, 2024",
                              amount: "ETB 7,980",
                              status: "Processing",
                            },
                          ].map((payout, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">{payout.id}</TableCell>
                              <TableCell>{payout.organizer}</TableCell>
                              <TableCell>{payout.date}</TableCell>
                              <TableCell>{payout.amount}</TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    payout.status === "Completed"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                  }
                                >
                                  {payout.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminRouteGuard>
  )
}
