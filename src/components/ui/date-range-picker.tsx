'use client'

import { useMemo } from 'react'

interface DateRangePickerProps {
  from?: string
  to?: string
  onChange: (range: { from?: string; to?: string }) => void
  className?: string
}

export function DateRangePicker({ from, to, onChange, className }: DateRangePickerProps) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <input
        type="date"
        value={from || ''}
        max={to || today}
        onChange={(e) => onChange({ from: e.target.value || undefined, to })}
        className="h-10 rounded-md border px-3 text-sm"
      />
      <span className="text-gray-500">→</span>
      <input
        type="date"
        value={to || ''}
        min={from || ''}
        max={today}
        onChange={(e) => onChange({ from, to: e.target.value || undefined })}
        className="h-10 rounded-md border px-3 text-sm"
      />
    </div>
  )
}

