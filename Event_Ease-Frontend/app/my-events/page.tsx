import { Suspense } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { EventFeed } from "@/components/attendee/event-feed"
import { SavedEvents } from "@/components/attendee/saved-events"
import { MyTickets } from "@/components/attendee/my-tickets"
import { EventRecommendations } from "@/components/attendee/event-recommendations"
import { AttendeeProfile } from "@/components/attendee/attendee-profile"
import { NotificationCenter } from "@/components/attendee/notification-center"
import { PageHeader } from "@/components/page-header"
import { Skeleton } from "@/components/ui/skeleton"

export default function MyEventsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 container py-6 md:py-10">
        <PageHeader title="My Events" description="Manage your events, tickets, and discover new experiences" />

        <Tabs defaultValue="feed" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl">
              <TabsTrigger value="feed">Feed</TabsTrigger>
              <TabsTrigger value="tickets">My Tickets</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            <Suspense fallback={<Skeleton className="h-10 w-10 rounded-full" />}>
              <NotificationCenter />
            </Suspense>
          </div>

          <TabsContent value="feed" className="space-y-8">
            <Suspense fallback={<EventFeedSkeleton />}>
              <EventFeed />
            </Suspense>

            <Separator />

            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">Recommended For You</h2>
              <Suspense fallback={<RecommendationsSkeleton />}>
                <EventRecommendations />
              </Suspense>
            </div>
          </TabsContent>

          <TabsContent value="tickets">
            <Suspense fallback={<TicketsSkeleton />}>
              <MyTickets />
            </Suspense>
          </TabsContent>

          <TabsContent value="saved">
            <Suspense fallback={<SavedEventsSkeleton />}>
              <SavedEvents />
            </Suspense>
          </TabsContent>

          <TabsContent value="profile">
            <Suspense fallback={<ProfileSkeleton />}>
              <AttendeeProfile />
            </Suspense>
          </TabsContent>
        </Tabs>
      </main>
      <SiteFooter />
    </>
  )
}

// Skeleton loaders for suspense boundaries
function EventFeedSkeleton() {
  return (
    <div className="space-y-6">
      {Array(3)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <div className="flex space-x-4">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
        ))}
    </div>
  )
}

function RecommendationsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array(3)
        .fill(0)
        .map((_, i) => (
          <Skeleton key={i} className="h-[250px] rounded-xl" />
        ))}
    </div>
  )
}

function TicketsSkeleton() {
  return (
    <div className="space-y-6">
      {Array(3)
        .fill(0)
        .map((_, i) => (
          <Skeleton key={i} className="h-[150px] w-full rounded-xl" />
        ))}
    </div>
  )
}

function SavedEventsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <Skeleton key={i} className="h-[200px] rounded-xl" />
        ))}
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-20 w-20 rounded-full" />
      <Skeleton className="h-8 w-[200px]" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}
