'use client'

import { useState, useRef, useEffect, forwardRef } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface AutocompleteOption {
  value: string
  label: string
  subtitle?: string
  badge?: string
}

interface AutocompleteInputProps {
  value: string
  onChange: (value: string) => void
  onSelect?: (option: AutocompleteOption) => void
  options: AutocompleteOption[]
  placeholder?: string
  className?: string
  disabled?: boolean
  loading?: boolean
}

export const AutocompleteInput = forwardRef<HTMLInputElement, AutocompleteInputProps>(
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
      if (!isOpen || options.length === 0) {
        if (e.key === 'ArrowDown' && options.length > 0) {
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
            prev < options.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : options.length - 1
          )
          break
        case 'Enter':
          e.preventDefault()
          if (highlightedIndex >= 0 && highlightedIndex < options.length) {
            handleSelectOption(options[highlightedIndex])
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
      
      // Only show suggestions after a short delay to avoid interfering with typing
      setTimeout(() => {
        if (options.length > 0) {
          setIsOpen(true)
        }
      }, 200)
      
      setHighlightedIndex(-1)
    }

    const handleSelectOption = (option: AutocompleteOption) => {
      onChange(option.value)
      onSelect?.(option)
      setIsOpen(false)
      setHighlightedIndex(-1)
      inputRef.current?.focus()
    }

    const handleInputFocus = () => {
      // Only show suggestions if there's already some text and options available
      if (value.length > 0 && options.length > 0) {
        setIsOpen(true)
      }
    }

    const showOptions = isOpen && options.length > 0

    return (
      <div ref={containerRef} className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={className}
          disabled={disabled}
          {...props}
        />
        
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          </div>
        )}

        {showOptions && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            <div ref={optionsRef}>
              {options.map((option, index) => (
                <div
                  key={`${option.value}-${index}`}
                  className={cn(
                    "px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center justify-between",
                    highlightedIndex === index && "bg-gray-100"
                  )}
                  onClick={() => handleSelectOption(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{option.label}</div>
                    {option.subtitle && (
                      <div className="text-sm text-gray-500">{option.subtitle}</div>
                    )}
                  </div>
                  {option.badge && (
                    <div className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {option.badge}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
)

AutocompleteInput.displayName = 'AutocompleteInput'