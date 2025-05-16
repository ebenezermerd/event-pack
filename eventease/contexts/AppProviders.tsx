"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { UIProvider } from "@/contexts/UIContext"
import { AuthProvider } from "@/contexts/AuthContext"
import { EventProvider } from "@/contexts/EventContext"
import { BookingProvider } from "@/contexts/BookingContext"
import { CategoryProvider } from "@/contexts/CategoryContext"
import { LocationProvider } from "@/contexts/LocationContext"
import { AIGenerationProvider } from "@/contexts/AIGenerationContext"

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <UIProvider>
        <AuthProvider>
          <EventProvider>
            <BookingProvider>
              <CategoryProvider>
                <LocationProvider>
                  <AIGenerationProvider>{children}</AIGenerationProvider>
                </LocationProvider>
              </CategoryProvider>
            </BookingProvider>
          </EventProvider>
        </AuthProvider>
      </UIProvider>
    </ThemeProvider>
  )
}
