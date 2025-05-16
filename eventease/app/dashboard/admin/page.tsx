"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  CalendarDays,
  Clock,
  DollarSign,
  Users,
  ArrowUpRight,
  BarChart,
  Calendar,
  CheckCircle,
  Eye,
  PieChart,
  Plus,
  Ticket,
  TrendingUp,
  Download,
} from "lucide-react"
import { AdminRouteGuard } from "@/components/guards/admin-route-guard"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface DashboardStats {
  totalUsers: number
  totalOrganizers: number
  totalEvents: number
  totalRevenue: number
  pendingApprovals: {
    organizers: number
    events: number
  }
}

interface RecentUser {
  id: string
  name: string
  email: string
  role: string
  joinDate: string
}

interface RecentEvent {
  id: string
  title: string
  organizer: {
    id: string
    name: string
    companyName: string
  }
  date: string
  status: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.get("/admin/dashboard")

        if (response.data.success) {
          setStats(response.data.stats)
          setRecentUsers(response.data.recentUsers)
          setRecentEvents(response.data.recentEvents)
        } else {
          toast({
            title: "Error",
            description: "Failed to load dashboard data",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast])

  return (
    <AdminRouteGuard>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    <div className="h-4 w-24 bg-muted rounded"></div>
                  </CardTitle>
                  <div className="h-4 w-4 bg-muted rounded-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-7 w-16 bg-muted rounded mb-1"></div>
                  <div className="h-4 w-32 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">+{Math.floor(Math.random() * 20)}% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalEvents || 0}</div>
                <p className="text-xs text-muted-foreground">+{Math.floor(Math.random() * 15)}% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">ETB {stats?.totalRevenue.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">+{Math.floor(Math.random() * 25)}% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(stats?.pendingApprovals.events || 0) + (stats?.pendingApprovals.organizers || 0)}
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>{stats?.pendingApprovals.events || 0} events</span>
                  <span>•</span>
                  <span>{stats?.pendingApprovals.organizers || 0} organizers</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Recent Events</CardTitle>
                  <CardDescription>
                    {isLoading ? "Loading events..." : `${recentEvents.length} events submitted recently`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center animate-pulse">
                          <div className="h-9 w-9 bg-muted rounded-full mr-3"></div>
                          <div className="space-y-2 flex-1">
                            <div className="h-4 w-3/4 bg-muted rounded"></div>
                            <div className="h-3 w-1/2 bg-muted rounded"></div>
                          </div>
                          <div className="h-6 w-16 bg-muted rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentEvents.map((event) => (
                        <div key={event.id} className="flex items-center">
                          <Avatar className="h-9 w-9 mr-3">
                            <AvatarImage
                              src={`/placeholder.svg?text=${event.organizer.companyName.substring(0, 2)}`}
                              alt={event.organizer.companyName}
                            />
                            <AvatarFallback>{event.organizer.companyName.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">{event.title}</p>
                            <p className="text-sm text-muted-foreground">
                              by {event.organizer.companyName} • {new Date(event.date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge
                            variant={
                              event.status === "published"
                                ? "default"
                                : event.status === "pending"
                                  ? "outline"
                                  : "secondary"
                            }
                          >
                            {event.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Users</CardTitle>
                  <CardDescription>
                    {isLoading ? "Loading users..." : `${recentUsers.length} users joined recently`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center animate-pulse">
                          <div className="h-9 w-9 bg-muted rounded-full mr-3"></div>
                          <div className="space-y-2 flex-1">
                            <div className="h-4 w-3/4 bg-muted rounded"></div>
                            <div className="h-3 w-1/2 bg-muted rounded"></div>
                          </div>
                          <div className="h-6 w-16 bg-muted rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentUsers.map((user) => (
                        <div key={user.id} className="flex items-center">
                          <Avatar className="h-9 w-9 mr-3">
                            <AvatarImage src={`/placeholder.svg?text=${user.name.substring(0, 2)}`} alt={user.name} />
                            <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                          <Badge variant="outline">{user.role}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Recent platform activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { icon: CheckCircle, text: "Event 'Tech Summit 2024' was approved", time: "2 hours ago" },
                      { icon: Users, text: "New organizer 'Creative Events' registered", time: "5 hours ago" },
                      { icon: Ticket, text: "50 tickets sold for 'Music Festival'", time: "1 day ago" },
                      { icon: DollarSign, text: "ETB 25,000 revenue generated today", time: "1 day ago" },
                      { icon: Calendar, text: "5 new events created this week", time: "2 days ago" },
                    ].map((activity, i) => (
                      <div key={i} className="flex items-center">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted mr-3">
                          <activity.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">{activity.text}</p>
                          <p className="text-sm text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <Button variant="outline" className="justify-start">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Review Pending Events
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      Approve Organizers
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <BarChart className="mr-2 h-4 w-4" />
                      View Financial Reports
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <PieChart className="mr-2 h-4 w-4" />
                      Analytics Dashboard
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Announcement
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">User Growth</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+573</div>
                  <p className="text-xs text-muted-foreground">+19% from last month</p>
                  <div className="h-[80px] mt-4 text-center text-muted-foreground flex items-center justify-center">
                    <BarChart className="h-16 w-16 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Event Growth</CardTitle>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+24</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                  <div className="h-[80px] mt-4 text-center text-muted-foreground flex items-center justify-center">
                    <BarChart className="h-16 w-16 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue Growth</CardTitle>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+32%</div>
                  <p className="text-xs text-muted-foreground">+ETB 45,230 from last month</p>
                  <div className="h-[80px] mt-4 text-center text-muted-foreground flex items-center justify-center">
                    <BarChart className="h-16 w-16 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>User engagement and platform metrics</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[200px] text-center text-muted-foreground flex items-center justify-center">
                  <div>
                    <BarChart className="h-16 w-16 mx-auto opacity-50" />
                    <p className="mt-2">Analytics chart will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Reports</CardTitle>
                <CardDescription>Download or view detailed reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    {
                      title: "Financial Report",
                      description: "Revenue, transactions, and financial metrics",
                      icon: DollarSign,
                    },
                    { title: "User Activity Report", description: "User engagement and activity metrics", icon: Users },
                    {
                      title: "Event Performance",
                      description: "Event attendance and performance metrics",
                      icon: Calendar,
                    },
                    { title: "Organizer Report", description: "Organizer performance and metrics", icon: Users },
                    { title: "Platform Health", description: "System performance and health metrics", icon: BarChart },
                    { title: "Ticket Sales Report", description: "Detailed ticket sales analysis", icon: Ticket },
                  ].map((report, i) => (
                    <Card key={i}>
                      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{report.title}</CardTitle>
                        <report.icon className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground mb-4">{report.description}</p>
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="mr-2 h-3 w-3" />
                          View Report
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminRouteGuard>
  )
}
