"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import {
  Mail,
  Phone,
  MessageSquare,
  HelpCircle,
  MapPin,
  Clock,
  Send,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  CheckCircle2,
  ChevronRight,
} from "lucide-react"

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    userType: "",
    message: "",
    submitted: false,
    loading: false,
  })

  const [selectedUserType, setSelectedUserType] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState((prev) => ({ ...prev, loading: true }))

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setFormState((prev) => ({
      ...prev,
      loading: false,
      submitted: true,
    }))
  }

  return (
    <>
      <SiteHeader />
      <main className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="relative w-full bg-gradient-to-r from-primary-600/90 to-primary-800/90 py-16 overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10 bg-[length:20px_20px] opacity-10"></div>
          <div className="container relative z-10 mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Get in Touch</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
              We're here to help—reach us however you like.
            </p>
            <div className="flex flex-wrap justify-center gap-6 max-w-3xl mx-auto">
              <Card className="flex-1 min-w-[240px] bg-white/10 border-white/20 backdrop-blur-sm text-white hover:bg-white/20 transition-colors">
                <CardHeader className="pb-2">
                  <Mail className="h-6 w-6 mb-2" />
                  <CardTitle className="text-lg">Email Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <a href="mailto:support@eventease.com" className="text-white/80 hover:text-white">
                    support@eventease.com
                  </a>
                </CardContent>
              </Card>
              <Card className="flex-1 min-w-[240px] bg-white/10 border-white/20 backdrop-blur-sm text-white hover:bg-white/20 transition-colors">
                <CardHeader className="pb-2">
                  <Phone className="h-6 w-6 mb-2" />
                  <CardTitle className="text-lg">Call Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <a href="tel:+251911234567" className="text-white/80 hover:text-white">
                    +251 911 234 567
                  </a>
                </CardContent>
              </Card>
              <Card className="flex-1 min-w-[240px] bg-white/10 border-white/20 backdrop-blur-sm text-white hover:bg-white/20 transition-colors">
                <CardHeader className="pb-2">
                  <MessageSquare className="h-6 w-6 mb-2" />
                  <CardTitle className="text-lg">Live Chat</CardTitle>
                </CardHeader>
                <CardContent>
                  <button className="text-white/80 hover:text-white">Start a conversation</button>
                </CardContent>
              </Card>
              <Card className="flex-1 min-w-[240px] bg-white/10 border-white/20 backdrop-blur-sm text-white hover:bg-white/20 transition-colors">
                <CardHeader className="pb-2">
                  <HelpCircle className="h-6 w-6 mb-2" />
                  <CardTitle className="text-lg">Help Center</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href="/help" className="text-white/80 hover:text-white">
                    Browse our knowledge base
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Form & Map Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div>
                <h2 className="text-3xl font-bold mb-6">Send Us a Message</h2>
                <p className="text-muted-foreground mb-8">
                  Fill out the form below and our team will get back to you as soon as possible.
                </p>

                {formState.submitted ? (
                  <Card className="bg-primary-50 dark:bg-primary-950/20 border-primary-200 dark:border-primary-800">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <CheckCircle2 className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                        <p className="text-muted-foreground mb-6">
                          Thank you for reaching out. We'll get back to you shortly.
                        </p>
                        <Button onClick={() => setFormState((prev) => ({ ...prev, submitted: false }))}>
                          Send Another Message
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          required
                          value={formState.name}
                          onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@example.com"
                          required
                          value={formState.email}
                          onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="How can we help you?"
                        required
                        value={formState.subject}
                        onChange={(e) => setFormState((prev) => ({ ...prev, subject: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>I'm a...</Label>
                      <RadioGroup
                        value={selectedUserType}
                        onValueChange={(value) => {
                          setSelectedUserType(value)
                          setFormState((prev) => ({ ...prev, userType: value }))
                        }}
                        className="flex flex-wrap gap-6"
                      >
                        {["User", "Organizer", "Admin", "Partner"].map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <RadioGroupItem value={type.toLowerCase()} id={`user-type-${type.toLowerCase()}`} />
                            <Label htmlFor={`user-type-${type.toLowerCase()}`}>{type}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {selectedUserType === "organizer" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="event-type">Event Type</Label>
                          <Select>
                            <SelectTrigger id="event-type">
                              <SelectValue placeholder="Select event type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="conference">Conference</SelectItem>
                              <SelectItem value="concert">Concert</SelectItem>
                              <SelectItem value="workshop">Workshop</SelectItem>
                              <SelectItem value="exhibition">Exhibition</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="attendees">Expected Attendees</Label>
                          <Select>
                            <SelectTrigger id="attendees">
                              <SelectValue placeholder="Select range" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Less than 50</SelectItem>
                              <SelectItem value="medium">50-200</SelectItem>
                              <SelectItem value="large">201-500</SelectItem>
                              <SelectItem value="xlarge">More than 500</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Please provide details about your inquiry..."
                        rows={5}
                        required
                        value={formState.message}
                        onChange={(e) => setFormState((prev) => ({ ...prev, message: e.target.value }))}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="consent" className="rounded border-gray-300" required />
                      <Label htmlFor="consent" className="text-sm text-muted-foreground">
                        I agree to the processing of my personal data in accordance with the{" "}
                        <Link href="/privacy" className="text-primary-600 hover:underline">
                          Privacy Policy
                        </Link>
                        .
                      </Label>
                    </div>

                    <Button type="submit" className="w-full" disabled={formState.loading}>
                      {formState.loading ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="h-4 w-4" />
                          Send Message
                        </span>
                      )}
                    </Button>
                  </form>
                )}
              </div>

              {/* Map & Info */}
              <div className="space-y-8">
                <div className="rounded-lg overflow-hidden border border-border h-[400px] relative">
                  <div className="absolute inset-0 bg-muted flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                      <p className="text-lg font-medium">Interactive Map Coming Soon</p>
                      <p className="text-muted-foreground">Our office locations will be displayed here</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-4">Our Locations</h3>
                    <div className="space-y-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Addis Ababa Headquarters</CardTitle>
                          <CardDescription>Main Office</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-primary-600 mt-1" />
                            <p className="text-muted-foreground">
                              Bole Road, Friendship Building, 4th Floor
                              <br />
                              Addis Ababa, Ethiopia
                            </p>
                          </div>
                          <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-primary-600 mt-1" />
                            <div>
                              <p className="text-muted-foreground">Monday - Friday: 9:00 AM - 6:00 PM</p>
                              <p className="text-muted-foreground">Saturday: 10:00 AM - 2:00 PM</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Bahir Dar Office</CardTitle>
                          <CardDescription>Regional Office</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-primary-600 mt-1" />
                            <p className="text-muted-foreground">
                              Piazza Area, Blue Building, 2nd Floor
                              <br />
                              Bahir Dar, Ethiopia
                            </p>
                          </div>
                          <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-primary-600 mt-1" />
                            <div>
                              <p className="text-muted-foreground">Monday - Friday: 9:00 AM - 5:00 PM</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-4">Support Hours & Response Times</h3>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-primary-600 mt-1" />
                            <div>
                              <p className="font-medium">Customer Support Hours</p>
                              <p className="text-muted-foreground">Monday - Friday: 8:00 AM - 8:00 PM EAT</p>
                              <p className="text-muted-foreground">Saturday: 9:00 AM - 5:00 PM EAT</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Mail className="h-5 w-5 text-primary-600 mt-1" />
                            <div>
                              <p className="font-medium">Email Response Time</p>
                              <p className="text-muted-foreground">Typically within 2 business hours</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <MessageSquare className="h-5 w-5 text-primary-600 mt-1" />
                            <div>
                              <p className="font-medium">Live Chat Support</p>
                              <p className="text-muted-foreground">Available during business hours</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">Frequently Asked Questions</h2>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
              Find quick answers to common questions about EventEase.
            </p>

            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                {[
                  {
                    question: "How do I create an event on EventEase?",
                    answer:
                      "To create an event, sign up as an organizer, navigate to your dashboard, and click on 'Create Event'. Follow the step-by-step process to set up your event details, ticketing, and promotion.",
                  },
                  {
                    question: "What payment methods are supported?",
                    answer:
                      "EventEase supports various payment methods including Chapa, mobile money, and bank transfers. We're constantly adding new payment options to make transactions easier for both organizers and attendees.",
                  },
                  {
                    question: "How can I become an event organizer?",
                    answer:
                      "To become an organizer, register for an account and select 'Organizer' during signup. Complete your profile with the required information, and our team will review your application within 24-48 hours.",
                  },
                  {
                    question: "Is there a fee for using EventEase?",
                    answer:
                      "EventEase operates on a tiered pricing model. We offer a free basic plan for small events, and premium plans for larger events with more features. Each ticket sale includes a small service fee that helps us maintain and improve the platform.",
                  },
                  {
                    question: "How do I contact support if I have an issue?",
                    answer:
                      "You can reach our support team through email at support@eventease.com, via live chat on our website during business hours, or by phone at +251 911 234 567. We aim to respond to all inquiries within 2 business hours.",
                  },
                ].map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <div className="mt-8 text-center">
                <Link href="/help" className="text-primary-600 hover:underline inline-flex items-center">
                  Visit our Help Center for more answers
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Social Media & Newsletter Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold mb-6">Connect With Us</h2>
                <p className="text-muted-foreground mb-8">
                  Follow us on social media for the latest updates, event highlights, and community news.
                </p>
                <div className="flex flex-wrap gap-4">
                  {[
                    { icon: <Linkedin className="h-5 w-5" />, label: "LinkedIn", href: "#" },
                    { icon: <Twitter className="h-5 w-5" />, label: "Twitter", href: "#" },
                    { icon: <Facebook className="h-5 w-5" />, label: "Facebook", href: "#" },
                    { icon: <Instagram className="h-5 w-5" />, label: "Instagram", href: "#" },
                    { icon: <Youtube className="h-5 w-5" />, label: "YouTube", href: "#" },
                  ].map((social, index) => (
                    <Button key={index} variant="outline" className="flex items-center gap-2" asChild>
                      <a href={social.href} target="_blank" rel="noopener noreferrer">
                        {social.icon}
                        <span>{social.label}</span>
                      </a>
                    </Button>
                  ))}
                </div>

                <div className="mt-12">
                  <h3 className="text-xl font-bold mb-4">Join Our Community</h3>
                  <p className="text-muted-foreground mb-4">
                    Connect with other event organizers and attendees in our growing community.
                  </p>
                  <Button className="flex items-center gap-2" asChild>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      <MessageSquare className="h-5 w-5" />
                      <span>Join Our Discord</span>
                    </a>
                  </Button>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-6">Stay Updated</h2>
                <p className="text-muted-foreground mb-8">
                  Subscribe to our newsletter for the latest features, tips, and event inspiration.
                </p>
                <Card>
                  <CardContent className="pt-6">
                    <form className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="newsletter-email">Email Address</Label>
                        <div className="flex gap-2">
                          <Input id="newsletter-email" type="email" placeholder="your.email@example.com" required />
                          <Button type="submit">Subscribe</Button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="newsletter-consent" className="rounded border-gray-300" required />
                        <Label htmlFor="newsletter-consent" className="text-sm text-muted-foreground">
                          I agree to receive marketing emails and can unsubscribe at any time.
                        </Label>
                      </div>
                    </form>

                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-medium mb-2">What to expect:</h4>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary-600 mt-0.5" />
                          <span>Monthly newsletter with event trends</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary-600 mt-0.5" />
                          <span>New feature announcements</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary-600 mt-0.5" />
                          <span>Tips for successful events</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary-600 mt-0.5" />
                          <span>Exclusive promotions and offers</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-muted/50 py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <h3 className="text-lg font-bold mb-4">EventEase</h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  A mobile-first event management platform for discovering, creating, and attending events across
                  Ethiopia.
                </p>
                <div className="flex space-x-4">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Linkedin className="h-5 w-5" />
                    <span className="sr-only">LinkedIn</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Twitter className="h-5 w-5" />
                    <span className="sr-only">Twitter</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Facebook className="h-5 w-5" />
                    <span className="sr-only">Facebook</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Instagram className="h-5 w-5" />
                    <span className="sr-only">Instagram</span>
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  {[
                    { label: "Home", href: "/" },
                    { label: "About Us", href: "/about" },
                    { label: "Events", href: "/events" },
                    { label: "Pricing", href: "/pricing" },
                    { label: "Contact", href: "/contact" },
                  ].map((link, index) => (
                    <li key={index}>
                      <Link href={link.href} className="text-muted-foreground hover:text-foreground">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4">Legal</h3>
                <ul className="space-y-2">
                  {[
                    { label: "Terms of Service", href: "/terms" },
                    { label: "Privacy Policy", href: "/privacy" },
                    { label: "Cookie Policy", href: "/cookies" },
                    { label: "Security", href: "/security" },
                  ].map((link, index) => (
                    <li key={index}>
                      <Link href={link.href} className="text-muted-foreground hover:text-foreground">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Separator className="my-8" />

            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} EventEase. All rights reserved.
              </p>
              <p className="text-sm text-muted-foreground mt-2 md:mt-0">Version 1.0.0 | Made with ❤️ in Ethiopia</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
