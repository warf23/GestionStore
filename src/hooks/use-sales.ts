'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SaleWithLines } from '@/types'

// Fetch all sales
export function useSales() {
  return useQuery({
    queryKey: ['sales'],
    queryFn: async (): Promise<SaleWithLines[]> => {
      const response = await fetch('/api/sales')
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
      queryClient.invalidateQueries({ queryKey: ['employee-dashboard-stats'] })
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
    },
  })
}