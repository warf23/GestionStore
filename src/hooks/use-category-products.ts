'use client'

import { useQuery } from '@tanstack/react-query'

export interface CategoryProduct {
  produit_nom: string
  quantite_achetee: number
  quantite_vendue: number
  quantite_disponible: number
  dernier_prix_achat: number
  category_id: number | null
  category_nom?: string
  category_couleur?: string
  wood_type_id: number | null
  wood_type_nom: string | null
  wood_type_couleur: string | null
  is_low_stock: boolean
}

export interface CategoryWithProducts {
  id: number
  nom: string
  description: string | null
  couleur: string
  products: CategoryProduct[]
  total_products: number
  low_stock_count: number
}

// Fetch products for a specific category with stock information
export function useCategoryProducts(categoryId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ['category-products', categoryId],
    queryFn: async (): Promise<CategoryProduct[]> => {
      const response = await fetch(`/api/categories/${categoryId}/products`)
      if (!response.ok) {
        throw new Error('Failed to fetch category products')
      }
      const data = await response.json()
      return data.products || []
    },
    enabled,
    staleTime: 1000 * 30, // Cache for 30 seconds
    refetchOnWindowFocus: false,
  })
}

// Fetch all categories with their products and stock information
export function useCategoriesWithProducts() {
  return useQuery({
    queryKey: ['categories-with-products'],
    queryFn: async (): Promise<CategoryWithProducts[]> => {
      const response = await fetch('/api/categories/with-products')
      if (!response.ok) {
        throw new Error('Failed to fetch categories with products')
      }
      const data = await response.json()
      return data.categories || []
    },
    staleTime: 1000 * 30, // Cache for 30 seconds
    refetchOnWindowFocus: false,
  })
}

// Get low stock products across all categories
export function useLowStockProducts(threshold: number = 5) {
  return useQuery({
    queryKey: ['low-stock-products', threshold],
    queryFn: async (): Promise<CategoryProduct[]> => {
      const response = await fetch(`/api/products/low-stock?threshold=${threshold}`)
      if (!response.ok) {
        throw new Error('Failed to fetch low stock products')
      }
      const data = await response.json()
      return data.products || []
    },
    staleTime: 1000 * 10, // Cache for 10 seconds - more real-time
    refetchInterval: 1000 * 15, // Auto-refetch every 15 seconds
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchIntervalInBackground: false, // Don't refetch in background to save resources
  })
}