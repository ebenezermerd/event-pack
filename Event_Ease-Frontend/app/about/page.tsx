import Image from "next/image"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Zap, Shield, Heart, Linkedin, Twitter } from "lucide-react"

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="relative w-full bg-gradient-to-r from-primary-600/90 to-primary-800/90 py-20 overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10 bg-[length:20px_20px] opacity-10"></div>
          <div className="container relative z-10 mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
              Empowering Event Excellence
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-8">
              We're on a mission to transform how events are created, discovered, and experienced across Ethiopia.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild className="bg-white text-primary-800 hover:bg-white/90">
                <Link href="/register">Join EventEase</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary-200 dark:bg-primary-900"></div>

              {/* Timeline items */}
              <div className="space-y-12">
                {[
                  {
                    year: "2023",
                    title: "EventEase Founded",
                    description: "Started with a vision to revolutionize event management in Ethiopia.",
                  },
                  {
                    year: "2023",
                    title: "First Beta Release",
                    description: "Launched our platform to select organizers in Addis Ababa.",
                  },
                  {
                    year: "2024",
                    title: "National Expansion",
                    description: "Expanded our services to all major cities across Ethiopia.",
                  },
                  {
                    year: "2024",
                    title: "AI Integration",
                    description: "Introduced AI-powered event recommendations and templates.",
                  },
                ].map((item, index) => (
                  <div key={index} className="relative">
                    <div className={`flex items-center ${index % 2 === 0 ? "flex-row-reverse" : "flex-row"}`}>
                      <div className="w-1/2"></div>
                      <div className="z-10 flex items-center justify-center w-10 h-10 rounded-full bg-primary-600 text-white shadow-lg">
                        <span className="text-sm font-bold">{item.year.slice(2)}</span>
                      </div>
                      <div className="w-1/2"></div>
                    </div>
                    <div
                      className={`mt-4 md:mt-0 ${index % 2 === 0 ? "md:text-right md:pr-12" : "md:text-left md:pl-12"}`}
                    >
                      <div className="bg-card p-4 rounded-lg shadow-sm border border-border inline-block">
                        <h3 className="text-xl font-bold">{item.title}</h3>
                        <p className="text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">Our Core Values</h2>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
              These principles guide everything we do at EventEase, from product development to customer support.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Zap className="h-10 w-10 text-primary-600" />,
                  title: "Innovation",
                  description:
                    "We constantly push boundaries to create cutting-edge solutions for event organizers and attendees.",
                },
                {
                  icon: <Shield className="h-10 w-10 text-primary-600" />,
                  title: "Reliability",
                  description:
                    "Our platform is built for dependability, ensuring your events run smoothly from start to finish.",
                },
                {
                  icon: <Heart className="h-10 w-10 text-primary-600" />,
                  title: "User-First",
                  description:
                    "Every feature we develop starts with understanding the needs of our users and their audiences.",
                },
              ].map((value, index) => (
                <Card key={index} className="group hover:shadow-md transition-all duration-300 overflow-hidden">
                  <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      {value.icon}
                    </div>
                    <CardTitle>{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">Meet Our Team</h2>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
              The passionate individuals behind EventEase who are dedicated to transforming the event landscape in
              Ethiopia.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  name: "Abebe Kebede",
                  role: "Founder & CEO",
                  bio: "10+ years in tech entrepreneurship with a passion for Ethiopian innovation.",
                  image: "/placeholder.svg?height=300&width=300",
                },
                {
                  name: "Tigist Haile",
                  role: "Chief Product Officer",
                  bio: "Former UX lead at major tech companies with expertise in user-centered design.",
                  image: "/placeholder.svg?height=300&width=300",
                },
                {
                  name: "Dawit Mekonnen",
                  role: "CTO",
                  bio: "Full-stack developer with a background in scalable systems and AI integration.",
                  image: "/placeholder.svg?height=300&width=300",
                },
                {
                  name: "Hiwot Tadesse",
                  role: "Head of Operations",
                  bio: "Experienced in scaling startups across East Africa with focus on community building.",
                  image: "/placeholder.svg?height=300&width=300",
                },
              ].map((member, index) => (
                <Card key={index} className="group overflow-hidden">
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle>{member.name}</CardTitle>
                    <CardDescription>{member.role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{member.bio}</p>
                  </CardContent>
                  <CardFooter className="flex justify-center gap-4 pt-0">
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Linkedin className="h-5 w-5" />
                      <span className="sr-only">LinkedIn</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Twitter className="h-5 w-5" />
                      <span className="sr-only">Twitter</span>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Signals Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Trusted by Event Creators Across Ethiopia</h2>
                <p className="text-muted-foreground mb-8">
                  From small community gatherings to large-scale conferences, EventEase powers thousands of successful
                  events nationwide.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: "Events Managed", value: "5,000+" },
                    { label: "Tickets Issued", value: "250,000+" },
                    { label: "Active Organizers", value: "500+" },
                    { label: "Cities Covered", value: "25+" },
                  ].map((stat, index) => (
                    <div key={index} className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-3xl font-bold text-primary-600">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">Our Partners & Clients</h3>
                <div className="grid grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="bg-muted/30 h-20 rounded-md flex items-center justify-center">
                      <div className="text-muted-foreground font-medium">Partner {index + 1}</div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Events", "Conferences", "Workshops", "Concerts", "Exhibitions"].map((tag, index) => (
                    <Badge key={index} variant="outline" className="bg-muted/50">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">Powered By Modern Technology</h2>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
              We leverage cutting-edge technologies to deliver a seamless, secure, and scalable platform.
            </p>

            <Tabs defaultValue="stack" className="max-w-3xl mx-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="stack">Tech Stack</TabsTrigger>
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              <TabsContent value="stack" className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  {["Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js", "PostgreSQL", "Redis", "Docker"].map(
                    (tech, index) => (
                      <div
                        key={index}
                        className="bg-card p-4 rounded-lg border border-border flex items-center justify-center h-20"
                      >
                        <span className="font-medium">{tech}</span>
                      </div>
                    ),
                  )}
                </div>
                <p className="text-muted-foreground text-center">
                  Our platform is built on a modern, scalable architecture designed for performance and reliability.
                </p>
              </TabsContent>
              <TabsContent value="integrations" className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                  {[
                    "Chapa Payment",
                    "Google Maps",
                    "AI Recommendations",
                    "SMS Gateway",
                    "Email Service",
                    "Analytics",
                  ].map((integration, index) => (
                    <div
                      key={index}
                      className="bg-card p-4 rounded-lg border border-border flex items-center justify-center h-20"
                    >
                      <span className="font-medium">{integration}</span>
                    </div>
                  ))}
                </div>
                <p className="text-muted-foreground text-center">
                  We integrate with best-in-class services to enhance the functionality of our platform.
                </p>
              </TabsContent>
              <TabsContent value="security" className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-6 w-6 text-primary-600 mt-1" />
                    <div>
                      <h3 className="font-medium">End-to-End Encryption</h3>
                      <p className="text-muted-foreground text-sm">
                        All sensitive data is encrypted in transit and at rest.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="h-6 w-6 text-primary-600 mt-1" />
                    <div>
                      <h3 className="font-medium">Regular Security Audits</h3>
                      <p className="text-muted-foreground text-sm">
                        We conduct regular security assessments to identify and address vulnerabilities.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="h-6 w-6 text-primary-600 mt-1" />
                    <div>
                      <h3 className="font-medium">Compliance</h3>
                      <p className="text-muted-foreground text-sm">
                        Our platform adheres to industry standards for data protection and privacy.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Events?</h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
              Join thousands of event organizers across Ethiopia who trust EventEase to power their events.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild className="bg-white text-primary-800 hover:bg-white/90">
                <Link href="/register/organizer">Become an Organizer</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10" asChild>
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
