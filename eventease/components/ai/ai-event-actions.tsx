"use client"

import { GenerateEventDialog } from "./generate-event-dialog"
import { TemplateLibraryDialog } from "./template-library-dialog"
import { SaveTemplateDialog } from "./save-template-dialog"
import { useAIGeneration } from "@/contexts/AIGenerationContext"

interface AIEventActionsProps {
  className?: string
  showSave?: boolean
  onGenerated?: () => void
  onTemplateSelected?: () => void
  onSaved?: () => void
}

export function AIEventActions({
  className,
  showSave = false,
  onGenerated,
  onTemplateSelected,
  onSaved,
}: AIEventActionsProps) {
  const { generatedTemplate } = useAIGeneration()

  return (
    <div className={`flex gap-2 ${className}`}>
      <GenerateEventDialog onGenerated={onGenerated} buttonVariant="default" />

      <TemplateLibraryDialog onTemplateSelected={onTemplateSelected} buttonVariant="outline" />

      {showSave && generatedTemplate && <SaveTemplateDialog onSaved={onSaved} buttonVariant="outline" />}
    </div>
  )
}
