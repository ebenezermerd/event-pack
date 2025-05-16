"use client"

import { useState, useEffect } from "react"

export function useSidebarState() {
  const [isOpen, setIsOpen] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    // Check if we have a saved state
    const savedState = localStorage.getItem("sidebar-state")
    if (savedState) {
      setIsOpen(savedState === "open")
    } else {
      // Default to closed on mobile, open on desktop
      setIsOpen(window.innerWidth >= 1024)
    }

    // Listen for window resize events
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Save state when it changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("sidebar-state", isOpen ? "open" : "closed")
    }
  }, [isOpen, isMounted])

  return { isOpen, setIsOpen }
}
