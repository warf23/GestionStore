'use client'

import { useState, useRef, useEffect, forwardRef } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Package, AlertTriangle, CheckCircle } from 'lucide-react'

export interface ProductAutocompleteOption {
  value: string
  label: string
  quantite_disponible: number
  dernier_prix_achat: number
  category?: string
}

interface ProductAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect?: (option: ProductAutocompleteOption) => void
  options: ProductAutocompleteOption[]
  placeholder?: string
  className?: string
  disabled?: boolean
  loading?: boolean
}

export const ProductAutocomplete = forwardRef<HTMLInputElement, ProductAutocompleteProps>(
  ({ value, onChange, onSelect, options, placeholder, className, disabled, loading, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const [highlightedIndex, setHighlightedIndex] = useState(-1)
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const optionsRef = useRef<HTMLDivElement>(null)

    // Combine refs
    useEffect(() => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(inputRef.current)
        } else {
          ref.current = inputRef.current
        }
      }
    }, [ref])

    // Filter options based on search value
    const filteredOptions = value.trim() 
      ? options.filter(option => 
          option.label.toLowerCase().includes(value.toLowerCase()) ||
          option.category?.toLowerCase().includes(value.toLowerCase())
        )
      : options

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false)
          setHighlightedIndex(-1)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [])

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
          setIsOpen(true)
          setHighlightedIndex(0)
          e.preventDefault()
        }
        return
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setHighlightedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          )
          break
        case 'Enter':
          e.preventDefault()
          if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
            handleSelectOption(filteredOptions[highlightedIndex])
          }
          break
        case 'Escape':
          setIsOpen(false)
          setHighlightedIndex(-1)
          inputRef.current?.blur()
          break
      }
    }

    // Scroll highlighted option into view
    useEffect(() => {
      if (highlightedIndex >= 0 && optionsRef.current) {
        const highlightedElement = optionsRef.current.children[highlightedIndex] as HTMLElement
        if (highlightedElement) {
          highlightedElement.scrollIntoView({
            block: 'nearest',
            behavior: 'smooth'
          })
        }
      }
    }, [highlightedIndex])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      onChange(newValue)
      
      if (!isOpen) {
        setIsOpen(true)
      }
      setHighlightedIndex(-1)
    }

    const handleSelectOption = (option: ProductAutocompleteOption) => {
      onChange(option.value)
      onSelect?.(option)
      setIsOpen(false)
      setHighlightedIndex(-1)
      inputRef.current?.focus()
    }

    const handleInputFocus = () => {
      // Always show options when focused
      setIsOpen(true)
      if (filteredOptions.length > 0) {
        setHighlightedIndex(0)
      }
    }

    const getStockStatus = (quantity: number) => {
      if (quantity === 0) return { status: 'out', color: 'text-red-600', bgColor: 'bg-red-50', icon: AlertTriangle }
      if (quantity <= 5) return { status: 'low', color: 'text-orange-600', bgColor: 'bg-orange-50', icon: AlertTriangle }
      return { status: 'good', color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle }
    }

    const showOptions = isOpen && filteredOptions.length > 0

    return (
      <div ref={containerRef} className="relative">
        <div className="relative">
          <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={inputRef}
            value={value}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Cliquez pour voir tous les produits..."}
            className={cn("pl-10", className)}
            disabled={disabled}
            {...props}
          />
        </div>
        
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}

        {showOptions && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-auto">
            <div ref={optionsRef} className="py-1">
              {/* Header */}
              <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b bg-gray-50">
                {filteredOptions.length} produit{filteredOptions.length > 1 ? 's' : ''} disponible{filteredOptions.length > 1 ? 's' : ''}
              </div>
              
              {filteredOptions.map((option, index) => {
                const stockStatus = getStockStatus(option.quantite_disponible)
                const StatusIcon = stockStatus.icon
                
                return (
                  <div
                    key={`${option.value}-${index}`}
                    className={cn(
                      "px-4 py-3 cursor-pointer transition-colors duration-150 border-b border-gray-50 last:border-b-0",
                      "hover:bg-blue-50 hover:border-blue-100",
                      highlightedIndex === index && "bg-blue-50 border-blue-100"
                    )}
                    onClick={() => handleSelectOption(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900 truncate">
                            {option.label}
                          </h4>
                          {option.category && (
                            <Badge variant="secondary" className="text-xs">
                              {option.category}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 mt-1">
                          <div className={cn("flex items-center gap-1", stockStatus.color)}>
                            <StatusIcon className="h-3 w-3" />
                            <span className="text-sm font-medium">
                              {option.quantite_disponible} en stock
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            Dernier prix: <span className="font-medium">{option.dernier_prix_achat.toFixed(2)} DH</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full ml-3",
                        stockStatus.bgColor
                      )}>
                        <StatusIcon className={cn("h-4 w-4", stockStatus.color)} />
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {filteredOptions.length === 0 && value.trim() && (
                <div className="px-4 py-8 text-center text-gray-500">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucun produit trouvé pour "{value}"</p>
                  <p className="text-xs mt-1">Essayez un autre terme de recherche</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
)

ProductAutocomplete.displayName = 'ProductAutocomplete'