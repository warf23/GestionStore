'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PurchaseWithLines } from '@/types'

// Fetch all purchases
export function usePurchases() {
  return useQuery({
    queryKey: ['purchases'],
    queryFn: async (): Promise<PurchaseWithLines[]> => {
      const response = await fetch('/api/purchases')
      if (!response.ok) {
        throw new Error('Failed to fetch purchases')
      }
      const data = await response.json()
      return data.purchases
    },
  })
}

// Create purchase mutation
export function useCreatePurchase() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (purchaseData: {
      nom_fournisseur: string
      lignes: Array<{
        produit_nom: string
        quantite: number
        prix_unitaire: number
      }>
    }) => {
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(purchaseData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create purchase')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

// Update purchase mutation
export function useUpdatePurchase() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...purchaseData }: {
      id: number
      nom_fournisseur: string
      lignes: Array<{
        produit_nom: string
        quantite: number
        prix_unitaire: number
      }>
    }) => {
      const response = await fetch(`/api/purchases/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(purchaseData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update purchase')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

// Delete purchase mutation
export function useDeletePurchase() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/purchases/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete purchase')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}