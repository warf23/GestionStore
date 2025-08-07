'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchInputProps {
  placeholder?: string
  onSearch?: (query: string) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function SearchInput({ 
  placeholder = "Rechercher...", 
  onSearch, 
  className,
  size = 'md'
}: SearchInputProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base'
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (onSearch) {
        onSearch(query)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, onSearch])

  const handleClear = () => {
    setQuery('')
    inputRef.current?.focus()
  }

  return (
    <div className={cn(
      "relative flex items-center bg-gray-50/50 rounded-xl border border-transparent transition-all duration-200",
      isFocused && "bg-white border-blue-200 shadow-sm",
      className
    )}>
      <Search className={cn(
        "text-gray-400 ml-3 flex-shrink-0",
        iconSizes[size],
        isFocused && "text-blue-500"
      )} />
      
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "bg-transparent border-none outline-none text-gray-600 placeholder-gray-400 flex-1 min-w-0",
          sizeClasses[size]
        )}
      />
      
      {query && (
        <button
          onClick={handleClear}
          className="p-1 mr-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className={iconSizes[size]} />
        </button>
      )}
    </div>
  )
}