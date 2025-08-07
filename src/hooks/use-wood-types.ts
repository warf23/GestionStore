'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { WoodType, CreateWoodType } from '@/types'

// Fetch all wood types
export function useWoodTypes() {
  return useQuery({
    queryKey: ['wood-types'],
    queryFn: async (): Promise<WoodType[]> => {
      const response = await fetch('/api/wood-types')
      if (!response.ok) {
        throw new Error('Failed to fetch wood types')
      }
      const data = await response.json()
      return data.woodTypes
    },
  })
}

// Create wood type mutation
export function useCreateWoodType() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (woodTypeData: CreateWoodType) => {
      const response = await fetch('/api/wood-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(woodTypeData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create wood type')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wood-types'] })
    },
  })
}

// Update wood type mutation
export function useUpdateWoodType() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...woodTypeData }: { id: number } & CreateWoodType) => {
      const response = await fetch(`/api/wood-types/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(woodTypeData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update wood type')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wood-types'] })
    },
  })
}

// Delete wood type mutation
export function useDeleteWoodType() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/wood-types/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete wood type')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wood-types'] })
    },
  })
}