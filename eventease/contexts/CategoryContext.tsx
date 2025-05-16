"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAuth } from "./AuthContext"
import { CategoryService, type Category } from "@/lib/services/category-service"
import { toast } from "@/components/ui/use-toast"
import { handleApiError } from "@/lib/api-client"

interface CategoryContextType {
  // Category data
  categories: Category[]
  currentCategory: Category | null

  // Category actions
  fetchCategories: () => Promise<void>
  fetchCategoryBySlug: (slug: string) => Promise<Category | null>
  createCategory: (categoryData: Partial<Category>) => Promise<boolean>
  updateCategory: (id: number, categoryData: Partial<Category>) => Promise<boolean>
  deleteCategory: (id: number) => Promise<boolean>

  // Category state
  isLoading: boolean
  error: string | null
}

// Create context with default values
const CategoryContext = createContext<CategoryContextType>({
  categories: [],
  currentCategory: null,

  fetchCategories: async () => {},
  fetchCategoryBySlug: async () => null,
  createCategory: async () => false,
  updateCategory: async () => false,
  deleteCategory: async () => false,

  isLoading: false,
  error: null,
})

// Hook to use the category context
export const useCategories = () => useContext(CategoryContext)

// Provider component
export const CategoryProvider = ({ children }: { children: React.ReactNode }) => {
  const { role, isAuthenticated } = useAuth()

  // State for categories
  const [categories, setCategories] = useState<Category[]>([])
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)

  // State for loading and errors
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await CategoryService.getCategories()
      setCategories(data.categories)
    } catch (err) {
      console.error("Error fetching categories:", err)
      setError(handleApiError(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch a single category by slug
  const fetchCategoryBySlug = useCallback(async (slug: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await CategoryService.getCategoryBySlug(slug)
      setCurrentCategory(data.category)
      return data.category
    } catch (err) {
      console.error("Error fetching category:", err)
      setError(handleApiError(err))
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create a new category (admin only)
  const createCategory = useCallback(
    async (categoryData: Partial<Category>) => {
      if (!isAuthenticated || role !== "admin") {
        setError("You must be logged in as an admin to create categories")
        return false
      }

      setIsLoading(true)
      setError(null)

      try {
        const data = await CategoryService.createCategory(categoryData)

        // Show success message
        toast({
          title: "Category Created",
          description: data.message || "Category has been created successfully",
        })

        // Refresh categories
        fetchCategories()
        return true
      } catch (err) {
        console.error("Error creating category:", err)
        setError(handleApiError(err))

        // Show error message
        toast({
          title: "Error",
          description: handleApiError(err),
          variant: "destructive",
        })

        return false
      } finally {
        setIsLoading(false)
      }
    },
    [isAuthenticated, role, fetchCategories],
  )

  // Update an existing category (admin only)
  const updateCategory = useCallback(
    async (id: number, categoryData: Partial<Category>) => {
      if (!isAuthenticated || role !== "admin") {
        setError("You must be logged in as an admin to update categories")
        return false
      }

      setIsLoading(true)
      setError(null)

      try {
        const data = await CategoryService.updateCategory(id, categoryData)

        // Show success message
        toast({
          title: "Category Updated",
          description: data.message || "Category has been updated successfully",
        })

        // Refresh categories and current category
        fetchCategories()
        if (currentCategory?.id === id) {
          setCurrentCategory(data.category)
        }

        return true
      } catch (err) {
        console.error("Error updating category:", err)
        setError(handleApiError(err))

        // Show error message
        toast({
          title: "Error",
          description: handleApiError(err),
          variant: "destructive",
        })

        return false
      } finally {
        setIsLoading(false)
      }
    },
    [isAuthenticated, role, currentCategory, fetchCategories],
  )

  // Delete a category (admin only)
  const deleteCategory = useCallback(
    async (id: number) => {
      if (!isAuthenticated || role !== "admin") {
        setError("You must be logged in as an admin to delete categories")
        return false
      }

      setIsLoading(true)
      setError(null)

      try {
        const data = await CategoryService.deleteCategory(id)

        // Show success message
        toast({
          title: "Category Deleted",
          description: data.message || "Category has been deleted successfully",
        })

        // Remove from categories
        setCategories((prev) => prev.filter((category) => category.id !== id))

        // If this is the current category, clear it
        if (currentCategory?.id === id) {
          setCurrentCategory(null)
        }

        return true
      } catch (err) {
        console.error("Error deleting category:", err)
        setError(handleApiError(err))

        // Show error message
        toast({
          title: "Error",
          description: handleApiError(err),
          variant: "destructive",
        })

        return false
      } finally {
        setIsLoading(false)
      }
    },
    [isAuthenticated, role, currentCategory],
  )

  // Initial data loading
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const value = {
    categories,
    currentCategory,

    fetchCategories,
    fetchCategoryBySlug,
    createCategory,
    updateCategory,
    deleteCategory,

    isLoading,
    error,
  }

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>
}

export default CategoryContext
