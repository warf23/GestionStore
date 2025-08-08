'use client'

import { useQuery } from '@tanstack/react-query'

export interface DashboardStats {
  // Today's stats
  todaySales: number
  todayPurchases: number
  todayRevenue: number
  todayCosts: number
  
  // All time stats
  totalSales: number
  totalPurchases: number
  totalRevenue: number
  totalCosts: number
  
  // Products stats
  totalProductsSold: number
  totalProductsPurchased: number
  
  // Users
  activeUsers: number
  
  // Calculated metrics
  averageBasket: number
  profit: number
  
  // Monthly stats
  monthlySales: number
  monthlyPurchases: number

  // New analytics
  dailySeries: Array<{ date: string; ventes: number; achats: number; revenus: number }>
  topProducts: Array<{ name: string; quantite: number; revenus: number }>
  salesByCategory: Array<{ category_id: number; name: string; quantite: number }>
}

// Fetch dashboard statistics
export function useDashboardStats(
  range?: { from?: string; to?: string },
  options?: { categoryId?: number | null }
) {
  return useQuery({
    queryKey: ['dashboard-stats', range?.from ?? null, range?.to ?? null, options?.categoryId ?? null],
    queryFn: async (): Promise<DashboardStats> => {
      const params = new URLSearchParams()
      if (range?.from) params.set('from', range.from)
      if (range?.to) params.set('to', range.to)
      if (options?.categoryId) params.set('category_id', String(options.categoryId))
      const response = await fetch(`/api/dashboard/stats${params.toString() ? `?${params.toString()}` : ''}`)
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats')
      }
      const data = await response.json()
      return data.stats
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}