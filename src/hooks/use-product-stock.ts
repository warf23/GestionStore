'use client'

import { useQuery } from '@tanstack/react-query'

export interface ProductStock {
  produit_nom: string
  quantite_disponible: number
  quantite_achetee: number
  quantite_vendue: number
}

// Fetch stock information for a specific product
export function useProductStock(productName: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['product-stock', productName],
    queryFn: async (): Promise<ProductStock | null> => {
      if (!productName.trim()) return null
      
      const params = new URLSearchParams()
      params.append('q', productName.trim())
      
      const response = await fetch(`/api/products/suggestions?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch product stock')
      }
      const data = await response.json()
      const products = data.products || []
      
      // Find exact match
      const exactMatch = products.find((p: any) => 
        p.produit_nom.toLowerCase() === productName.toLowerCase()
      )
      
      return exactMatch || null
    },
    enabled: enabled && productName.trim().length > 0,
    staleTime: 1000 * 5, // Cache for 5 seconds (very real-time)
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 10, // Auto-refetch every 10 seconds
  })
}