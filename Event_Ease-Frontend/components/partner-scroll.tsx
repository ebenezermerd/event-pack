"use client"

import { useRef, useEffect } from "react"
import Image from "next/image"

export function PartnerScroll() {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let animationId: number
    let scrollPosition = 0
    const scrollSpeed = 0.5

    const scroll = () => {
      scrollPosition += scrollSpeed
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0
      }
      scrollContainer.scrollLeft = scrollPosition
      animationId = requestAnimationFrame(scroll)
    }

    animationId = requestAnimationFrame(scroll)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <div className="w-full overflow-hidden">
      <div
        ref={scrollRef}
        className="flex space-x-8 py-4 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Double the partners to create seamless scrolling */}
        {[...Array(12)].map((_, i) => (
          <div key={i} className="flex-shrink-0 transition-transform duration-300 hover:scale-105">
            <Image
              src={`/placeholder.svg?height=40&width=120&text=Partner${(i % 6) + 1}`}
              alt={`Partner ${(i % 6) + 1}`}
              width={120}
              height={40}
              className="opacity-70 hover:opacity-100 transition-opacity"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
