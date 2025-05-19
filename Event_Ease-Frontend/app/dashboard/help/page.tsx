import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Search, HelpCircle, FileText, MessageSquare, Mail } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-muted-foreground">Get help with EventEase platform</p>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search for help articles..." className="pl-8" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="flex flex-col items-center text-center p-6">
          <HelpCircle className="h-10 w-10 text-primary mb-4" />
          <h3 className="text-lg font-medium mb-2">FAQs</h3>
          <p className="text-sm text-muted-foreground mb-4">Find answers to commonly asked questions</p>
          <Button variant="outline" className="mt-auto">
            View FAQs
          </Button>
        </Card>
        <Card className="flex flex-col items-center text-center p-6">
          <FileText className="h-10 w-10 text-primary mb-4" />
          <h3 className="text-lg font-medium mb-2">Documentation</h3>
          <p className="text-sm text-muted-foreground mb-4">Explore our detailed platform documentation</p>
          <Button variant="outline" className="mt-auto">
            Read Docs
          </Button>
        </Card>
        <Card className="flex flex-col items-center text-center p-6">
          <MessageSquare className="h-10 w-10 text-primary mb-4" />
          <h3 className="text-lg font-medium mb-2">Live Chat</h3>
          <p className="text-sm text-muted-foreground mb-4">Chat with our support team in real-time</p>
          <Button className="mt-auto">Start Chat</Button>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Quick answers to common questions</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I create an event?</AccordionTrigger>
              <AccordionContent>
                To create an event, navigate to the "My Events" section in your organizer dashboard and click on the
                "Create Event" button. Fill in the required information about your event including title, date,
                location, and ticket types.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How do I manage ticket sales?</AccordionTrigger>
              <AccordionContent>
                You can manage ticket sales through the "Tickets" section in your organizer dashboard. Here you can
                create different ticket types, set prices, track sales, and manage availability.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>How are payments processed?</AccordionTrigger>
              <AccordionContent>
                EventEase supports multiple payment methods including Telebirr, bank transfers, and credit cards.
                Payments are securely processed and funds are transferred to your account after the event, minus the
                platform fee.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>What is the event approval process?</AccordionTrigger>
              <AccordionContent>
                After creating an event, it will be reviewed by our team to ensure it meets our community guidelines.
                This typically takes 24-48 hours. Once approved, your event will be published and visible to attendees
                on the platform.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>How do I access event analytics?</AccordionTrigger>
              <AccordionContent>
                Event analytics are available in the "Analytics" section of your organizer dashboard. Here you can view
                detailed information about ticket sales, attendee demographics, marketing performance, and more to help
                you optimize your events.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
          <CardDescription>Get in touch with our support team</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium">
                Subject
              </label>
              <Input id="subject" placeholder="What do you need help with?" />
            </div>
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Message
              </label>
              <Textarea id="message" placeholder="Describe your issue in detail..." className="min-h-[150px]" />
            </div>
            <Button className="gap-2">
              <Mail className="h-4 w-4" />
              Send Message
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
