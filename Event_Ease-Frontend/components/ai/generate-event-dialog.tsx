"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2, Sparkles } from "lucide-react"
import { useAIGeneration, type EventType, type GenerationParams } from "@/contexts/AIGenerationContext"
import { useToast } from "@/components/ui/use-toast"

interface GenerateEventDialogProps {
  onGenerated?: () => void
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  buttonSize?: "default" | "sm" | "lg" | "icon"
  buttonText?: string
  className?: string
}

export function GenerateEventDialog({
  onGenerated,
  buttonVariant = "default",
  buttonSize = "default",
  buttonText = "Generate with AI",
  className,
}: GenerateEventDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { generateEventContent, isGenerating } = useAIGeneration()

  const [open, setOpen] = useState(false)
  const [eventType, setEventType] = useState<EventType>("conference")
  const [topic, setTopic] = useState("")
  const [location, setLocation] = useState("")
  const [targetAudience, setTargetAudience] = useState("")
  const [additionalDetails, setAdditionalDetails] = useState("")

  const handleGenerate = async () => {
    if (!eventType) {
      toast({
        title: "Missing Information",
        description: "Please select an event type.",
        variant: "destructive",
      })
      return
    }

    const params: GenerationParams = {
      eventType,
      topic: topic.trim() || undefined,
      location: location.trim() || undefined,
      targetAudience: targetAudience.trim() || undefined,
      additionalDetails: additionalDetails.trim() || undefined,
    }

    const template = await generateEventContent(params)

    if (template) {
      setOpen(false)
      resetForm()

      if (onGenerated) {
        onGenerated()
      } else {
        // Navigate to create event page with template data
        router.push("/dashboard/organizer/events/create?useTemplate=true")
      }
    }
  }

  const resetForm = () => {
    setEventType("conference")
    setTopic("")
    setLocation("")
    setTargetAudience("")
    setAdditionalDetails("")
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      resetForm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} className={className}>
          <Sparkles className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Event with AI</DialogTitle>
          <DialogDescription>
            Provide some details to guide the AI in generating professional event content.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="event-type">Event Type</Label>
            <Select value={eventType} onValueChange={(value) => setEventType(value as EventType)}>
              <SelectTrigger id="event-type">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conference">Conference</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="concert">Concert</SelectItem>
                <SelectItem value="exhibition">Exhibition</SelectItem>
                <SelectItem value="festival">Festival</SelectItem>
                <SelectItem value="networking">Networking Event</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="topic">Topic/Theme</Label>
            <Input
              id="topic"
              placeholder="E.g., Sustainable Technology, Jazz Music, Digital Marketing"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="E.g., Addis Ababa, Bahir Dar, Hawassa"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="target-audience">Target Audience</Label>
            <Input
              id="target-audience"
              placeholder="E.g., Tech professionals, Music enthusiasts, Marketing managers"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="additional-details">Additional Details</Label>
            <Textarea
              id="additional-details"
              placeholder="Any other details to guide the AI generation"
              rows={3}
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Event
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
