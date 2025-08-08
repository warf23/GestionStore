'use client'

import { useMemo, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as RTooltip, BarChart, Bar, LabelList, PieChart, Pie, Cell, Label } from 'recharts'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCategories } from '@/hooks/use-categories'
import { ChartCard, ChartLegend } from '@/components/ui/chart'
import { useDashboardStats } from '@/hooks/use-dashboard'

// Use theme chart palette tokens only (editable via CSS vars in globals.css)
const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)'
]

export function InsightsCharts() {
  const [range, setRange] = useState<{ from?: string; to?: string }>({})
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const { data, isLoading } = useDashboardStats(range, { categoryId })
  const { data: categories = [] } = useCategories()

  const selectedCategoryName = useMemo(() => {
    if (categoryId === null) return 'toutes catégories'
    return categories.find((c) => c.id === categoryId)?.nom ?? 'catégorie'
  }, [categoryId, categories])

  const topProducts = useMemo(() => (data?.topProducts ?? []).map((p, i) => ({ ...p, color: CHART_COLORS[i % CHART_COLORS.length] })), [data])
  const byCategory = useMemo(() => (data?.salesByCategory ?? []).map((c, i) => ({ ...c, color: CHART_COLORS[i % CHART_COLORS.length] })), [data])

  const totalVentes = useMemo(() => (data?.dailySeries ?? []).reduce((s, d) => s + (d.ventes || 0), 0), [data])
  const totalAchats = useMemo(() => (data?.dailySeries ?? []).reduce((s, d) => s + (d.achats || 0), 0), [data])
  const totalRevenus = useMemo(() => (data?.dailySeries ?? []).reduce((s, d) => s + (d.revenus || 0), 0), [data])

  const nfmt = (n: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n || 0)
  const dfmt = (n: number) => new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n || 0)
  const cfmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(n || 0)

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <ChartCard
        title="Tendance quotidienne"
        description={`Période ${range.from ?? 'début'} → ${range.to ?? 'aujourd\'hui'} • ${selectedCategoryName}`}
        right={
          <div className="flex items-center gap-2">
            <Select
              onValueChange={(v) => setCategoryId(v === 'all' ? null : Number(v))}
              value={categoryId === null ? 'all' : String(categoryId)}
            >
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Toutes catégories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DateRangePicker from={range.from} to={range.to} onChange={setRange} />
          </div>
        }
      >
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.dailySeries ?? []} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={nfmt} />
              <RTooltip
                labelClassName="text-xs"
                contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid var(--border)' }}
                formatter={(value: any, name: any) => {
                  const label = name === 'revenus' ? 'Revenus' : name === 'ventes' ? 'Ventes' : 'Achats'
                  const formatted = name === 'revenus' ? cfmt(Number(value)) : dfmt(Number(value))
                  return [formatted, label]
                }}
              />
              <Line type="monotone" dataKey="ventes" stroke={CHART_COLORS[0]} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="achats" stroke={CHART_COLORS[1]} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="revenus" stroke={CHART_COLORS[2]} strokeWidth={2} dot={false} yAxisId={0} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3">
          <ChartLegend items={[
            { name: 'Ventes', color: CHART_COLORS[0] },
            { name: 'Achats', color: CHART_COLORS[1] },
            { name: 'Revenus', color: CHART_COLORS[2] },
          ]} />
          <div className="mt-2 text-xs text-muted-foreground">
            Total ventes: <span className="font-medium text-foreground">{dfmt(totalVentes)}</span> •
            {' '}Total achats: <span className="font-medium text-foreground">{dfmt(totalAchats)}</span> •
            {' '}Revenus: <span className="font-medium text-foreground">{cfmt(totalRevenus as any)}</span>
          </div>
        </div>
      </ChartCard>

      <ChartCard title="Top produits" description={`Par quantité vendue • ${selectedCategoryName}`} right={<span className="text-xs text-muted-foreground">Top 10</span>}>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProducts} layout="vertical" margin={{ left: 16, right: 8, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
              <RTooltip
                contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid var(--border)' }}
                formatter={(value: any, name: any, props: any) => {
                  if (name === 'quantite') return [dfmt(Number(value)), 'Quantité']
                  return [value, name]
                }}
              />
              <Bar dataKey="quantite" radius={[4,4,4,4]}>
                {topProducts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList dataKey="quantite" position="right" className="fill-foreground text-xs" formatter={(v: any) => dfmt(Number(v))} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {topProducts.length === 0 && (
          <div className="text-xs text-muted-foreground">Aucune vente trouvée pour la période sélectionnée.</div>
        )}
      </ChartCard>

      <ChartCard title="Répartition par catégorie" description="Quantités vendues">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie dataKey="quantite" data={byCategory} outerRadius={100} innerRadius={50}>
                {byCategory.map((entry, index) => (
                  <Cell key={`cell-cat-${index}`} fill={entry.color} />
                ))}
                <Label
                  position="center"
                  content={({ viewBox }) => {
                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                      const total = byCategory.reduce((s, c) => s + (c.quantite || 0), 0)
                      return (
                        <text x={(viewBox as any).cx} y={(viewBox as any).cy} textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-sm">
                          {dfmt(total)}
                          <tspan x={(viewBox as any).cx} dy={16} className="fill-muted-foreground text-xs">Total</tspan>
                        </text>
                      )
                    }
                    return null
                  }}
                />
                <LabelList dataKey="quantite" position="outside" className="fill-foreground text-xs" formatter={(v: any) => dfmt(Number(v))} />
              </Pie>
              <RTooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3">
          <ChartLegend items={byCategory.map((c) => ({ name: c.name, color: c.color! }))} />
        </div>
        {byCategory.length === 0 && (
          <div className="text-xs text-muted-foreground">Aucune répartition à afficher pour la période sélectionnée.</div>
        )}
      </ChartCard>
    </div>
  )
}

