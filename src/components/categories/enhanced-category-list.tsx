'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Package, AlertTriangle, TrendingDown, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCategoriesWithProducts } from '@/hooks/use-category-products'
import { CategoryProduct } from '@/hooks/use-category-products'

interface EnhancedCategoryListProps {
  onProductClick?: (product: CategoryProduct) => void
}

export function EnhancedCategoryList({ onProductClick }: EnhancedCategoryListProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())
  const { data: categories = [], isLoading, error } = useCategoriesWithProducts()

  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const getStockStatusColor = (quantite: number) => {
    if (quantite <= 0) return 'text-red-600 bg-red-50'
    if (quantite <= 5) return 'text-orange-600 bg-orange-50'
    if (quantite <= 10) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  const getStockStatusText = (quantite: number) => {
    if (quantite <= 0) return 'Rupture'
    if (quantite <= 5) return 'Critique'
    if (quantite <= 10) return 'Faible'
    return 'Normal'
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Chargement des catégories et produits...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-600">Erreur lors du chargement des données</p>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">Aucune catégorie trouvée</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {categories.map(category => (
        <div key={category.id} className="border border-gray-200 rounded-lg bg-white">
          {/* Category Header */}
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
            onClick={() => toggleCategory(category.id)}
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {expandedCategories.has(category.id) ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: category.couleur }}
                />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{category.nom}</h3>
                {category.description && (
                  <p className="text-sm text-gray-500">{category.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Low Stock Alert */}
              {category.low_stock_count > 0 && (
                <Badge variant="destructive" className="flex items-center space-x-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>{category.low_stock_count} alerte{category.low_stock_count > 1 ? 's' : ''}</span>
                </Badge>
              )}
              
              {/* Product Count */}
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Package className="h-3 w-3" />
                <span>{category.total_products} produit{category.total_products > 1 ? 's' : ''}</span>
              </Badge>
            </div>
          </div>

          {/* Products List */}
          {expandedCategories.has(category.id) && (
            <div className="border-t border-gray-200 bg-gray-50">
              {category.products.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Package className="h-6 w-6 mx-auto mb-2 opacity-50" />
                  <p>Aucun produit dans cette catégorie</p>
                </div>
              ) : (
                <div className="p-4">
                  <div className="space-y-2">
                    {category.products.map((product, index) => (
                      <div
                        key={`${product.produit_nom}_${index}`}
                        className="flex items-center justify-between p-3 bg-white rounded border"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-medium text-gray-900">{product.produit_nom}</h4>
                            {product.is_low_stock && (
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                            )}
                          </div>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            <span>Acheté: {product.quantite_achetee}</span>
                            <span>Vendu: {product.quantite_vendue}</span>
                            <span>Prix: {product.dernier_prix_achat.toFixed(2)} €</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {/* Stock Status */}
                          <Badge
                            className={`${getStockStatusColor(product.quantite_disponible)} font-medium`}
                          >
                            {product.quantite_disponible} en stock
                          </Badge>
                          
                          <Badge
                            variant="outline"
                            className={getStockStatusColor(product.quantite_disponible)}
                          >
                            {getStockStatusText(product.quantite_disponible)}
                          </Badge>
                          
                          {/* View Details Button */}
                          {onProductClick && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onProductClick(product)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}