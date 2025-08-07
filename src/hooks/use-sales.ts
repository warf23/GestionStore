'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SaleWithLines } from '@/types'

// Fetch all sales
export interface SalesFilters {
  from?: string // ISO date
  to?: string   // ISO date
  q?: string
  categoryId?: number | null
}

export function useSales(filters: SalesFilters = {}) {
  const params = new URLSearchParams()
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  if (filters.q) params.set('q', filters.q)
  if (filters.categoryId) params.set('categoryId', String(filters.categoryId))

  return useQuery({
    queryKey: ['sales', filters],
    queryFn: async (): Promise<SaleWithLines[]> => {
      const url = params.toString() ? `/api/sales?${params.toString()}` : '/api/sales'
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch sales')
      }
      const data = await response.json()
      return data.sales
    },
  })
}

// Create sale mutation
export function useCreateSale() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (saleData: {
      nom_client: string
      lignes: Array<{
        produit_nom: string
        quantite: number
        prix_unitaire: number
      }>
    }) => {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create sale')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['employee-dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['product-suggestions'] })
      queryClient.invalidateQueries({ queryKey: ['product-stock'] })
      queryClient.invalidateQueries({ queryKey: ['low-stock-products'] })
      
      // Trigger a storage event to notify other components
      if (typeof window !== 'undefined') {
        localStorage.setItem('inventory-updated', Date.now().toString())
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'inventory-updated',
          newValue: Date.now().toString()
        }))
      }
    },
  })
}

// Update sale mutation
export function useUpdateSale() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...saleData }: {
      id: number
      nom_client: string
      lignes: Array<{
        produit_nom: string
        quantite: number
        prix_unitaire: number
      }>
    }) => {
      const response = await fetch(`/api/sales/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update sale')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['employee-dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['product-suggestions'] })
      queryClient.invalidateQueries({ queryKey: ['product-stock'] })
      queryClient.invalidateQueries({ queryKey: ['low-stock-products'] })
      
      // Trigger a storage event to notify other components
      if (typeof window !== 'undefined') {
        localStorage.setItem('inventory-updated', Date.now().toString())
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'inventory-updated',
          newValue: Date.now().toString()
        }))
      }
    },
  })
}

// Delete sale mutation
export function useDeleteSale() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/sales/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete sale')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['employee-dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['product-suggestions'] })
      queryClient.invalidateQueries({ queryKey: ['product-stock'] })
    },
  })
}