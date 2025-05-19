"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Edit, Download, Mail, Plus, X, Printer, Send, Copy, Loader2 } from "lucide-react"

interface EventManageModalProps {
  event: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EventManageModal({ event, open, onOpenChange }: EventManageModalProps) {
  const [activeTab, setActiveTab] = useState("details")
  const [isLoading, setIsLoading] = useState(false)

  const handleAction = (action: string) => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // Show success message or handle errors
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl">Manage Event: {event.title}</DialogTitle>
          <DialogDescription>Configure and manage all aspects of your event</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b px-6">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
              <TabsTrigger
                value="details"
                className="data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-2"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="tickets"
                className="data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-2"
              >
                Tickets
              </TabsTrigger>
              <TabsTrigger
                value="attendees"
                className="data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-2"
              >
                Attendees
              </TabsTrigger>
              <TabsTrigger
                value="promotions"
                className="data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-2"
              >
                Promotions
              </TabsTrigger>
              <TabsTrigger
                value="communications"
                className="data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-2"
              >
                Communications
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="details" className="mt-0 h-full data-[state=active]:flex data-[state=active]:flex-col">
              <ScrollArea className="flex-1 p-6 h-[calc(90vh-12rem)]">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Event Title</Label>
                        <Input id="title" defaultValue={event.title} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Event Description</Label>
                        <Textarea id="description" defaultValue={event.description} className="min-h-[120px]" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select defaultValue={event.category}>
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Technology">Technology</SelectItem>
                            <SelectItem value="Business">Business</SelectItem>
                            <SelectItem value="Arts">Arts &amp; Entertainment</SelectItem>
                            <SelectItem value="Education">Education</SelectItem>
                            <SelectItem value="Community">Community</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="date">Event Date</Label>
                          <Input id="date" type="date" defaultValue="2024-05-15" />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="time">Event Time</Label>
                          <Input id="time" type="time" defaultValue="09:00" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" defaultValue={event.location} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="region">Region</Label>
                        <Select defaultValue="Addis Ababa">
                          <SelectTrigger id="region">
                            <SelectValue placeholder="Select region" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Addis Ababa">Addis Ababa</SelectItem>
                            <SelectItem value="Oromia">Oromia</SelectItem>
                            <SelectItem value="Amhara">Amhara</SelectItem>
                            <SelectItem value="Tigray">Tigray</SelectItem>
                            <SelectItem value="SNNPR">SNNPR</SelectItem>
                            <SelectItem value="Sidama">Sidama</SelectItem>
                            <SelectItem value="Afar">Afar</SelectItem>
                            <SelectItem value="Somali">Somali</SelectItem>
                            <SelectItem value="Benishangul-Gumuz">Benishangul-Gumuz</SelectItem>
                            <SelectItem value="Gambela">Gambela</SelectItem>
                            <SelectItem value="Harari">Harari</SelectItem>
                            <SelectItem value="Dire Dawa">Dire Dawa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" defaultValue={event.address} />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium">Event Status</h3>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch id="published" defaultChecked={event.status === "Published"} />
                        <Label htmlFor="published">Published</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch id="featured" />
                        <Label htmlFor="featured">Featured Event</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch id="registration" defaultChecked />
                        <Label htmlFor="registration">Registration Open</Label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => handleAction("saveDetails")}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="tickets" className="mt-0 h-full data-[state=active]:flex data-[state=active]:flex-col">
              <ScrollArea className="flex-1 p-6 h-[calc(90vh-12rem)]">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Ticket Types</h3>
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Ticket Type
                    </Button>
                  </div>

                  {event.ticketTypes.map((ticket: any) => (
                    <Card key={ticket.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <CardTitle>{ticket.name}</CardTitle>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription>
                          ETB {ticket.price} • {ticket.sold} sold • {ticket.available} available
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label htmlFor={`price-${ticket.id}`}>Price (ETB)</Label>
                            <Input id={`price-${ticket.id}`} defaultValue={ticket.price} />
                          </div>
                          <div>
                            <Label htmlFor={`quantity-${ticket.id}`}>Quantity</Label>
                            <Input id={`quantity-${ticket.id}`} defaultValue={ticket.total} />
                          </div>
                          <div>
                            <Label htmlFor={`start-date-${ticket.id}`}>Start Date</Label>
                            <Input id={`start-date-${ticket.id}`} type="date" />
                          </div>
                          <div>
                            <Label htmlFor={`end-date-${ticket.id}`}>End Date</Label>
                            <Input id={`end-date-${ticket.id}`} type="date" />
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          <Label htmlFor={`description-${ticket.id}`}>Description</Label>
                          <Textarea
                            id={`description-${ticket.id}`}
                            placeholder="Describe what's included with this ticket"
                          />
                        </div>

                        <div className="mt-4 flex gap-4">
                          <div className="flex items-center space-x-2">
                            <Switch id={`active-${ticket.id}`} defaultChecked />
                            <Label htmlFor={`active-${ticket.id}`}>Active</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch id={`hidden-${ticket.id}`} />
                            <Label htmlFor={`hidden-${ticket.id}`}>Hidden</Label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => handleAction("saveTickets")}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent
              value="attendees"
              className="mt-0 h-full data-[state=active]:flex data-[state=active]:flex-col"
            >
              <ScrollArea className="flex-1 p-6 h-[calc(90vh-12rem)]">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Attendee Management</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                      <Button size="sm" className="gap-2">
                        <Mail className="h-4 w-4" />
                        Email All
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-md">
                    <div className="grid grid-cols-5 gap-4 p-4 border-b font-medium">
                      <div>Name</div>
                      <div>Email</div>
                      <div>Ticket Type</div>
                      <div>Purchase Date</div>
                      <div>Actions</div>
                    </div>

                    {event.recentAttendees.map((attendee: any) => (
                      <div key={attendee.id} className="grid grid-cols-5 gap-4 p-4 border-b">
                        <div>{attendee.name}</div>
                        <div className="text-muted-foreground">{attendee.email}</div>
                        <div>
                          <Badge variant="outline">{attendee.ticketType}</Badge>
                        </div>
                        <div className="text-muted-foreground">{attendee.purchaseDate}</div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">Showing 4 of {event.attendees} attendees</div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled>
                        Previous
                      </Button>
                      <Button variant="outline" size="sm">
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent
              value="promotions"
              className="mt-0 h-full data-[state=active]:flex data-[state=active]:flex-col"
            >
              <ScrollArea className="flex-1 p-6 h-[calc(90vh-12rem)]">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Promotion Codes</h3>
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Promotion
                    </Button>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Create New Promotion</CardTitle>
                      <CardDescription>Set up discount codes for your event</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="promo-code">Promotion Code</Label>
                          <div className="flex gap-2">
                            <Input id="promo-code" placeholder="e.g., SUMMER25" />
                            <Button variant="outline" size="icon">
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="discount-type">Discount Type</Label>
                          <Select defaultValue="percentage">
                            <SelectTrigger id="discount-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">Percentage (%)</SelectItem>
                              <SelectItem value="fixed">Fixed Amount (ETB)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="discount-value">Discount Value</Label>
                          <Input id="discount-value" placeholder="e.g., 25" />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="max-uses">Maximum Uses</Label>
                          <Input id="max-uses" placeholder="e.g., 100" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start-date">Start Date</Label>
                          <Input id="start-date" type="date" />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="end-date">End Date</Label>
                          <Input id="end-date" type="date" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="applicable-tickets">Applicable Ticket Types</Label>
                        <Select defaultValue="all">
                          <SelectTrigger id="applicable-tickets">
                            <SelectValue placeholder="Select tickets" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Tickets</SelectItem>
                            <SelectItem value="regular">Regular Only</SelectItem>
                            <SelectItem value="vip">VIP Only</SelectItem>
                            <SelectItem value="student">Student Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button variant="outline">Cancel</Button>
                      <Button>Create Promotion</Button>
                    </CardFooter>
                  </Card>

                  {event.promotions.map((promo: any) => (
                    <Card key={promo.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <CardTitle>{promo.code}</CardTitle>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription>
                          {promo.discount} Off • {promo.used} used • {promo.available} available
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm font-medium">Discount</div>
                            <div>{promo.discount}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">Total Uses</div>
                            <div>{promo.total}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">Used</div>
                            <div>{promo.used}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">Available</div>
                            <div>{promo.available}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent
              value="communications"
              className="mt-0 h-full data-[state=active]:flex data-[state=active]:flex-col"
            >
              <ScrollArea className="flex-1 p-6 h-[calc(90vh-12rem)]">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Communications</h3>
                    <Button size="sm" className="gap-2">
                      <Send className="h-4 w-4" />
                      Send New Message
                    </Button>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Email Templates</CardTitle>
                      <CardDescription>Customize emails sent to attendees</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">Confirmation Email</h4>
                                <p className="text-sm text-muted-foreground">Sent after ticket purchase</p>
                              </div>
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">Reminder Email</h4>
                                <p className="text-sm text-muted-foreground">Sent 24 hours before event</p>
                              </div>
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">Thank You Email</h4>
                                <p className="text-sm text-muted-foreground">Sent after the event</p>
                              </div>
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">Cancellation Email</h4>
                                <p className="text-sm text-muted-foreground">Sent if event is cancelled</p>
                              </div>
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Message History</CardTitle>
                      <CardDescription>Previous communications with attendees</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-start pb-4 border-b">
                          <div>
                            <h4 className="font-medium">Event Reminder</h4>
                            <p className="text-sm text-muted-foreground">Sent to all attendees</p>
                            <p className="text-sm text-muted-foreground">April 10, 2024 at 10:30 AM</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              Resend
                            </Button>
                          </div>
                        </div>

                        <div className="flex justify-between items-start pb-4 border-b">
                          <div>
                            <h4 className="font-medium">Schedule Update</h4>
                            <p className="text-sm text-muted-foreground">Sent to all attendees</p>
                            <p className="text-sm text-muted-foreground">March 25, 2024 at 2:15 PM</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              Resend
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
