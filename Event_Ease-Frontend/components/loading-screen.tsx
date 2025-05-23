"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CalendarClock } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingScreenProps {
  /**
   * Minimum display time in milliseconds
   * This ensures the animation completes even if the data loads quickly
   */
  minimumDisplayTime?: number

  /**
   * Whether the loading screen is active
   */
  isLoading?: boolean

  /**
   * Optional text to display below the logo
   */
  loadingText?: string

  /**
   * Optional callback when animation completes
   */
  onAnimationComplete?: () => void

  /**
   * Optional custom class name
   */
  className?: string
}

export function LoadingScreen({
  minimumDisplayTime = 2000,
  isLoading = true,
  loadingText = "Loading amazing events for you...",
  onAnimationComplete,
  className,
}: LoadingScreenProps) {
  const [shouldShow, setShouldShow] = useState(isLoading)

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShouldShow(false)
      }, minimumDisplayTime)

      return () => clearTimeout(timer)
    } else {
      setShouldShow(true)
    }
  }, [isLoading, minimumDisplayTime])

  return (
    <AnimatePresence onExitComplete={onAnimationComplete}>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn("fixed inset-0 z-50 flex flex-col items-center justify-center bg-background", className)}
        >
          <div className="relative flex flex-col items-center">
            {/* Logo container with pulse effect */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative mb-8"
            >
              {/* Outer ring pulse animation */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-600/20 to-primary-800/20"
              />

              {/* Middle ring pulse animation */}
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.5, 0.7, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 0.2,
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-600/30 to-primary-800/30"
              />

              {/* Logo with animation */}
              <motion.div
                className="relative flex items-center p-6"
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{
                  duration: 5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <div className="relative flex items-center">
                  <CalendarClock className="h-16 w-16 text-primary-600" />
                  <motion.div
                    className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-gradient-to-r from-secondary-400 to-secondary-600"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />
                </div>
                <motion.span
                  className="ml-4 font-extrabold text-4xl tracking-tight bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent"
                  animate={{ y: [0, -3, 0, 3, 0] }}
                  transition={{
                    duration: 5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 0.1,
                  }}
                >
                  Event
                  <motion.span
                    className="bg-gradient-to-r from-secondary-400 to-secondary-600 bg-clip-text text-transparent"
                    animate={{ y: [0, 3, 0, -3, 0] }}
                    transition={{
                      duration: 5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      delay: 0.2,
                    }}
                  >
                    Ease
                  </motion.span>
                </motion.span>
              </motion.div>
            </motion.div>

            {/* Loading text with typing effect */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-center"
            >
              <TypingText text={loadingText} />
            </motion.div>

            {/* Loading progress bar */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "200px", opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="mt-6 h-0.5 bg-muted overflow-hidden rounded-full"
            >
              <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 1.5,
                  ease: "easeInOut",
                }}
                className="h-full w-1/3 bg-gradient-to-r from-primary-600 to-secondary-500 rounded-full"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Typing text effect component
function TypingText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, 50) // Speed of typing

      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text])

  return (
    <div className="h-6 text-muted-foreground">
      {displayedText}
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.8 }}
        className="inline-block ml-1 w-1 h-4 bg-secondary-500"
      />
    </div>
  )
}
