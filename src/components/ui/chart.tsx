'use client'

import { cn } from '@/lib/utils'

interface ChartCardProps {
  title: string
  description?: string
  className?: string
  children: React.ReactNode
  right?: React.ReactNode
}

export function ChartCard({ title, description, className, children, right }: ChartCardProps) {
  return (
    <div className={cn('rounded-lg border bg-background', className)}>
      <div className="flex items-start justify-between border-b p-4">
        <div>
          <div className="text-sm font-medium text-muted-foreground">{description}</div>
          <h3 className="text-lg font-semibold leading-tight tracking-tight text-foreground">{title}</h3>
        </div>
        {right}
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}

export function ChartLegend({ items }: { items: Array<{ name: string; color: string }> }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {items.map((it) => (
        <div key={it.name} className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: it.color }} />
          <span>{it.name}</span>
        </div>
      ))}
    </div>
  )
}

