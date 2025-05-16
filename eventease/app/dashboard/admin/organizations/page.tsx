"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, MoreHorizontal, Download, Eye, Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AdminRouteGuard } from "@/components/guards/admin-route-guard"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"

interface Organizer {
  userId: string
  name: string
  email: string
  companyName: string
  status: "approved" | "pending" | "rejected"
  joinDate: string
  verified: boolean
  totalEvents: number
  logo?: string
  description?: string
  website?: string
  address?: string
  region?: string
  tinNumber: string
  verificationDocuments?: any[]
}

export default function AdminOrganizationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedOrg, setSelectedOrg] = useState<Organizer | null>(null)
  const [viewDocuments, setViewDocuments] = useState(false)
  const [organizers, setOrganizers] = useState<Organizer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [rejectReason, setRejectReason] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchOrganizers = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.get("/admin/organizers")

        if (response.data.success) {
          setOrganizers(response.data.organizers)
        } else {
          toast({
            title: "Error",
            description: "Failed to load organizers",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching organizers:", error)
        toast({
          title: "Error",
          description: "Failed to load organizers. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrganizers()
  }, [toast])

  const handleUpdateOrganizerStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      const payload = {
        status,
        ...(status === "rejected" && { reason: rejectReason }),
      }

      if (status === "rejected" && !rejectReason) {
        toast({
          title: "Error",
          description: "Please provide a reason for rejection",
          variant: "destructive",
        })
        return
      }

      const response = await apiClient.put(`/admin/organizers/${id}/status`, payload)

      if (response.data.success) {
        setOrganizers(organizers.map((org) => (org.userId === id ? { ...org, status } : org)))
        setSelectedOrg(null)
        setRejectReason("")
        toast({
          title: "Success",
          description: `Organizer has been ${status}`,
        })
      } else {
        toast({
          title: "Error",
          description: response.data.message || `Failed to ${status} organizer`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(`Error ${status} organizer:`, error)
      toast({
        title: "Error",
        description: `Failed to ${status} organizer. Please try again later.`,
        variant: "destructive",
      })
    }
  }

  // Filter organizers based on search term and status
  const filteredOrganizers = organizers.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || org.status === filterStatus

    return matchesSearch && matchesStatus
  })

  return (
    <AdminRouteGuard>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
            <p className="text-muted-foreground">Manage event organizer organizations</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export List
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search organizations..."
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
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Organizations</TabsTrigger>
            <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Organization List</CardTitle>
                <CardDescription>View and manage all registered organizations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Organization</TableHead>
                        <TableHead>Contact Person</TableHead>
                        <TableHead>TIN Number</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Registration Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        [...Array(5)].map((_, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <div className="flex items-center gap-3 animate-pulse">
                                <div className="h-10 w-10 bg-muted rounded-full"></div>
                                <div className="space-y-2">
                                  <div className="h-4 w-32 bg-muted rounded"></div>
                                  <div className="h-3 w-24 bg-muted rounded"></div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="h-4 w-28 bg-muted rounded animate-pulse"></div>
                            </TableCell>
                            <TableCell>
                              <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                            </TableCell>
                            <TableCell>
                              <div className="h-6 w-20 bg-muted rounded animate-pulse"></div>
                            </TableCell>
                            <TableCell>
                              <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2 animate-pulse">
                                <div className="h-8 w-8 bg-muted rounded-full"></div>
                                <div className="h-8 w-8 bg-muted rounded-full"></div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : filteredOrganizers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                            No organizations found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredOrganizers.map((org) => (
                          <TableRow key={org.userId}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage
                                    src={
                                      org.logo ||
                                      `/placeholder.svg?height=40&width=40&text=${org.companyName.substring(0, 2)}`
                                    }
                                    alt={org.companyName}
                                  />
                                  <AvatarFallback>{org.companyName.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{org.companyName}</p>
                                  <p className="text-xs text-muted-foreground">{org.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{org.name}</TableCell>
                            <TableCell>{org.tinNumber}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  org.status === "approved"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                    : org.status === "rejected"
                                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                }
                              >
                                {org.status.charAt(0).toUpperCase() + org.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(org.joinDate).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setSelectedOrg(org)
                                      setViewDocuments(false)
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">View details</span>
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                                  <DialogHeader>
                                    <DialogTitle>Organization Details</DialogTitle>
                                    <DialogDescription>
                                      View detailed information about this organization
                                    </DialogDescription>
                                  </DialogHeader>

                                  {selectedOrg && (
                                    <div className="grid gap-6 py-4 overflow-y-auto pr-2">
                                      <div className="flex items-center gap-4">
                                        <Avatar className="h-16 w-16">
                                          <AvatarImage
                                            src={
                                              selectedOrg.logo ||
                                              `/placeholder.svg?height=40&width=40&text=${selectedOrg.companyName.substring(0, 2)}`
                                            }
                                            alt={selectedOrg.companyName}
                                          />
                                          <AvatarFallback className="text-lg">
                                            {selectedOrg.companyName.substring(0, 2)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <h3 className="text-xl font-semibold">{selectedOrg.companyName}</h3>
                                          <p className="text-sm text-muted-foreground">ID: {selectedOrg.userId}</p>
                                          <Badge
                                            className={
                                              selectedOrg.status === "approved"
                                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 mt-2"
                                                : selectedOrg.status === "rejected"
                                                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 mt-2"
                                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 mt-2"
                                            }
                                          >
                                            {selectedOrg.status.charAt(0).toUpperCase() + selectedOrg.status.slice(1)}
                                          </Badge>
                                        </div>
                                      </div>

                                      <Separator />

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                          <h4 className="text-sm font-medium mb-2">Contact Information</h4>
                                          <div className="space-y-2">
                                            <div>
                                              <Label className="text-xs text-muted-foreground">Contact Person</Label>
                                              <p className="text-sm">{selectedOrg.name}</p>
                                            </div>
                                            <div>
                                              <Label className="text-xs text-muted-foreground">Email</Label>
                                              <p className="text-sm">{selectedOrg.email}</p>
                                            </div>
                                            <div>
                                              <Label className="text-xs text-muted-foreground">Website</Label>
                                              <p className="text-sm">{selectedOrg.website || "N/A"}</p>
                                            </div>
                                          </div>
                                        </div>
                                        <div>
                                          <h4 className="text-sm font-medium mb-2">Business Information</h4>
                                          <div className="space-y-2">
                                            <div>
                                              <Label className="text-xs text-muted-foreground">TIN Number</Label>
                                              <p className="text-sm">{selectedOrg.tinNumber}</p>
                                            </div>
                                            <div>
                                              <Label className="text-xs text-muted-foreground">Registration Date</Label>
                                              <p className="text-sm">
                                                {new Date(selectedOrg.joinDate).toLocaleDateString()}
                                              </p>
                                            </div>
                                            <div>
                                              <Label className="text-xs text-muted-foreground">Address</Label>
                                              <p className="text-sm">{selectedOrg.address || "N/A"}</p>
                                            </div>
                                            <div>
                                              <Label className="text-xs text-muted-foreground">Region</Label>
                                              <p className="text-sm">{selectedOrg.region || "N/A"}</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      <Separator />

                                      <div>
                                        <div className="flex justify-between items-center mb-2">
                                          <h4 className="text-sm font-medium">Verification Documents</h4>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setViewDocuments(!viewDocuments)}
                                          >
                                            {viewDocuments ? "Hide Documents" : "View Documents"}
                                          </Button>
                                        </div>

                                        {viewDocuments && (
                                          <div className="mt-4 grid md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
                                            {(
                                              selectedOrg.verificationDocuments || [
                                                {
                                                  title: "Business Registration Certificate",
                                                  type: "document",
                                                },
                                                {
                                                  title: "Tax Identification Certificate",
                                                  type: "document",
                                                },
                                                {
                                                  title: "Company Ownership Document",
                                                  type: "document",
                                                },
                                                {
                                                  title: "Valid ID of Business Owner",
                                                  type: "document",
                                                },
                                              ]
                                            ).map((doc, index) => (
                                              <Card key={index} className="mb-4">
                                                <CardHeader className="py-3">
                                                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                                                    <svg
                                                      width="16"
                                                      height="16"
                                                      viewBox="0 0 24 24"
                                                      fill="none"
                                                      xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                      <path d="M7 18H17V16H7V18Z" fill="currentColor" />
                                                      <path d="M17 14H7V12H17V14Z" fill="currentColor" />
                                                      <path d="M7 10H11V8H7V10Z" fill="currentColor" />
                                                      <path
                                                        fillRule="evenodd"
                                                        clipRule="evenodd"
                                                        d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z"
                                                        fill="currentColor"
                                                      />
                                                    </svg>
                                                    {doc.title}
                                                  </CardTitle>
                                                </CardHeader>
                                                <CardContent className="py-2">
                                                  <div className="bg-muted h-32 rounded flex items-center justify-center">
                                                    <p className="text-sm text-muted-foreground">Document Preview</p>
                                                  </div>
                                                  <div className="flex justify-end mt-3">
                                                    <Button variant="outline" size="sm">
                                                      <Download className="h-3 w-3 mr-1" />
                                                      Download
                                                    </Button>
                                                  </div>
                                                </CardContent>
                                              </Card>
                                            ))}
                                          </div>
                                        )}
                                      </div>

                                      {selectedOrg.status === "pending" && (
                                        <>
                                          <Separator />
                                          <div className="space-y-2">
                                            <Label htmlFor="rejection-reason">
                                              Rejection Reason (required if rejecting)
                                            </Label>
                                            <Textarea
                                              id="rejection-reason"
                                              placeholder="Provide a reason for rejection..."
                                              value={rejectReason}
                                              onChange={(e) => setRejectReason(e.target.value)}
                                            />
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  )}

                                  <DialogFooter className="flex justify-between mt-4 pt-2 border-t">
                                    {selectedOrg?.status === "pending" ? (
                                      <>
                                        <Button
                                          variant="destructive"
                                          onClick={() => handleUpdateOrganizerStatus(selectedOrg.userId, "rejected")}
                                        >
                                          <X className="h-4 w-4 mr-2" />
                                          Reject
                                        </Button>
                                        <Button
                                          onClick={() => handleUpdateOrganizerStatus(selectedOrg.userId, "approved")}
                                        >
                                          <Check className="h-4 w-4 mr-2" />
                                          Approve
                                        </Button>
                                      </>
                                    ) : (
                                      <Button variant="outline" onClick={() => setSelectedOrg(null)}>
                                        Close
                                      </Button>
                                    )}
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

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
                                      setSelectedOrg(org)
                                      setViewDocuments(false)
                                      document.getElementById("view-details-button")?.click()
                                    }}
                                  >
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedOrg(org)
                                      setViewDocuments(true)
                                      document.getElementById("view-details-button")?.click()
                                    }}
                                  >
                                    View Documents
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {org.status === "approved" ? (
                                    <DropdownMenuItem className="text-red-600">Revoke Approval</DropdownMenuItem>
                                  ) : org.status === "pending" ? (
                                    <>
                                      <DropdownMenuItem
                                        className="text-green-600"
                                        onClick={() => handleUpdateOrganizerStatus(org.userId, "approved")}
                                      >
                                        Approve
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={() => {
                                          setSelectedOrg(org)
                                          setRejectReason("")
                                          document.getElementById("rejection-dialog-trigger")?.click()
                                        }}
                                      >
                                        Reject
                                      </DropdownMenuItem>
                                    </>
                                  ) : (
                                    <DropdownMenuItem className="text-green-600">Reconsider</DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
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
                <CardTitle>Pending Organizations</CardTitle>
                <CardDescription>Organizations awaiting approval</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Organization</TableHead>
                        <TableHead>Contact Person</TableHead>
                        <TableHead>TIN Number</TableHead>
                        <TableHead>Registration Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        [...Array(3)].map((_, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <div className="flex items-center gap-3 animate-pulse">
                                <div className="h-10 w-10 bg-muted rounded-full"></div>
                                <div className="space-y-2">
                                  <div className="h-4 w-32 bg-muted rounded"></div>
                                  <div className="h-3 w-24 bg-muted rounded"></div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="h-4 w-28 bg-muted rounded animate-pulse"></div>
                            </TableCell>
                            <TableCell>
                              <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                            </TableCell>
                            <TableCell>
                              <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2 animate-pulse">
                                <div className="h-8 w-20 bg-muted rounded"></div>
                                <div className="h-8 w-20 bg-muted rounded"></div>
                                <div className="h-8 w-20 bg-muted rounded"></div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : organizers.filter((org) => org.status === "pending").length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                            No pending organizations found
                          </TableCell>
                        </TableRow>
                      ) : (
                        organizers
                          .filter((org) => org.status === "pending")
                          .map((org) => (
                            <TableRow key={org.userId}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarImage
                                      src={
                                        org.logo ||
                                        `/placeholder.svg?height=40&width=40&text=${org.companyName.substring(0, 2)}`
                                      }
                                      alt={org.companyName}
                                    />
                                    <AvatarFallback>{org.companyName.substring(0, 2)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{org.companyName}</p>
                                    <p className="text-xs text-muted-foreground">{org.email}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{org.name}</TableCell>
                              <TableCell>{org.tinNumber}</TableCell>
                              <TableCell>{new Date(org.joinDate).toLocaleDateString()}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-1"
                                    onClick={() => {
                                      setSelectedOrg(org)
                                      setViewDocuments(false)
                                      document.getElementById("view-details-button")?.click()
                                    }}
                                  >
                                    <Eye className="h-3 w-3" />
                                    View
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-1"
                                    onClick={() => handleUpdateOrganizerStatus(org.userId, "approved")}
                                  >
                                    <Check className="h-3 w-3" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-1 text-red-600"
                                    onClick={() => {
                                      setSelectedOrg(org)
                                      setRejectReason("")
                                      document.getElementById("rejection-dialog-trigger")?.click()
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                    Reject
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
        </Tabs>

        {/* Hidden button for view details dialog */}
        <button id="view-details-button" className="hidden">
          View Details
        </button>

        {/* Rejection dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <button id="rejection-dialog-trigger" className="hidden">
              Open
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Organization</DialogTitle>
              <DialogDescription>Please provide a reason for rejecting this organization.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="Reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedOrg(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedOrg && handleUpdateOrganizerStatus(selectedOrg.userId, "rejected")}
                disabled={!rejectReason}
              >
                Reject Organization
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminRouteGuard>
  )
}
