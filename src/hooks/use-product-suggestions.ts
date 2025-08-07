'use client'

import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export interface ProductSuggestion {
  produit_nom: string
  quantite_achetee: number
  quantite_vendue: number
  quantite_disponible: number
  dernier_prix_achat: number
}

// Fetch product suggestions with available quantities
export function useProductSuggestions(searchQuery: string, enabled: boolean = true) {
  const debouncedSearchQuery = useDebounce(searchQuery, 300) // 300ms debounce
  
  return useQuery({
    queryKey: ['product-suggestions', debouncedSearchQuery],
    queryFn: async (): Promise<ProductSuggestion[]> => {
      const params = new URLSearchParams()
      if (debouncedSearchQuery.trim()) {
        params.append('q', debouncedSearchQuery.trim())
      }
      
      const response = await fetch(`/api/products/suggestions?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch product suggestions')
      }
      const data = await response.json()
      return data.products || []
    },
    enabled: enabled,
    staleTime: 1000 * 15, // Cache for 15 seconds - more real-time
    refetchOnWindowFocus: true, // Refetch when window gets focus to get fresh data
  })
}