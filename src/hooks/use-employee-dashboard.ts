'use client'

import { useQuery } from '@tanstack/react-query'

export interface EmployeeStats {
  // Today's stats
  todaySales: number
  todayRevenue: number
  
  // All time stats for this employee
  totalSales: number
  totalRevenue: number
  
  // Products stats
  totalProductsSold: number
  
  // Calculated metrics
  averageBasket: number
  
  // Time-based stats
  weeklySales: number
  monthlySales: number
  salesThisMonth: any[]
}

// Fetch employee-specific dashboard statistics
export function useEmployeeDashboardStats() {
  return useQuery({
    queryKey: ['employee-dashboard-stats'],
    queryFn: async (): Promise<EmployeeStats> => {
      const response = await fetch('/api/dashboard/employee-stats')
      if (!response.ok) {
        throw new Error('Failed to fetch employee dashboard stats')
      }
      const data = await response.json()
      return data.stats
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}