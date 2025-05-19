"use client"

import { useState } from "react"
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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save } from "lucide-react"
import { useAIGeneration, type EventType } from "@/contexts/AIGenerationContext"
import { useToast } from "@/components/ui/use-toast"

interface SaveTemplateDialogProps {
  onSaved?: () => void
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  buttonSize?: "default" | "sm" | "lg" | "icon"
  buttonText?: string
  className?: string
}

export function SaveTemplateDialog({
  onSaved,
  buttonVariant = "outline",
  buttonSize = "default",
  buttonText = "Save Template",
  className,
}: SaveTemplateDialogProps) {
  const { toast } = useToast()
  const { generatedTemplate, saveTemplate } = useAIGeneration()

  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [eventType, setEventType] = useState<EventType>("conference")

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a name for your template.",
        variant: "destructive",
      })
      return
    }

    if (!generatedTemplate) {
      toast({
        title: "No Template",
        description: "There is no generated template to save.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const success = await saveTemplate(templateName, eventType, generatedTemplate)

      if (success) {
        setOpen(false)
        setTemplateName("")

        if (onSaved) {
          onSaved()
        }
      }
    } finally {
      setIsSaving(false)
    }
  }

  if (!generatedTemplate) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} className={className}>
          <Save className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Template</DialogTitle>
          <DialogDescription>Save this generated content as a template for future use.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              placeholder="E.g., Tech Conference Template"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
          </div>

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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
