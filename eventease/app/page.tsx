import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, BarChart3, Shield, Users, Zap, CalendarDays, Clock, ArrowRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section - Enhanced with better dark mode support */}
        <section className="relative w-full overflow-hidden py-24 md:py-36">
          {/* Background gradient - optimized for dark mode */}
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--hero-bg-from))] via-[hsl(var(--hero-bg-via))] to-[hsl(var(--hero-bg-to))] opacity-95 -z-10"></div>

          {/* Geometric background patterns */}
          <div className="absolute inset-0 -z-10 opacity-10">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#smallGrid)" />
            </svg>
          </div>

          {/* Decorative circles with improved glow effects */}
          <div className="absolute top-0 right-0 w-full h-full overflow-hidden -z-5">
            <div className="absolute top-[10%] right-[5%] w-72 h-72 rounded-full bg-gradient-to-br from-secondary/40 to-purple-300/10 dark:from-secondary/20 dark:to-purple-600/10 blur-2xl animate-pulse-slow"></div>
            <div className="absolute bottom-[20%] left-[10%] w-40 h-40 rounded-full bg-gradient-to-tr from-primary-300/20 to-cyan-300/10 dark:from-primary-300/10 dark:to-cyan-500/10 blur-2xl opacity-70"></div>
            <div className="absolute top-[40%] right-[-5%] w-60 h-60 rounded-full bg-gradient-to-bl from-primary-400/20 to-secondary/10 dark:from-primary-400/10 dark:to-secondary/5 blur-xl"></div>
          </div>

          {/* Circular images on right - enhanced with more sophisticated styling */}
          <div className="absolute right-[5%] top-1/2 -translate-y-1/2 hidden lg:block z-10 w-[40%] max-w-[500px]">
            <div className="relative h-[600px]">
              <div className="absolute top-[-60px] right-[10%] w-64 h-64 rounded-full shadow-xl overflow-hidden animate-float-slow">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/30 to-transparent dark:from-cyan-500/20 rounded-full p-1.5">
                  <div className="h-full w-full rounded-full overflow-hidden border-2 border-white/40 dark:border-white/20 shadow-inner">
                    <Image
                      src="/placeholder.svg?height=300&width=300&text=Conference"
                      alt="Event Speaker"
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-700"
                      priority
                    />
                  </div>
                </div>
              </div>
              <div className="absolute top-[80px] right-[5%] w-80 h-80 rounded-full shadow-xl overflow-hidden animate-float-medium z-20">
                <div className="absolute inset-0 bg-gradient-to-tr from-secondary/50 to-transparent dark:from-secondary/30 rounded-full p-1.5">
                  <div className="h-full w-full rounded-full overflow-hidden border-3 border-white/40 dark:border-white/20 shadow-inner">
                    <Image
                      src="/placeholder.svg?height=350&width=350&text=Music+Event"
                      alt="Conference"
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-700"
                      priority
                    />
                  </div>
                </div>
              </div>
              <div className="absolute top-[260px] right-[15%] w-56 h-56 rounded-full shadow-xl overflow-hidden animate-float-fast">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/30 to-transparent dark:from-blue-500/20 rounded-full p-1.5">
                  <div className="h-full w-full rounded-full overflow-hidden border-2 border-white/40 dark:border-white/20 shadow-inner">
                    <Image
                      src="/placeholder.svg?height=250&width=250&text=Workshop"
                      alt="Attendees"
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-700"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="container px-4 md:px-6 relative z-10 min-h-[800px]">
            <div className="max-w-3xl">
              <p className="text-lg md:text-xl font-medium mb-3 text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-cyan-400 dark:to-blue-300 inline-block animate-shimmer-slow">
                Find Your Next Experience
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-[hsl(var(--hero-text))] mb-6 leading-tight tracking-tight [text-shadow:0_2px_10px_rgba(0,0,0,0.1)] dark:[text-shadow:0_2px_10px_rgba(0,0,0,0.3)]">
                Discover & Promote
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400 dark:from-primary-400 dark:to-primary-300">
                  Upcoming Events
                </span>
              </h1>
              <p className="text-lg md:text-xl text-[hsl(var(--hero-muted-text))] max-w-xl mb-10 leading-relaxed">
                Find and attend the best events in Ethiopia or create your own with our powerful platform.
              </p>

              {/* Search bar - enhanced with better dark mode support and improved padding */}
              <div className="mt-10 bg-[hsl(var(--hero-card-bg))] dark:bg-[hsl(var(--hero-card-bg))] backdrop-blur-sm p-0 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col md:flex-row transition-all duration-300 hover:shadow-[0_8px_30px_rgba(99,67,143,0.3)] border border-[hsl(var(--hero-card-border))] dark:border-[hsl(var(--hero-card-border))]">
                <div className="flex-1 flex items-center px-4 py-3 border-b md:border-b-0 md:border-r border-[hsl(var(--hero-card-border))]">
                  <Search className="h-5 w-5 text-primary flex-shrink-0 mr-3" />
                  <input
                    placeholder="Search Event"
                    className="w-full hero-input border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 py-0 h-auto"
                  />
                </div>
                <div className="md:w-[180px] px-4 py-3 border-b md:border-b-0 md:border-r border-[hsl(var(--hero-card-border))]">
                  <Select>
                    <SelectTrigger className="border-0 bg-transparent focus:ring-0 shadow-none p-0 h-auto">
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                        <SelectValue placeholder="Location" className="text-[hsl(var(--hero-input-text))]" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="border border-[hsl(var(--border))] shadow-lg">
                      <SelectItem value="addis">Addis Ababa</SelectItem>
                      <SelectItem value="hawassa">Hawassa</SelectItem>
                      <SelectItem value="bahirdar">Bahir Dar</SelectItem>
                      <SelectItem value="mekele">Mekele</SelectItem>
                      <SelectItem value="other">Other Locations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:w-[180px] px-4 py-3">
                  <Select>
                    <SelectTrigger className="border-0 bg-transparent focus:ring-0 shadow-none p-0 h-auto">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                        <SelectValue placeholder="Category" className="text-[hsl(var(--hero-input-text))]" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="border border-[hsl(var(--border))] shadow-lg">
                      <SelectItem value="tech">Technology</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="cultural">Cultural</SelectItem>
                      <SelectItem value="music">Music & Entertainment</SelectItem>
                      <SelectItem value="sports">Sports & Fitness</SelectItem>
                      <SelectItem value="education">Education & Workshop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="px-1 py-1 flex justify-center md:justify-end items-center ml-auto">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-500 rounded-lg h-12 w-full md:w-auto px-6 shadow-md hover:shadow-lg transition-all duration-300 font-medium"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Events Section */}
        <section className="py-16 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tight mb-2">Featured Events</h2>
              <p className="text-muted-foreground md:text-lg max-w-[700px]">
                Discover the hottest events happening across Ethiopia
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  id: 1,
                  title: "Addis Tech Summit 2024",
                  date: "May 15, 2024",
                  time: "9:00 AM",
                  location: "Millennium Hall, Addis Ababa",
                  category: "Technology",
                  image: "/placeholder.svg?height=300&width=500&text=Addis+Tech+Summit",
                },
                {
                  id: 2,
                  title: "Ethiopian Coffee Festival",
                  date: "May 22, 2024",
                  time: "10:00 AM",
                  location: "Friendship Park, Addis Ababa",
                  category: "Cultural",
                  image: "/placeholder.svg?height=300&width=500&text=Coffee+Festival",
                },
                {
                  id: 3,
                  title: "Cultural Heritage Exhibition",
                  date: "May 28, 2024",
                  time: "2:00 PM",
                  location: "National Museum, Addis Ababa",
                  category: "Cultural",
                  image: "/placeholder.svg?height=300&width=500&text=Cultural+Exhibition",
                },
              ].map((event, index) => (
                <div
                  key={event.id}
                  className="group relative overflow-hidden rounded-lg border bg-background shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <Image
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <Badge className="absolute top-3 right-3 bg-primary hover:bg-primary">{event.category}</Badge>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{event.title}</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <CalendarDays className="h-4 w-4 mr-2 text-primary/70" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-primary/70" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-primary/70" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-4 group-hover:bg-primary group-hover:text-white transition-colors"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-10">
              <Link href="/events">
                <Button variant="outline" className="group">
                  View All Events
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <Badge variant="secondary" className="inline-block">
                  Core Features
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Everything you need for successful events
                </h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  EventEase provides all the essential tools for discovering, creating, and managing events in Ethiopia.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Feature Card 1 */}
              <div className="group relative overflow-hidden rounded-lg border bg-background p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="mb-4 text-primary">
                  <Calendar className="h-10 w-10" />
                </div>
                <h3 className="mb-2 text-xl font-bold">AI-Powered Event Recommendations</h3>
                <p className="text-sm text-muted-foreground">
                  Discover events tailored to your interests with our Google Gemini LLM-powered recommendation system.
                </p>
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-primary-400 to-secondary-500 transition-all duration-300 group-hover:w-full"></div>
              </div>

              {/* Feature Card 2 */}
              <div className="group relative overflow-hidden rounded-lg border bg-background p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="mb-4 text-primary">
                  <MapPin className="h-10 w-10" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Seamless Chapa Payment</h3>
                <p className="text-sm text-muted-foreground">
                  Book tickets with ease using Ethiopia's leading payment gateway, supporting multiple payment methods.
                </p>
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-primary-400 to-secondary-500 transition-all duration-300 group-hover:w-full"></div>
              </div>

              {/* Feature Card 3 */}
              <div className="group relative overflow-hidden rounded-lg border bg-background p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="mb-4 text-primary">
                  <BarChart3 className="h-10 w-10" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Advanced Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Gain valuable insights into event performance, attendee demographics, and engagement metrics.
                </p>
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-primary-400 to-secondary-500 transition-all duration-300 group-hover:w-full"></div>
              </div>

              {/* Feature Card 4 */}
              <div className="group relative overflow-hidden rounded-lg border bg-background p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="mb-4 text-primary">
                  <Shield className="h-10 w-10" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Event Verification</h3>
                <p className="text-sm text-muted-foreground">
                  All events are verified by our team to ensure authenticity and quality for attendees.
                </p>
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-primary-400 to-secondary-500 transition-all duration-300 group-hover:w-full"></div>
              </div>

              {/* Feature Card 5 */}
              <div className="group relative overflow-hidden rounded-lg border bg-background p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="mb-4 text-primary">
                  <Users className="h-10 w-10" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Organizer Tools</h3>
                <p className="text-sm text-muted-foreground">
                  Powerful tools for event creation, attendee management, and financial reporting.
                </p>
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-primary-400 to-secondary-500 transition-all duration-300 group-hover:w-full"></div>
              </div>

              {/* Feature Card 6 */}
              <div className="group relative overflow-hidden rounded-lg border bg-background p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="mb-4 text-primary">
                  <Zap className="h-10 w-10" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Shareable Event Links</h3>
                <p className="text-sm text-muted-foreground">
                  Generate and share event links across social media and messaging platforms to maximize reach.
                </p>
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-primary-400 to-secondary-500 transition-all duration-300 group-hover:w-full"></div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <Badge variant="secondary" className="inline-block">
                  Common Questions
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Frequently Asked Questions
                </h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Find answers to the most common questions about EventEase.
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-3xl">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>What is EventEase?</AccordionTrigger>
                  <AccordionContent>
                    EventEase is a mobile-first event management platform designed specifically for the Ethiopian
                    market. It leverages Google Gemini LLM for AI-powered recommendations and integrates Chapa Payment
                    for seamless transactions. The platform enables users to discover, book, and attend personalized
                    events, while providing organizers and administrators with robust tools for event creation,
                    analytics, and secure payment processing.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>How do I become an event organizer?</AccordionTrigger>
                  <AccordionContent>
                    To become an event organizer on EventEase, you need to register and provide some documentation for
                    verification, including your legal company name, TIN number, and company ownership documents. Once
                    submitted, our admin team will review your application and approve your organizer status, typically
                    within 2-3 business days.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>What payment methods are supported?</AccordionTrigger>
                  <AccordionContent>
                    EventEase integrates with Chapa Payment, which supports multiple payment methods including Telebirr,
                    Commercial Bank of Ethiopia (CBE), Dashen Bank, Awash Bank, and major credit/debit cards. This
                    ensures that attendees can pay using their preferred method, making the booking process seamless and
                    convenient.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>How does the event approval process work?</AccordionTrigger>
                  <AccordionContent>
                    After creating an event, it goes through an approval process to ensure quality and authenticity. Our
                    admin team reviews the event details, including title, description, location, and any supporting
                    documents. Once approved, you'll receive a notification and can then generate a shareable link to
                    promote your event across various platforms.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>Can I get analytics for my events?</AccordionTrigger>
                  <AccordionContent>
                    Yes, EventEase provides comprehensive analytics for organizers. You can access detailed reports on
                    attendee demographics, ticket sales, engagement metrics, and financial performance. These insights
                    help you understand your audience better and optimize future events for greater success.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center text-white">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to transform your event experience?
                </h2>
                <p className="max-w-[700px] opacity-90 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of Ethiopians who are discovering and creating memorable events with EventEase.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row mt-6">
                <Link href="/register">
                  <Button className="bg-white text-primary hover:bg-primary-50 px-8 h-12 rounded-md">
                    Get Started Now
                  </Button>
                </Link>
                <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 h-12 rounded-md">
                  Become an Organizer
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 md:py-16 lg:py-20">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">
                  Event
                  <span className="bg-gradient-to-r from-secondary-400 to-secondary-600 bg-clip-text text-transparent">
                    Ease
                  </span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Simplifying event management in Ethiopia.</p>
              <div className="flex space-x-4">
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            </div>
            <div>
              <h3 className="text-base font-medium mb-4">Platform</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/events" className="text-muted-foreground hover:text-foreground">
                    Browse Events
                  </Link>
                </li>
                <li>
                  <Link href="/create" className="text-muted-foreground hover:text-foreground">
                    Create Event
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                    Organizer Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="text-muted-foreground hover:text-foreground">
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-base font-medium mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-foreground">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-muted-foreground hover:text-foreground">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-base font-medium mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-muted-foreground hover:text-foreground">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} EventEase. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground mt-4 md:mt-0">Made with ❤️ in Addis Ababa, Ethiopia</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
