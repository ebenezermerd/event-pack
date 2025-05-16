"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Library, Calendar, Tag } from "lucide-react"
import { useAIGeneration } from "@/contexts/AIGenerationContext"
import { formatDistanceToNow } from "date-fns"

interface TemplateLibraryDialogProps {
  onTemplateSelected?: () => void
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  buttonSize?: "default" | "sm" | "lg" | "icon"
  buttonText?: string
  className?: string
}

export function TemplateLibraryDialog({
  onTemplateSelected,
  buttonVariant = "outline",
  buttonSize = "default",
  buttonText = "Template Library",
  className,
}: TemplateLibraryDialogProps) {
  const router = useRouter()
  const { savedTemplates, loadingSavedTemplates, loadSavedTemplates, loadTemplateById } = useAIGeneration()

  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) {
      loadSavedTemplates()
    }
  }, [open, loadSavedTemplates])

  const handleSelectTemplate = async (templateId: string) => {
    const template = await loadTemplateById(templateId)

    if (template) {
      setOpen(false)

      if (onTemplateSelected) {
        onTemplateSelected()
      } else {
        // Navigate to create event page with template data
        router.push("/dashboard/organizer/events/create?useTemplate=true")
      }
    }
  }

  const getEventTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      conference: "Conference",
      workshop: "Workshop",
      concert: "Concert",
      exhibition: "Exhibition",
      festival: "Festival",
      networking: "Networking",
      other: "Other",
    }
    return types[type] || type
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} className={className}>
          <Library className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Template Library</DialogTitle>
          <DialogDescription>Select a saved template to use as a starting point for your new event.</DialogDescription>
        </DialogHeader>

        {loadingSavedTemplates ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : savedTemplates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Library className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No saved templates found.</p>
            <p className="text-sm mt-2">Generate and save a template to see it here.</p>
          </div>
        ) : (
          <ScrollArea className="h-[350px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {savedTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-1 text-muted-foreground" />
                        {getEventTypeLabel(template.eventType)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        {formatDistanceToNow(new Date(template.createdAt), { addSuffix: true })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="secondary" size="sm" onClick={() => handleSelectTemplate(template.id)}>
                        Use
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}
