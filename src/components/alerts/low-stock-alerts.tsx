'use client'

import { useState } from 'react'
import { AlertTriangle, Package, X, Settings, Eye, ExternalLink, TrendingDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLowStockProducts } from '@/hooks/use-category-products'
import { CategoryProduct } from '@/hooks/use-category-products'

interface LowStockAlertsProps {
  threshold?: number
  onProductClick?: (product: CategoryProduct) => void
  compact?: boolean
}

export function LowStockAlerts({ 
  threshold = 5, 
  onProductClick,
  compact = false 
}: LowStockAlertsProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [customThreshold, setCustomThreshold] = useState(threshold)
  const [showSettings, setShowSettings] = useState(false)
  
  const { data: lowStockProducts = [], isLoading, error } = useLowStockProducts(customThreshold)

  const criticalProducts = lowStockProducts.filter(p => p.quantite_disponible <= 0)
  const lowProducts = lowStockProducts.filter(p => p.quantite_disponible > 0)

  if (isLoading) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
          <span className="text-orange-700 text-sm">Vérification des stocks...</span>
        </div>
      </div>
    )
  }

  if (error || lowStockProducts.length === 0) {
    if (compact) return null
    
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4 text-green-600" />
          <span className="text-green-700 text-sm font-medium">Tous les stocks sont normaux</span>
        </div>
      </div>
    )
  }

  if (compact) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <span className="text-orange-700 text-sm font-medium">
              {lowStockProducts.length} produit{lowStockProducts.length > 1 ? 's' : ''} en stock faible
            </span>
          </div>
          <Badge variant="destructive" className="text-xs">
            {criticalProducts.length} critique{criticalProducts.length > 1 ? 's' : ''}
          </Badge>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-orange-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-orange-200 bg-orange-50">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <div>
            <h3 className="font-medium text-orange-900">Alertes de Stock</h3>
            <p className="text-sm text-orange-700">
              {lowStockProducts.length} produit{lowStockProducts.length > 1 ? 's' : ''} nécessitent votre attention
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Eye className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">
              Seuil d'alerte:
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={customThreshold}
              onChange={(e) => setCustomThreshold(Number(e.target.value))}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <span className="text-sm text-gray-500">unités ou moins</span>
          </div>
        </div>
      )}

      {/* Content */}
      {!isMinimized && (
        <div className="p-4">
          {/* Critical Stock (0 items) */}
          {criticalProducts.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <h4 className="font-medium text-red-900">Rupture de Stock</h4>
                <Badge variant="destructive">{criticalProducts.length}</Badge>
              </div>
              <div className="space-y-2">
                {criticalProducts.map((product, index) => (
                  <ProductAlertCard
                    key={`critical_${product.produit_nom}_${index}`}
                    product={product}
                    severity="critical"
                    onProductClick={onProductClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Low Stock */}
          {lowProducts.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <TrendingDown className="h-4 w-4 text-orange-600" />
                <h4 className="font-medium text-orange-900">Stock Faible</h4>
                <Badge variant="secondary">{lowProducts.length}</Badge>
              </div>
              <div className="space-y-2">
                {lowProducts.map((product, index) => (
                  <ProductAlertCard
                    key={`low_${product.produit_nom}_${index}`}
                    product={product}
                    severity="low"
                    onProductClick={onProductClick}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface ProductAlertCardProps {
  product: CategoryProduct
  severity: 'critical' | 'low'
  onProductClick?: (product: CategoryProduct) => void
}

function ProductAlertCard({ product, severity, onProductClick }: ProductAlertCardProps) {
  const isCritical = severity === 'critical'
  
  return (
    <div className={`p-3 rounded border ${
      isCritical 
        ? 'bg-red-50 border-red-200' 
        : 'bg-orange-50 border-orange-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h5 className="font-medium text-gray-900">{product.produit_nom}</h5>
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: product.category_couleur }}
            />
            <span className="text-xs text-gray-500">{product.category_nom}</span>
          </div>
          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-600">
            <span>Disponible: {product.quantite_disponible}</span>
            <span>Dernier prix: {product.dernier_prix_achat.toFixed(2)} €</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge
            variant={isCritical ? "destructive" : "secondary"}
            className="text-xs"
          >
            {isCritical ? 'Rupture' : 'Faible'}
          </Badge>
          
          {onProductClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onProductClick(product)}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}