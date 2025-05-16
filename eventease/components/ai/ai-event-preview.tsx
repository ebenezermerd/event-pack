"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Eye, Calendar, MapPin, HelpCircle, Clock } from "lucide-react"
import { useAIGeneration } from "@/contexts/AIGenerationContext"
import { SaveTemplateDialog } from "./save-template-dialog"

interface AIEventPreviewProps {
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  buttonSize?: "default" | "sm" | "lg" | "icon"
  buttonText?: string
  className?: string
}

export function AIEventPreview({
  buttonVariant = "outline",
  buttonSize = "default",
  buttonText = "Preview Generated Event",
  className,
}: AIEventPreviewProps) {
  const { generatedTemplate } = useAIGeneration()
  const [open, setOpen] = useState(false)

  if (!generatedTemplate) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} className={className}>
          <Eye className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI-Generated Event Preview</DialogTitle>
          <DialogDescription>Preview the AI-generated event content before using it</DialogDescription>
        </DialogHeader>

        <div className="flex justify-end mt-2 mb-4">
          <SaveTemplateDialog buttonVariant="outline" onSaved={() => setOpen(false)} />
        </div>

        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="faqs">FAQs</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{generatedTemplate.title}</CardTitle>
                <CardDescription>{generatedTemplate.caption}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">{generatedTemplate.description}</p>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-1">Detailed Description</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {generatedTemplate.longDescription}
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Date & Time
                    </h4>
                    <p className="text-sm text-muted-foreground">To be determined</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      Location
                    </h4>
                    <p className="text-sm text-muted-foreground">To be determined</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {generatedTemplate.suggestedImages && generatedTemplate.suggestedImages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Suggested Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {generatedTemplate.suggestedImages.map((image, index) => (
                      <div key={index} className="p-3 bg-muted rounded-md">
                        <h4 className="text-sm font-medium mb-1">Image {index + 1}</h4>
                        <p className="text-sm text-muted-foreground">{image.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="schedule" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Event Schedule</CardTitle>
                <CardDescription>Timeline of activities for this event</CardDescription>
              </CardHeader>
              <CardContent>
                {generatedTemplate.schedule && generatedTemplate.schedule.length > 0 ? (
                  <div className="space-y-4">
                    {generatedTemplate.schedule.map((item, index) => (
                      <div
                        key={index}
                        className="relative pl-6 pb-4 border-l border-muted-foreground/20 last:border-0 last:pb-0"
                      >
                        <div className="absolute left-0 top-0 -translate-x-1/2 w-2 h-2 rounded-full bg-primary" />
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-medium">{item.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                          </div>
                          <Badge variant="outline" className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {item.time}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No schedule items generated</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ticket Types</CardTitle>
                <CardDescription>Available ticket options for this event</CardDescription>
              </CardHeader>
              <CardContent>
                {generatedTemplate.ticketTypes && generatedTemplate.ticketTypes.length > 0 ? (
                  <div className="space-y-4">
                    {generatedTemplate.ticketTypes.map((ticket, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-medium">{ticket.name}</h4>
                          {ticket.price ? (
                            <Badge>ETB {ticket.price}</Badge>
                          ) : (
                            <Badge variant="outline">Price TBD</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{ticket.description}</p>

                        {ticket.benefits && ticket.benefits.length > 0 && (
                          <div className="mt-3">
                            <h5 className="text-xs font-medium mb-1">Benefits:</h5>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {ticket.benefits.map((benefit, i) => (
                                <li key={i} className="flex items-start">
                                  <span className="mr-2">•</span>
                                  <span>{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No ticket types generated</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faqs" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Frequently Asked Questions</CardTitle>
                <CardDescription>Common questions about this event</CardDescription>
              </CardHeader>
              <CardContent>
                {generatedTemplate.faqs && generatedTemplate.faqs.length > 0 ? (
                  <div className="space-y-4">
                    {generatedTemplate.faqs.map((faq, index) => (
                      <div key={index} className="space-y-1.5">
                        <h4 className="text-sm font-medium flex items-start">
                          <HelpCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{faq.question}</span>
                        </h4>
                        <p className="text-sm text-muted-foreground pl-6">{faq.answer}</p>
                        {index < generatedTemplate.faqs.length - 1 && <Separator className="mt-3" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No FAQs generated</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
