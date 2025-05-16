"use client"

import { useState, useEffect } from "react"
import { useBookings } from "@/contexts/BookingContext"
import type { TicketType } from "@/lib/services/booking-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Edit, Trash2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TicketManagementProps {
  eventId: number
}

// Form schema for ticket type
const ticketTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be 0 or greater"),
  isFree: z.boolean().default(false),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  maxPerUser: z.coerce.number().min(1, "Max per user must be at least 1").optional(),
})

type TicketTypeFormValues = z.infer<typeof ticketTypeSchema>

export function TicketManagement({ eventId }: TicketManagementProps) {
  const { fetchEventTicketTypes, createTicketType, updateTicketType, deleteTicketType, isLoading, error, ticketTypes } =
    useBookings()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTicket, setEditingTicket] = useState<TicketType | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [ticketToDelete, setTicketToDelete] = useState<TicketType | null>(null)

  // Initialize form
  const form = useForm<TicketTypeFormValues>({
    resolver: zodResolver(ticketTypeSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      isFree: false,
      quantity: 100,
      maxPerUser: 4,
    },
  })

  // Load ticket types
  useEffect(() => {
    fetchEventTicketTypes(eventId)
  }, [eventId, fetchEventTicketTypes])

  // Reset form when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      form.reset()
      setEditingTicket(null)
    }
  }, [isDialogOpen, form])

  // Set form values when editing a ticket
  useEffect(() => {
    if (editingTicket) {
      form.setValue("name", editingTicket.name)
      form.setValue("description", editingTicket.description || "")
      form.setValue("price", editingTicket.price)
      form.setValue("isFree", editingTicket.isFree)
      form.setValue("quantity", editingTicket.quantity)
      form.setValue("maxPerUser", editingTicket.maxPerUser || 4)
    }
  }, [editingTicket, form])

  // Watch isFree to update price field
  const isFree = form.watch("isFree")

  useEffect(() => {
    if (isFree) {
      form.setValue("price", 0)
    }
  }, [isFree, form])

  // Handle form submission
  const onSubmit = async (values: TicketTypeFormValues) => {
    // Ensure price is 0 if ticket is free
    if (values.isFree) {
      values.price = 0
    }

    let success = false

    if (editingTicket) {
      // Update existing ticket
      success = await updateTicketType(editingTicket.id, {
        ...values,
        eventId,
      })
    } else {
      // Create new ticket
      success = await createTicketType(eventId, values)
    }

    if (success) {
      setIsDialogOpen(false)
    }
  }

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!ticketToDelete) return

    const success = await deleteTicketType(ticketToDelete.id)

    if (success) {
      setDeleteConfirmOpen(false)
      setTicketToDelete(null)
    }
  }

  // Open edit dialog
  const openEditDialog = (ticket: TicketType) => {
    setEditingTicket(ticket)
    setIsDialogOpen(true)
  }

  // Open delete confirmation
  const openDeleteConfirm = (ticket: TicketType) => {
    setTicketToDelete(ticket)
    setDeleteConfirmOpen(true)
  }

  if (isLoading && ticketTypes.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Ticket Types</CardTitle>
          <CardDescription>Manage ticket types for your event</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Ticket Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTicket ? "Edit Ticket Type" : "Create Ticket Type"}</DialogTitle>
              <DialogDescription>
                {editingTicket ? "Update the details for this ticket type" : "Add a new ticket type for your event"}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. VIP, Early Bird, Standard" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe what this ticket includes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isFree"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Free Ticket</FormLabel>
                        <FormDescription>Is this a free ticket?</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" disabled={isFree} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxPerUser"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Per User</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : editingTicket ? (
                      "Update Ticket Type"
                    ) : (
                      "Create Ticket Type"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {ticketTypes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No ticket types created yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add a ticket type to start selling tickets for your event
            </p>
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Max Per User</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ticketTypes.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{ticket.name}</div>
                        {ticket.description && (
                          <div className="text-sm text-muted-foreground">{ticket.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {ticket.isFree ? <Badge variant="outline">Free</Badge> : `$${ticket.price.toFixed(2)}`}
                    </TableCell>
                    <TableCell>{ticket.quantity}</TableCell>
                    <TableCell>{ticket.maxPerUser || "No limit"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(ticket)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => openDeleteConfirm(ticket)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Ticket Type</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this ticket type? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
