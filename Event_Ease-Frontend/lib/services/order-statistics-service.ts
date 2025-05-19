import { apiClient } from "@/lib/api-client"

/**
 * Order statistics type definitions
 */
export interface OrderStatistics {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  ordersByStatus: Record<string, number>
  revenueByPeriod: {
    period: string
    orders: number
    revenue: number
  }[]
  topEvents: {
    id: string
    title: string
    orders: number
    revenue: number
  }[]
  paymentMethods: {
    method: string
    count: number
    percentage: number
  }[]
}

export interface TicketSalesStatistics {
  totalSold: number
  totalRevenue: number
  totalCapacity: number
  percentageSold: number
  ticketTypes: {
    ticketTypeId: string
    name: string
    price: number
    sold: number
    revenue: number
  }[]
  salesByDate: {
    date: string
    orders: number
    revenue: number
  }[]
}

export interface RevenueReport {
  totalRevenue: number
  platformFees: number
  netRevenue: number
  revenueByPeriod: {
    period: string
    revenue: number
    platformFee: number
    netRevenue: number
  }[]
  revenueByEvent: {
    eventId: string
    eventTitle: string
    revenue: number
    platformFee: number
    netRevenue: number
  }[]
}

/**
 * Service for handling order statistics API calls
 */
export class OrderStatisticsService {
  /**
   * Get order statistics
   */
  static async getOrderStatistics(period?: string, startDate?: string, endDate?: string, eventId?: string) {
    // Build query params
    const queryParams = new URLSearchParams()
    if (period) queryParams.append("period", period)
    if (startDate) queryParams.append("startDate", startDate)
    if (endDate) queryParams.append("endDate", endDate)
    if (eventId) queryParams.append("eventId", eventId)

    return await apiClient.get<{ success: boolean; statistics: OrderStatistics }>(
      `/orders/statistics?${queryParams.toString()}`,
    )
  }

  /**
   * Get ticket sales statistics for an event
   */
  static async getTicketSalesStatistics(eventId: string) {
    return await apiClient.get<{ success: boolean; statistics: TicketSalesStatistics }>(
      `/events/${eventId}/ticket-sales`,
    )
  }

  /**
   * Export orders to Excel
   */
  static async exportOrdersToExcel(startDate?: string, endDate?: string, status?: string, eventId?: string) {
    // Build query params
    const queryParams = new URLSearchParams()
    if (startDate) queryParams.append("startDate", startDate)
    if (endDate) queryParams.append("endDate", endDate)
    if (status) queryParams.append("status", status)
    if (eventId) queryParams.append("eventId", eventId)

    return await apiClient.get<Blob>(`/orders/export/excel?${queryParams.toString()}`, {
      responseType: "blob",
    })
  }

  /**
   * Generate attendee list PDF
   */
  static async generateAttendeeListPDF(eventId: string) {
    return await apiClient.get<Blob>(`/events/${eventId}/attendees/pdf`, {
      responseType: "blob",
    })
  }

  /**
   * Get revenue report
   */
  static async getRevenueReport(
    startDate?: string,
    endDate?: string,
    groupBy: "day" | "week" | "month" | "year" = "month",
  ) {
    // Build query params
    const queryParams = new URLSearchParams()
    if (startDate) queryParams.append("startDate", startDate)
    if (endDate) queryParams.append("endDate", endDate)
    queryParams.append("groupBy", groupBy)

    return await apiClient.get<{ success: boolean; report: RevenueReport }>(`/revenue/report?${queryParams.toString()}`)
  }

  /**
   * Get admin platform analytics
   */
  static async getAdminAnalytics(period = "30") {
    return await apiClient.get<{ success: boolean; statistics: any }>(`/admin/analytics?period=${period}`)
  }

  /**
   * Get organizer analytics
   */
  static async getOrganizerAnalytics(eventId?: string) {
    const queryParams = new URLSearchParams()
    if (eventId) queryParams.append("eventId", eventId)

    return await apiClient.get<{ success: boolean; analytics: any }>(`/organizer/analytics?${queryParams.toString()}`)
  }
}
