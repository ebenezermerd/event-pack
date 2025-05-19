import { apiClient } from "@/lib/api-client"

/**
 * Category type definition
 */
export interface Category {
  id: number
  name: string
  description?: string
  icon?: string
  slug: string
  eventCount?: number
}

/**
 * Service for handling category-related API calls
 */
export class CategoryService {
  /**
   * Fetch all categories
   */
  static async getCategories() {
    return await apiClient.get<{ categories: Category[] }>("/api/categories")
  }

  /**
   * Fetch a single category by ID
   */
  static async getCategoryById(id: number) {
    return await apiClient.get<{ category: Category }>(`/api/categories/${id}`)
  }

  /**
   * Fetch a single category by slug
   */
  static async getCategoryBySlug(slug: string) {
    return await apiClient.get<{ category: Category }>(`/api/categories/slug/${slug}`)
  }

  /**
   * Create a new category (admin only)
   */
  static async createCategory(categoryData: Partial<Category>) {
    return await apiClient.post<{ category: Category; message: string }>("/api/admin/categories", categoryData)
  }

  /**
   * Update an existing category (admin only)
   */
  static async updateCategory(id: number, categoryData: Partial<Category>) {
    return await apiClient.put<{ category: Category; message: string }>(`/api/admin/categories/${id}`, categoryData)
  }

  /**
   * Delete a category (admin only)
   */
  static async deleteCategory(id: number) {
    return await apiClient.delete<{ message: string }>(`/api/admin/categories/${id}`)
  }
}
