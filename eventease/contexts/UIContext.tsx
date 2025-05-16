"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useTheme } from "next-themes"

interface UIContextType {
  // Mobile menu state
  isMobileMenuOpen: boolean
  toggleMobileMenu: () => void
  closeMobileMenu: () => void

  // Theme
  theme: string | undefined
  setTheme: (theme: string) => void

  // Search
  isSearchOpen: boolean
  toggleSearch: () => void
  closeSearch: () => void

  // Notifications
  notifications: Notification[]
  addNotification: (notification: Notification) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void

  // Modal
  modalContent: React.ReactNode | null
  modalTitle: string
  showModal: (title: string, content: React.ReactNode) => void
  hideModal: () => void

  // Loading state
  isPageLoading: boolean
  setPageLoading: (loading: boolean) => void
}

export interface Notification {
  id: string
  type: "info" | "success" | "warning" | "error"
  message: string
  title?: string
  duration?: number
}

// Create context with default values
const UIContext = createContext<UIContextType>({
  isMobileMenuOpen: false,
  toggleMobileMenu: () => {},
  closeMobileMenu: () => {},

  theme: "system",
  setTheme: () => {},

  isSearchOpen: false,
  toggleSearch: () => {},
  closeSearch: () => {},

  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
  clearNotifications: () => {},

  modalContent: null,
  modalTitle: "",
  showModal: () => {},
  hideModal: () => {},

  isPageLoading: false,
  setPageLoading: () => {},
})

// Hook to use the UI context
export const useUI = () => useContext(UIContext)

// Provider component
export const UIProvider = ({ children }: { children: React.ReactNode }) => {
  // Theme
  const { theme, setTheme: setNextTheme } = useTheme()

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false)

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Modal
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null)
  const [modalTitle, setModalTitle] = useState<string>("")

  // Page loading state
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false)

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev)

    // If opening menu, close search
    if (!isMobileMenuOpen) {
      setIsSearchOpen(false)
    }
  }

  // Close mobile menu
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // Toggle search
  const toggleSearch = () => {
    setIsSearchOpen((prev) => !prev)

    // If opening search, close menu
    if (!isSearchOpen) {
      setIsMobileMenuOpen(false)
    }
  }

  // Close search
  const closeSearch = () => {
    setIsSearchOpen(false)
  }

  // Add notification
  const addNotification = (notification: Notification) => {
    // Generate ID if not provided
    const id = notification.id || Math.random().toString(36).substring(2, 9)
    const newNotification = { ...notification, id }

    setNotifications((prev) => [...prev, newNotification])

    // Auto remove notification after duration
    if (notification.duration !== 0) {
      const duration = notification.duration || 5000 // Default 5 seconds

      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }
  }

  // Remove notification
  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([])
  }

  // Show modal
  const showModal = (title: string, content: React.ReactNode) => {
    setModalTitle(title)
    setModalContent(content)
  }

  // Hide modal
  const hideModal = () => {
    setModalContent(null)
    setModalTitle("")
  }

  // Set page loading
  const setPageLoading = (loading: boolean) => {
    setIsPageLoading(loading)
  }

  // Close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => {
      closeMobileMenu()
      closeSearch()
    }

    // Add event listener for route changes
    window.addEventListener("popstate", handleRouteChange)

    return () => {
      window.removeEventListener("popstate", handleRouteChange)
    }
  }, [])

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileMenu()
        closeSearch()
        hideModal()
      }
    }

    window.addEventListener("keydown", handleEscKey)

    return () => {
      window.removeEventListener("keydown", handleEscKey)
    }
  }, [])

  const value = {
    isMobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu,

    theme,
    setTheme: setNextTheme,

    isSearchOpen,
    toggleSearch,
    closeSearch,

    notifications,
    addNotification,
    removeNotification,
    clearNotifications,

    modalContent,
    modalTitle,
    showModal,
    hideModal,

    isPageLoading,
    setPageLoading,
  }

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export default UIContext
