import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/AuthContext"
import { EventProvider } from "@/contexts/EventContext"
import { CategoryProvider } from "@/contexts/CategoryContext"
import { LocationProvider } from "@/contexts/LocationContext"
import { APP_DESCRIPTION, APP_NAME } from "@/lib/env"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <CategoryProvider>
            <LocationProvider>
              <EventProvider>
                <div className="relative flex min-h-screen flex-col">
                  <div className="flex-1">{children}</div>
                </div>
                <Toaster />
              </EventProvider>
            </LocationProvider>
          </CategoryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
