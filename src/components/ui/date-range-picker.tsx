'use client'

import { useMemo, useState } from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

interface DateRangePickerProps {
  from?: string
  to?: string
  onChange: (range: { from?: string; to?: string }) => void
  className?: string
}

function toISODateLocal(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function parseISODateLocal(value?: string): Date | undefined {
  if (!value) return undefined
  const [y, m, d] = value.split('-').map(Number)
  if (!y || !m || !d) return undefined
  return new Date(y, m - 1, d)
}

function formatFr(value?: string): string {
  const date = parseISODateLocal(value)
  return date ? date.toLocaleDateString('fr-FR') : 'mm/jj/aaaa'
}

export function DateRangePicker({ from, to, onChange, className }: DateRangePickerProps) {
  const todayISO = useMemo(() => toISODateLocal(new Date()), [])
  const [open, setOpen] = useState(false)

  const selected = useMemo(
    () => ({ from: parseISODateLocal(from), to: parseISODateLocal(to) }),
    [from, to]
  )

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-10 w-full justify-start gap-2">
            <CalendarIcon className="h-4 w-4" />
            {(from || to) ? (
              <span className="text-sm">
                {formatFr(from)} → {formatFr(to)}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">Sélectionner des dates</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <div className="flex flex-col gap-3">
            <Calendar
              mode="range"
              selected={selected as any}
              onSelect={(range: { from?: Date; to?: Date } | undefined) => {
                onChange({
                  from: range?.from ? toISODateLocal(range.from) : undefined,
                  to: range?.to ? toISODateLocal(range.to) : undefined,
                })
                if (range?.from && range?.to) {
                  setOpen(false)
                }
              }}
              numberOfMonths={1}
              defaultMonth={selected.from ?? new Date()}
              weekStartsOn={1}
            />

            <div className="flex items-center gap-2 rounded-md border p-2">
              <input
                type="date"
                value={from || ''}
                max={to || todayISO}
                onChange={(e) => onChange({ from: e.target.value || undefined, to })}
                className="h-9 rounded-md border px-2 text-sm"
              />
              <span className="text-muted-foreground">→</span>
              <input
                type="date"
                value={to || ''}
                min={from || ''}
                max={todayISO}
                onChange={(e) => onChange({ from, to: e.target.value || undefined })}
                className="h-9 rounded-md border px-2 text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  const d = new Date()
                  const iso = toISODateLocal(d)
                  onChange({ from: iso, to: iso })
                }}
              >
                Aujourd'hui
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  const end = new Date()
                  const start = new Date()
                  start.setDate(end.getDate() - 6)
                  onChange({ from: toISODateLocal(start), to: toISODateLocal(end) })
                }}
              >
                7 jours
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  const now = new Date()
                  const start = new Date(now.getFullYear(), now.getMonth(), 1)
                  onChange({ from: toISODateLocal(start), to: toISODateLocal(now) })
                }}
              >
                Ce mois
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange({ from: undefined, to: undefined })}
              >
                Effacer
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
