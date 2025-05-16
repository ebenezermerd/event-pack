"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Testimonial {
  id: number
  name: string
  role: string
  company: string
  content: string
  initials: string
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Henderson",
    role: "Founder",
    company: "EcoGoods",
    initials: "SH",
    content:
      "ConnectX allowed me to launch my sustainable products store in just two weeks. Their API is incredibly easy to use, and the support team is always there when I need them.",
  },
  {
    id: 2,
    name: "Michael Johnson",
    role: "CEO",
    company: "TechGadgets",
    initials: "MJ",
    content:
      "We migrated from a custom solution to ConnectX and saw our operational costs decrease by 40%. The scalability is impressive - we handled Black Friday traffic with zero issues.",
  },
  {
    id: 3,
    name: "Aisha Lee",
    role: "Founder",
    company: "StyleHouse",
    initials: "AL",
    content:
      "As a non-technical founder, ConnectX was a game-changer. I could focus on my fashion products while they handled all the complex e-commerce backend operations.",
  },
  {
    id: 4,
    name: "David Rodriguez",
    role: "CTO",
    company: "FitGear",
    initials: "DR",
    content:
      "The API documentation is exceptional. We integrated ConnectX into our existing platform in days, not weeks. Our development team loves working with it.",
  },
  {
    id: 5,
    name: "Emma Wilson",
    role: "E-commerce Director",
    company: "HomeDecor",
    initials: "EW",
    content:
      "ConnectX's inventory management system has eliminated overselling issues completely. Our customers are happier, and our operations team can finally sleep at night.",
  },
]

export function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const nextTestimonial = useCallback(() => {
    setActiveIndex((current) => (current + 1) % testimonials.length)
  }, [])

  const prevTestimonial = useCallback(() => {
    setActiveIndex((current) => (current - 1 + testimonials.length) % testimonials.length)
  }, [])

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(nextTestimonial, 5000)
      return () => clearInterval(interval)
    }
  }, [nextTestimonial, isPaused])

  return (
    <div
      className="relative w-full overflow-hidden py-10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <div className="flex overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <div className="rounded-2xl bg-gradient-to-r from-[#02569B]/5 to-emerald-500/5 p-8 shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#02569B] to-emerald-500 text-lg font-semibold text-white">
                        {testimonial.initials}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold">{testimonial.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role}, {testimonial.company}
                        </p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <div className="flex mb-4">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className="h-5 w-5 fill-current text-yellow-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-lg italic text-muted-foreground">"{testimonial.content}"</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={prevTestimonial}
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Previous testimonial</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={nextTestimonial}
          >
            <ChevronRight className="h-5 w-5" />
            <span className="sr-only">Next testimonial</span>
          </Button>

          <div className="mt-8 flex justify-center gap-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  idx === activeIndex ? "bg-[#02569B] w-6" : "bg-muted-foreground/30 hover:bg-muted-foreground/50",
                )}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
