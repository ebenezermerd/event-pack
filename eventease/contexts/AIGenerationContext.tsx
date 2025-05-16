"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { toast } from "@/components/ui/use-toast"
import { apiClient } from "@/lib/api-client"

// Types for the AI generation feature
export type EventType = "conference" | "workshop" | "concert" | "exhibition" | "festival" | "networking" | "other"

export interface GenerationParams {
  eventType: EventType
  topic?: string
  location?: string
  targetAudience?: string
  additionalDetails?: string
}

export interface ScheduleItem {
  time: string
  title: string
  description: string
}

export interface FAQ {
  question: string
  answer: string
}

export interface TicketType {
  name: string
  description: string
  benefits: string[]
  price?: number
}

export interface ImageSuggestion {
  description: string
  prompt: string
}

export interface EventTemplate {
  id?: string
  name?: string
  title: string
  caption: string
  description: string
  longDescription: string
  schedule: ScheduleItem[]
  faqs: FAQ[]
  ticketTypes: TicketType[]
  suggestedImages: ImageSuggestion[]
}

export interface SavedTemplate {
  id: string
  name: string
  eventType: EventType
  createdAt: string
}

interface AIGenerationContextType {
  isGenerating: boolean
  generatedTemplate: EventTemplate | null
  savedTemplates: SavedTemplate[]
  loadingSavedTemplates: boolean
  generateEventContent: (params: GenerationParams) => Promise<EventTemplate | null>
  saveTemplate: (name: string, eventType: EventType, template: EventTemplate) => Promise<boolean>
  loadSavedTemplates: () => Promise<SavedTemplate[]>
  loadTemplateById: (id: string) => Promise<EventTemplate | null>
  clearGeneratedTemplate: () => void
}

const AIGenerationContext = createContext<AIGenerationContextType>({
  isGenerating: false,
  generatedTemplate: null,
  savedTemplates: [],
  loadingSavedTemplates: false,
  generateEventContent: async () => null,
  saveTemplate: async () => false,
  loadSavedTemplates: async () => [],
  loadTemplateById: async () => null,
  clearGeneratedTemplate: () => {},
})

export const useAIGeneration = () => useContext(AIGenerationContext)

export const AIGenerationProvider = ({ children }: { children: ReactNode }) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedTemplate, setGeneratedTemplate] = useState<EventTemplate | null>(null)
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([])
  const [loadingSavedTemplates, setLoadingSavedTemplates] = useState(false)

  const generateEventContent = async (params: GenerationParams): Promise<EventTemplate | null> => {
    try {
      setIsGenerating(true)

      const response = await apiClient.post<{ success: boolean; eventTemplate: EventTemplate }>(
        "/api/organizers/events/generate",
        params,
      )

      if (response.success && response.eventTemplate) {
        setGeneratedTemplate(response.eventTemplate)
        return response.eventTemplate
      } else {
        toast({
          title: "Generation Failed",
          description: "Failed to generate event content. Please try again.",
          variant: "destructive",
        })
        return null
      }
    } catch (error) {
      console.error("Error generating event content:", error)
      toast({
        title: "Generation Error",
        description: "An error occurred while generating event content.",
        variant: "destructive",
      })
      return null
    } finally {
      setIsGenerating(false)
    }
  }

  const saveTemplate = async (name: string, eventType: EventType, template: EventTemplate): Promise<boolean> => {
    try {
      const response = await apiClient.post<{ success: boolean; message: string; templateId: string }>(
        "/api/organizers/templates",
        {
          name,
          eventType,
          template,
        },
      )

      if (response.success) {
        toast({
          title: "Template Saved",
          description: "Your template has been saved successfully.",
        })

        // Refresh the saved templates list
        await loadSavedTemplates()
        return true
      } else {
        toast({
          title: "Save Failed",
          description: "Failed to save template. Please try again.",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error("Error saving template:", error)
      toast({
        title: "Save Error",
        description: "An error occurred while saving the template.",
        variant: "destructive",
      })
      return false
    }
  }

  const loadSavedTemplates = async (): Promise<SavedTemplate[]> => {
    try {
      setLoadingSavedTemplates(true)

      const response = await apiClient.get<{ success: boolean; templates: SavedTemplate[] }>(
        "/api/organizers/templates",
      )

      if (response.success) {
        setSavedTemplates(response.templates)
        return response.templates
      } else {
        toast({
          title: "Load Failed",
          description: "Failed to load saved templates.",
          variant: "destructive",
        })
        return []
      }
    } catch (error) {
      console.error("Error loading templates:", error)
      toast({
        title: "Load Error",
        description: "An error occurred while loading templates.",
        variant: "destructive",
      })
      return []
    } finally {
      setLoadingSavedTemplates(false)
    }
  }

  const loadTemplateById = async (id: string): Promise<EventTemplate | null> => {
    try {
      const response = await apiClient.get<{ success: boolean; template: EventTemplate }>(
        `/api/organizers/templates/${id}`,
      )

      if (response.success) {
        setGeneratedTemplate(response.template)
        return response.template
      } else {
        toast({
          title: "Load Failed",
          description: "Failed to load template.",
          variant: "destructive",
        })
        return null
      }
    } catch (error) {
      console.error("Error loading template:", error)
      toast({
        title: "Load Error",
        description: "An error occurred while loading the template.",
        variant: "destructive",
      })
      return null
    }
  }

  const clearGeneratedTemplate = () => {
    setGeneratedTemplate(null)
  }

  const value = {
    isGenerating,
    generatedTemplate,
    savedTemplates,
    loadingSavedTemplates,
    generateEventContent,
    saveTemplate,
    loadSavedTemplates,
    loadTemplateById,
    clearGeneratedTemplate,
  }

  return <AIGenerationContext.Provider value={value}>{children}</AIGenerationContext.Provider>
}
