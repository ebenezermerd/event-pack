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

// Mock data for fallback
const mockCategories: Category[] = [
  {
    id: 1,
    name: "Technology",
    description: "Tech conferences, workshops, and meetups",
    icon: "laptop",
    slug: "technology",
    eventCount: 15
  },
  {
    id: 2,
    name: "Cultural",
    description: "Cultural festivals and celebrations",
    icon: "landmark",
    slug: "cultural",
    eventCount: 12
  },
  {
    id: 3,
    name: "Business",
    description: "Business conferences and networking events",
    icon: "briefcase",
    slug: "business",
    eventCount: 10
  },
  {
    id: 4,
    name: "Entertainment",
    description: "Concerts, shows, and performances",
    icon: "music",
    slug: "entertainment",
    eventCount: 8
  },
  {
    id: 5,
    name: "Sports",
    description: "Sporting events and competitions",
    icon: "trophy",
    slug: "sports",
    eventCount: 7
  }
];

/**
 * Service for handling category-related API calls
 */
export class CategoryService {
  /**
   * Fetch all categories
   */
  static async getCategories() {
    try {
      return await apiClient.get<{ categories: Category[] }>("/api/categories")
    } catch (error) {
      console.warn("Failed to fetch categories from API, using fallback data:", error);
      // Return mock data as fallback
      return { categories: mockCategories };
    }
  }

  /**
   * Fetch a single category by ID
   */
  static async getCategoryById(id: number) {
    try {
      return await apiClient.get<{ category: Category }>(`/api/categories/${id}`)
    } catch (error) {
      console.warn(`Failed to fetch category ${id} from API, using fallback data:`, error);
      // Return mock data as fallback
      const category = mockCategories.find(cat => cat.id === id) || mockCategories[0];
      return { category };
    }
  }

  /**
   * Fetch a single category by slug
   */
  static async getCategoryBySlug(slug: string) {
    try {
      return await apiClient.get<{ category: Category }>(`/api/categories/slug/${slug}`)
    } catch (error) {
      console.warn(`Failed to fetch category with slug ${slug} from API, using fallback data:`, error);
      // Return mock data as fallback
      const category = mockCategories.find(cat => cat.slug === slug) || mockCategories[0];
      return { category };
    }
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
