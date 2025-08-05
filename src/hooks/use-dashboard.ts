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
}

// Fetch dashboard statistics
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const response = await fetch('/api/dashboard/stats')
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