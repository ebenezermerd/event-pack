"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Calendar, ImagePlus, Loader2, MapPin, Upload, AlertCircle, Sparkles } from "lucide-react"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Combobox } from "@/components/ui/combobox"
import { toast } from "@/components/ui/use-toast"
import { useEvents } from "@/contexts/EventContext"
import { useAuth } from "@/contexts/AuthContext"
import { useAIGeneration } from "@/contexts/AIGenerationContext"
import { AIEventActions } from "@/components/ai/ai-event-actions"
import { useRouter as useNextRouter } from "next/router"

// Ethiopian regions for autocomplete
const ethiopianRegions = [
  { label: "Addis Ababa", value: "addis-ababa" },
  { label: "Afar", value: "afar" },
  { label: "Amhara", value: "amhara" },
  { label: "Benishangul-Gumuz", value: "benishangul-gumuz" },
  { label: "Dire Dawa", value: "dire-dawa" },
  { label: "Gambela", value: "gambela" },
  { label: "Harari", value: "harari" },
  { label: "Oromia", value: "oromia" },
  { label: "Sidama", value: "sidama" },
  { label: "Somali", value: "somali" },
  { label: "South West Ethiopia", value: "south-west-ethiopia" },
  { label: "Southern Nations, Nationalities, and Peoples' Region (SNNPR)", value: "snnpr" },
  { label: "Tigray", value: "tigray" },
]

// Zod schemas for each tab
const detailsSchema = z
  .object({
    title: z.string().min(5, { message: "Title must be at least 5 characters" }),
    caption: z.string().optional(),
    description: z.string().min(50, { message: "Description must be at least 50 characters" }),
    type: z.string({ required_error: "Please select an event type" }),
    startDate: z.date({ required_error: "Start date is required" }),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Please enter a valid time" }),
    endDate: z.date({ required_error: "End date is required" }),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Please enter a valid time" }),
    capacity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Capacity must be a positive number",
    }),
  })
  .refine(
    (data) => {
      // Create Date objects for start and end dates with their respective times
      const startDateTime = new Date(
        `${data.startDate.getFullYear()}-${data.startDate.getMonth() + 1}-${data.startDate.getDate()} ${data.startTime}`,
      )
      const endDateTime = new Date(
        `${data.endDate.getFullYear()}-${data.endDate.getMonth() + 1}-${data.endDate.getDate()} ${data.endTime}`,
      )

      // Check if end date is after start date
      return endDateTime > startDateTime
    },
    {
      message: "End date and time must be after start date and time",
      path: ["endDate"],
    },
  )

const mediaLocationSchema = z.object({
  coverImage: z.string().optional(),
  eventImages: z.array(z.string()).optional(),
  location: z.string().min(5, { message: "Location must be at least 5 characters" }),
  region: z.string({ required_error: "Please select a region" }),
  city: z.string().min(2, { message: "City must be at least 2 characters" }),
  venue: z.string().min(2, { message: "Venue must be at least 2 characters" }),
})

const ticketsSchema = z
  .object({
    isPaid: z.boolean(),
    ticketPrice: z
      .string()
      .optional()
      .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
        message: "Price must be a valid number",
      }),
    ticketName: z.string().optional(),
    ticketDescription: z.string().optional(),
    documents: z.array(z.string()).optional(),
    additionalInfo: z.string().optional(),
  })
  .refine(
    (data) => {
      // If isPaid is true, then ticketPrice, ticketName, and ticketDescription are required
      if (data.isPaid) {
        return !!data.ticketPrice && !!data.ticketName && !!data.ticketDescription
      }
      return true
    },
    {
      message: "Ticket details are required for paid events",
      path: ["ticketPrice"],
    },
  )

// Combined schema
const eventSchema = z.object({
  details: detailsSchema,
  mediaLocation: mediaLocationSchema,
  tickets: ticketsSchema,
})

type EventFormValues = z.infer<typeof eventSchema>

export default function CreateEventPage() {
  const [activeTab, setActiveTab] = useState("details")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [eventImages, setEventImages] = useState<string[]>([])
  const [documents, setDocuments] = useState<string[]>([])
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const nextRouter = useNextRouter()
  const searchParams = useSearchParams()
  const { createEvent, isLoading } = useEvents()
  const { isAuthenticated, role } = useAuth()
  const { generatedTemplate } = useAIGeneration()

  // Initialize the form with default values
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      details: {
        title: "",
        caption: "",
        description: "",
        type: "",
        startDate: undefined,
        startTime: "",
        endDate: undefined,
        endTime: "",
        capacity: "",
      },
      mediaLocation: {
        coverImage: "",
        eventImages: [],
        location: "",
        region: "",
        city: "",
        venue: "",
      },
      tickets: {
        isPaid: false,
        ticketPrice: "",
        ticketName: "",
        ticketDescription: "",
        documents: [],
        additionalInfo: "",
      },
    },
    mode: "onChange",
  })

  // Apply generated template to form when available
  useEffect(() => {
    if (generatedTemplate && searchParams.get("useTemplate") === "true") {
      // Set details
      form.setValue("details.title", generatedTemplate.title)
      form.setValue("details.caption", generatedTemplate.caption)
      form.setValue("details.description", generatedTemplate.description)

      // Set default dates if not already set
      const today = new Date()
      const nextMonth = new Date()
      nextMonth.setMonth(today.getMonth() + 1)

      if (!form.getValues("details.startDate")) {
        form.setValue("details.startDate", nextMonth)
      }

      if (!form.getValues("details.startTime")) {
        form.setValue("details.startTime", "10:00")
      }

      if (!form.getValues("details.endDate")) {
        const endDate = new Date(nextMonth)
        endDate.setDate(endDate.getDate() + 1)
        form.setValue("details.endDate", endDate)
      }

      if (!form.getValues("details.endTime")) {
        form.setValue("details.endTime", "17:00")
      }

      // Set ticket information if available
      if (generatedTemplate.ticketTypes && generatedTemplate.ticketTypes.length > 0) {
        const firstTicket = generatedTemplate.ticketTypes[0]
        form.setValue("tickets.ticketName", firstTicket.name)
        form.setValue("tickets.ticketDescription", firstTicket.description)

        if (firstTicket.price) {
          form.setValue("tickets.isPaid", true)
          form.setValue("tickets.ticketPrice", firstTicket.price.toString())
        }
      }

      // Trigger validation
      form.trigger()

      toast({
        title: "Template Applied",
        description: "The AI-generated content has been applied to your form.",
      })
    }
  }, [generatedTemplate, form, searchParams])

  // Get form state
  const { formState } = form
  const detailsValid = !formState.errors.details
  const mediaLocationValid = !formState.errors.mediaLocation
  const ticketsValid = !formState.errors.tickets

  // Handle tab change
  const handleTabChange = (value: string) => {
    // Validate current tab before allowing change
    if (value === "media" && !detailsValid) {
      form.trigger("details")
      return
    }

    if (value === "tickets" && (!detailsValid || !mediaLocationValid)) {
      if (!detailsValid) {
        form.trigger("details")
        setActiveTab("details")
      } else {
        form.trigger("mediaLocation")
      }
      return
    }

    setActiveTab(value)
  }

  // Handle form submission
  const onSubmit = async (data: EventFormValues) => {
    setIsSubmitting(true)
    setSubmissionError(null)

    try {
      // Combine all form data
      const eventData = {
        title: data.details.title,
        caption: data.details.caption || "",
        description: data.details.description,
        startDate: new Date(`${format(data.details.startDate, "yyyy-MM-dd")}T${data.details.startTime}`).toISOString(),
        endDate: new Date(`${format(data.details.endDate, "yyyy-MM-dd")}T${data.details.endTime}`).toISOString(),
        location: `${data.mediaLocation.venue}, ${data.mediaLocation.city}, ${data.mediaLocation.region}`,
        capacity: Number.parseInt(data.details.capacity),
        isFree: !data.tickets.isPaid,
        price: data.tickets.isPaid ? Number.parseFloat(data.tickets.ticketPrice || "0") : 0,
        image: coverImage || "",
        images: eventImages,
      }

      // Use the createEvent function from the context
      const success = await createEvent(eventData)

      if (success) {
        // Redirect to events list on success
        nextRouter.push("/dashboard/organizer/events")
      }
    } catch (error) {
      console.error("Event creation error:", error)

      // Set error state
      setSubmissionError(error instanceof Error ? error.message : "Failed to create event. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // In a real implementation, you would upload the file to a server
      // For now, create a local preview URL
      const previewUrl = URL.createObjectURL(file)
      setCoverImage(previewUrl)
      form.setValue("mediaLocation.coverImage", previewUrl)

      // Store the file for later upload during form submission
      // In a production app, you would implement a proper file upload service
      // setUploadFiles(prev => ({ ...prev, coverImage: file }));
    }
  }

  const handleEventImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Create a local preview URL
      const previewUrl = URL.createObjectURL(file)
      const newImages = [...eventImages, previewUrl]
      setEventImages(newImages)
      form.setValue("mediaLocation.eventImages", newImages)

      // Store the file for later upload
      // In a production app, you would implement a proper file upload service
      // setUploadFiles(prev => ({ ...prev, eventImages: [...prev.eventImages, file] }));
    }
  }

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Store the document name
      const newDocuments = [...documents, file.name]
      setDocuments(newDocuments)
      form.setValue("tickets.documents", newDocuments)

      // Store the file for later upload
      // In a production app, you would implement a proper file upload service
      // setUploadFiles(prev => ({ ...prev, documents: [...prev.documents, file] }));
    }
  }

  // Check if user is logged in and is an organizer
  useEffect(() => {
    if (!isAuthenticated || role !== "organizer") {
      toast({
        title: "Access Denied",
        description: "You must be logged in as an organizer to create events.",
        variant: "destructive",
      })
      nextRouter.push("/login")
    }
  }, [isAuthenticated, role, nextRouter])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Event</h1>
          <p className="text-muted-foreground">Fill in the details to create a new event</p>
        </div>

        <AIEventActions showSave={true} />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Event Details</TabsTrigger>
              <TabsTrigger value="media" disabled={!detailsValid}>
                Media & Location
              </TabsTrigger>
              <TabsTrigger value="tickets" disabled={!detailsValid || !mediaLocationValid}>
                Tickets & Documents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Enter the basic details about your event</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!detailsValid && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        Please fill in all required fields correctly before proceeding to the next section.
                      </AlertDescription>
                    </Alert>
                  )}

                  {generatedTemplate && (
                    <Alert className="bg-muted/50 border-primary/20">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <AlertTitle>AI-Generated Content</AlertTitle>
                      <AlertDescription>
                        This form has been pre-filled with AI-generated content. Feel free to edit any details.
                      </AlertDescription>
                    </Alert>
                  )}

                  <FormField
                    control={form.control}
                    name="details.title"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel htmlFor="title">Event Title</FormLabel>
                        <FormControl>
                          <Input id="title" placeholder="Enter event title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="details.caption"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel htmlFor="caption">Event Caption</FormLabel>
                        <FormControl>
                          <Input id="caption" placeholder="A short catchy caption for your event" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="details.description"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel htmlFor="description">Event Description</FormLabel>
                        <FormControl>
                          <Textarea
                            id="description"
                            placeholder="Describe your event in detail"
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="details.type"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel htmlFor="type">Event Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger id="type">
                              <SelectValue placeholder="Select event type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="conference">Conference</SelectItem>
                            <SelectItem value="workshop">Workshop</SelectItem>
                            <SelectItem value="concert">Concert</SelectItem>
                            <SelectItem value="exhibition">Exhibition</SelectItem>
                            <SelectItem value="festival">Festival</SelectItem>
                            <SelectItem value="networking">Networking</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="details.startDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Start Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !field.value && "text-muted-foreground",
                                    )}
                                  >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <CalendarComponent
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="details.startTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <Input type="time" className="w-full" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="details.endDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>End Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !field.value && "text-muted-foreground",
                                    )}
                                  >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <CalendarComponent
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="details.endTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Time</FormLabel>
                            <FormControl>
                              <Input type="time" className="w-full" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="details.capacity"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel htmlFor="capacity">Event Capacity</FormLabel>
                        <FormControl>
                          <Input id="capacity" type="number" placeholder="Maximum number of attendees" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button">
                    Save as Draft
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      form.trigger("details").then((isValid) => {
                        if (isValid) setActiveTab("media")
                      })
                    }}
                  >
                    Next: Media & Location
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="media">
              <Card>
                <CardHeader>
                  <CardTitle>Media & Location</CardTitle>
                  <CardDescription>Upload images and set the location for your event</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!mediaLocationValid && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        Please fill in all required fields correctly before proceeding to the next section.
                      </AlertDescription>
                    </Alert>
                  )}

                  <FormField
                    control={form.control}
                    name="mediaLocation.coverImage"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Cover Image</FormLabel>
                        <FormControl>
                          <div className="border-2 border-dashed rounded-lg p-4 text-center">
                            {coverImage ? (
                              <div className="relative">
                                <img
                                  src={coverImage || "/placeholder.svg"}
                                  alt="Cover preview"
                                  className="mx-auto h-[200px] object-cover rounded-md"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-2 right-2"
                                  onClick={() => {
                                    setCoverImage(null)
                                    field.onChange("")
                                  }}
                                >
                                  Remove
                                </Button>
                              </div>
                            ) : (
                              <div className="py-8">
                                <ImagePlus className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground mb-2">Drag and drop or click to upload</p>
                                <p className="text-xs text-muted-foreground mb-4">
                                  Recommended size: 1200 x 630 pixels
                                </p>
                                <Input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  id="cover-upload"
                                  onChange={(e) => {
                                    handleCoverImageUpload(e)
                                    field.onChange("/placeholder.svg?height=300&width=600&text=Event+Cover")
                                  }}
                                />
                                <Button type="button" onClick={() => document.getElementById("cover-upload")?.click()}>
                                  Select Image
                                </Button>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mediaLocation.eventImages"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Event Images (up to 5)</FormLabel>
                        <FormControl>
                          <div className="border-2 border-dashed rounded-lg p-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                              {eventImages.map((img, index) => (
                                <div key={index} className="relative">
                                  <img
                                    src={img || "/placeholder.svg"}
                                    alt={`Event image ${index + 1}`}
                                    className="h-[120px] w-full object-cover rounded-md"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-1 right-1 h-6 w-6"
                                    onClick={() => {
                                      const newImages = eventImages.filter((_, i) => i !== index)
                                      setEventImages(newImages)
                                      field.onChange(newImages)
                                    }}
                                  >
                                    ✕
                                  </Button>
                                </div>
                              ))}

                              {eventImages.length < 5 && (
                                <div
                                  className="h-[120px] border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                                  onClick={() => document.getElementById("images-upload")?.click()}
                                >
                                  <ImagePlus className="h-8 w-8 text-muted-foreground mb-1" />
                                  <span className="text-xs text-muted-foreground">Add Image</span>
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="images-upload"
                                    onChange={(e) => {
                                      handleEventImageUpload(e)
                                      const newImages = [
                                        ...eventImages,
                                        "/placeholder.svg?height=200&width=300&text=Event+Image",
                                      ]
                                      field.onChange(newImages)
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground text-center">
                              Add up to 5 images to showcase your event
                            </p>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <FormField
                    control={form.control}
                    name="mediaLocation.location"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel htmlFor="location">Event Location</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input id="location" placeholder="Enter event location" className="flex-1" {...field} />
                          </FormControl>
                          <Button type="button" variant="outline" className="flex gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>Map</span>
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="mediaLocation.region"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel htmlFor="region">Region</FormLabel>
                          <FormControl>
                            <Combobox
                              options={ethiopianRegions}
                              value={field.value}
                              onChange={(value) => {
                                field.onChange(value)
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="mediaLocation.city"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel htmlFor="city">City</FormLabel>
                          <FormControl>
                            <Input id="city" placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="mediaLocation.venue"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel htmlFor="venue">Venue</FormLabel>
                        <FormControl>
                          <Input id="venue" placeholder="Venue name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("details")}>
                    Back: Event Details
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      form.trigger("mediaLocation").then((isValid) => {
                        if (isValid) setActiveTab("tickets")
                      })
                    }}
                  >
                    Next: Tickets & Documents
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="tickets">
              <Card>
                <CardHeader>
                  <CardTitle>Tickets & Documents</CardTitle>
                  <CardDescription>Set up ticket information and upload required documents</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!ticketsValid && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        Please fill in all required fields correctly before submitting.
                      </AlertDescription>
                    </Alert>
                  )}

                  {submissionError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Submission Error</AlertTitle>
                      <AlertDescription>{submissionError}</AlertDescription>
                    </Alert>
                  )}

                  <FormField
                    control={form.control}
                    name="tickets.isPaid"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel htmlFor="paid-event">Paid Event</FormLabel>
                          <FormDescription>Toggle if this is a paid event</FormDescription>
                        </div>
                        <FormControl>
                          <Switch id="paid-event" checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch("tickets.isPaid") && (
                    <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                      <FormField
                        control={form.control}
                        name="tickets.ticketPrice"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel htmlFor="ticket-price">Ticket Price (ETB)</FormLabel>
                            <FormControl>
                              <Input id="ticket-price" type="number" placeholder="0.00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tickets.ticketName"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel htmlFor="ticket-name">Ticket Name</FormLabel>
                            <FormControl>
                              <Input id="ticket-name" placeholder="e.g., General Admission" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tickets.ticketDescription"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel htmlFor="ticket-description">Ticket Description</FormLabel>
                            <FormControl>
                              <Textarea
                                id="ticket-description"
                                placeholder="Describe what's included with this ticket"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <Separator />

                  <FormField
                    control={form.control}
                    name="tickets.documents"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Event Documents</FormLabel>
                        <FormDescription>Upload any documents required for event verification</FormDescription>
                        <FormControl>
                          <div className="border-2 border-dashed rounded-lg p-6 text-center">
                            {documents.length > 0 ? (
                              <div className="space-y-2">
                                {documents.map((doc, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between bg-muted/50 p-2 rounded"
                                  >
                                    <span>{doc}</span>
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => {
                                        const newDocs = documents.filter((_, i) => i !== index)
                                        setDocuments(newDocs)
                                        field.onChange(newDocs)
                                      }}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <>
                                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground mb-2">
                                  Drag and drop or click to upload documents
                                </p>
                                <p className="text-xs text-muted-foreground mb-4">
                                  Accepted formats: PDF, DOC, DOCX (Max 5MB)
                                </p>
                                <Input
                                  type="file"
                                  accept=".pdf,.doc,.docx"
                                  className="hidden"
                                  id="document-upload"
                                  onChange={(e) => {
                                    handleDocumentUpload(e)
                                    const newDocs = [...documents, "document.pdf"]
                                    field.onChange(newDocs)
                                  }}
                                />
                                <Button
                                  type="button"
                                  onClick={() => document.getElementById("document-upload")?.click()}
                                >
                                  Select Documents
                                </Button>
                              </>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tickets.additionalInfo"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel htmlFor="additional-info">Additional Information</FormLabel>
                        <FormControl>
                          <Textarea
                            id="additional-info"
                            placeholder="Any additional information about your event"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("media")}>
                    Back: Media & Location
                  </Button>
                  <Button type="submit" disabled={isLoading || isSubmitting}>
                    {(isLoading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Event
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  )
}
