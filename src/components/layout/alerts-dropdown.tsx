'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, AlertTriangle, Package, X, Eye, Settings, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLowStockProducts } from '@/hooks/use-category-products'
import { CategoryProduct } from '@/hooks/use-category-products'
import { cn } from '@/lib/utils'

interface AlertsDropdownProps {
  onSettingsClick?: () => void
}

export function AlertsDropdown({ onSettingsClick }: AlertsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [threshold, setThreshold] = useState(5)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const { data: lowStockProducts = [], isLoading, refetch } = useLowStockProducts(threshold)
  
  const criticalProducts = lowStockProducts.filter(p => p.quantite_disponible <= 0)
  const lowProducts = lowStockProducts.filter(p => p.quantite_disponible > 0)
  const totalAlerts = lowStockProducts.length

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Auto-refresh alerts every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 15000)

    return () => clearInterval(interval)
  }, [refetch])

  // Listen for storage events to trigger refresh when sales/purchases are made
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'inventory-updated') {
        refetch()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [refetch])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Alert Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200 group"
      >
        <Bell className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
        
        {/* Alert Badge */}
        {totalAlerts > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
            {totalAlerts > 9 ? '9+' : totalAlerts}
          </span>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full animate-ping"></span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-blue-50/30">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Alertes de Stock</h3>
                <p className="text-sm text-gray-600">
                  {totalAlerts === 0 ? 'Aucune alerte' : `${totalAlerts} produit${totalAlerts > 1 ? 's' : ''} nécessitent votre attention`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              {onSettingsClick && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSettingsClick}
                  className="h-8 w-8 p-0"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Vérification des stocks...</p>
              </div>
            ) : totalAlerts === 0 ? (
              <div className="p-6 text-center">
                <Package className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="font-medium text-gray-900 mb-1">Tout va bien !</p>
                <p className="text-sm text-gray-600">Tous les stocks sont à des niveaux normaux</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {/* Critical Alerts */}
                {criticalProducts.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <h4 className="font-medium text-red-900">Rupture de Stock</h4>
                      <Badge variant="destructive" className="text-xs">
                        {criticalProducts.length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {criticalProducts.slice(0, 3).map((product, index) => (
                        <AlertCard key={`critical_${index}`} product={product} severity="critical" />
                      ))}
                      {criticalProducts.length > 3 && (
                        <div className="text-xs text-gray-500 text-center py-2">
                          +{criticalProducts.length - 3} autres produits en rupture
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Low Stock Alerts */}
                {lowProducts.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Package className="h-4 w-4 text-orange-600" />
                      <h4 className="font-medium text-orange-900">Stock Faible</h4>
                      <Badge variant="secondary" className="text-xs">
                        {lowProducts.length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {lowProducts.slice(0, 3).map((product, index) => (
                        <AlertCard key={`low_${index}`} product={product} severity="low" />
                      ))}
                      {lowProducts.length > 3 && (
                        <div className="text-xs text-gray-500 text-center py-2">
                          +{lowProducts.length - 3} autres produits en stock faible
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {totalAlerts > 0 && (
            <div className="p-4 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/30 to-blue-50/20">
              <Button
                onClick={() => {
                  setIsOpen(false)
                  if (onSettingsClick) onSettingsClick()
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                size="sm"
              >
                Voir tous les paramètres
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface AlertCardProps {
  product: CategoryProduct
  severity: 'critical' | 'low'
}

function AlertCard({ product, severity }: AlertCardProps) {
  const isCritical = severity === 'critical'
  
  return (
    <div className={cn(
      "p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02]",
      isCritical 
        ? "bg-red-50/50 border-red-200/50 hover:bg-red-50" 
        : "bg-orange-50/50 border-orange-200/50 hover:bg-orange-50"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h5 className="font-medium text-gray-900 truncate">{product.produit_nom}</h5>
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: product.category_couleur }}
            />
          </div>
          <div className="flex items-center space-x-3 text-xs text-gray-600">
            <span className="flex items-center">
              <Package className="h-3 w-3 mr-1" />
              {product.quantite_disponible}
            </span>
            <span className="text-gray-400">•</span>
            <span className="truncate">{product.category_nom}</span>
          </div>
        </div>
        
        <Badge
          variant={isCritical ? "destructive" : "secondary"}
          className="text-xs flex-shrink-0"
        >
          {isCritical ? 'Rupture' : 'Faible'}
        </Badge>
      </div>
    </div>
  )
}