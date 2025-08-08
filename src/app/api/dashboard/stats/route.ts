import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const supabase = createAdminClient()

    const { searchParams } = new URL(request.url)
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')
    const categoryFilterParam = searchParams.get('category_id')
    const categoryFilter = categoryFilterParam ? parseInt(categoryFilterParam, 10) : null

    // Get today's date for filtering today's data
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // Fetch sales data
    const { data: allSales, error: salesError } = await supabase
      .from('ventes')
      .select(`
        *,
        lignes_vente (
          id,
          quantite,
          prix_unitaire,
          total_ligne,
          produit_nom,
          category_id
        )
      `)

    if (salesError) {
      console.error('Error fetching sales:', salesError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des ventes' },
        { status: 500 }
      )
    }

    // Fetch purchases data
    const { data: allPurchases, error: purchasesError } = await supabase
      .from('achats')
      .select(`
        *,
        lignes_achat (
          id,
          quantite,
          prix_unitaire,
          total_ligne,
          produit_nom,
          category_id
        )
      `)

    if (purchasesError) {
      console.error('Error fetching purchases:', purchasesError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des achats' },
        { status: 500 }
      )
    }

    // Fetch users count
    const { data: users, error: usersError } = await supabase
      .from('utilisateurs')
      .select('id')

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des utilisateurs' },
        { status: 500 }
      )
    }

    // Filter today's data
    const todaySales = allSales.filter(sale => {
      const saleDate = new Date(sale.date_vente)
      return saleDate >= startOfDay && saleDate < endOfDay
    })

    const todayPurchases = allPurchases.filter(purchase => {
      const purchaseDate = new Date(purchase.date_achat)
      return purchaseDate >= startOfDay && purchaseDate < endOfDay
    })

    // Optional range filter
    const rangeFrom = fromParam ? new Date(fromParam) : null
    const rangeTo = toParam ? new Date(toParam) : null

    const isWithinRange = (d: Date) => {
      if (!rangeFrom && !rangeTo) return true
      if (rangeFrom && d < rangeFrom) return false
      if (rangeTo && d > new Date(new Date(rangeTo).setHours(23,59,59,999))) return false
      return true
    }

    const filteredSales = allSales.filter((s: any) => isWithinRange(new Date(s.date_vente)))
    const filteredPurchases = allPurchases.filter((p: any) => isWithinRange(new Date(p.date_achat)))

    const filterLinesByCategory = (lines: any[]) => {
      if (!categoryFilter) return lines
      return lines.filter((l) => (l as any).category_id === categoryFilter)
    }

    // Calculate statistics
    const stats = {
      // Today's stats
      todaySales: todaySales.length,
      todayPurchases: todayPurchases.length,
      todayRevenue: todaySales.reduce((sum, sale) => sum + parseFloat(sale.total.toString()), 0),
      todayCosts: todayPurchases.reduce((sum, purchase) => sum + parseFloat(purchase.total.toString()), 0),
      
      // All time stats
      totalSales: filteredSales.length,
      totalPurchases: filteredPurchases.length,
      totalRevenue: filteredSales.reduce((sum, sale) => sum + parseFloat(sale.total.toString()), 0),
      totalCosts: filteredPurchases.reduce((sum, purchase) => sum + parseFloat(purchase.total.toString()), 0),
      
      // Products stats
      totalProductsSold: filteredSales.reduce((sum: number, sale: any) => {
        const lines = filterLinesByCategory((sale.lignes_vente ?? []) as Array<{ quantite: number }>)
        const perSaleCount = lines.reduce(
          (lineSum: number, line: { quantite: number }) => lineSum + line.quantite,
          0
        )
        return sum + perSaleCount
      }, 0),
      totalProductsPurchased: filteredPurchases.reduce((sum: number, purchase: any) => {
        const lines = (purchase.lignes_achat ?? []) as Array<{ quantite: number }>
        const perPurchaseCount = lines.reduce(
          (lineSum: number, line: { quantite: number }) => lineSum + line.quantite,
          0
        )
        return sum + perPurchaseCount
      }, 0),
      
      // Users
      activeUsers: users.length,
      
      // Calculated metrics
      averageBasket: filteredSales.length > 0 ? 
        filteredSales.reduce((sum, sale) => sum + parseFloat(sale.total.toString()), 0) / filteredSales.length : 0,
      profit: filteredSales.reduce((sum, sale) => sum + parseFloat(sale.total.toString()), 0) - 
              filteredPurchases.reduce((sum, purchase) => sum + parseFloat(purchase.total.toString()), 0),
      
      // Monthly stats (current month)
      monthlySales: filteredSales.filter(sale => {
        const saleDate = new Date(sale.date_vente)
        return saleDate.getMonth() === today.getMonth() && saleDate.getFullYear() === today.getFullYear()
      }).length,
      monthlyPurchases: filteredPurchases.filter(purchase => {
        const purchaseDate = new Date(purchase.date_achat)
        return purchaseDate.getMonth() === today.getMonth() && purchaseDate.getFullYear() === today.getFullYear()
      }).length,

      // Series by day in selected range (defaults to last 30 days if none)
      dailySeries: (() => {
        const points: Array<{ date: string; ventes: number; achats: number; revenus: number }>= []
        const start = rangeFrom ?? new Date(new Date().setDate(today.getDate() - 29))
        const end = rangeTo ?? today
        const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000*60*60*24)) + 1)
        for (let i = 0; i < days; i++) {
          const d = new Date(start)
          d.setDate(start.getDate() + i)
          const startD = new Date(d.getFullYear(), d.getMonth(), d.getDate())
          const endD = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
          const daySales = filteredSales.filter((s: any) => {
            const sd = new Date(s.date_vente)
            return sd >= startD && sd < endD
          })
          const dayPurchases = filteredPurchases.filter((p: any) => {
            const pd = new Date(p.date_achat)
            return pd >= startD && pd < endD
          })
          points.push({
            date: d.toISOString().slice(0,10),
            ventes: daySales.reduce((count: number, s: any) => count + filterLinesByCategory(s.lignes_vente ?? []).length, 0),
            achats: dayPurchases.reduce((count: number, p: any) => count + filterLinesByCategory(p.lignes_achat ?? []).length, 0),
            revenus: daySales.reduce((sum: number, s: any) => {
              const lines = filterLinesByCategory(s.lignes_vente ?? [])
              const totalLines = lines.reduce((lsum: number, l: any) => lsum + ((l.total_ligne ? parseFloat(l.total_ligne.toString()) : (l.quantite || 0) * parseFloat(l.prix_unitaire?.toString() ?? '0'))), 0)
              return sum + totalLines
            }, 0),
          })
        }
        return points
      })(),

      // Top products by quantity in selected range
      topProducts: (() => {
        const map = new Map<string, { name: string; quantite: number; revenus: number }>()
        for (const sale of filteredSales) {
          for (const line of filterLinesByCategory((sale.lignes_vente ?? []))) {
            const key = (line as any).produit_nom as string
            const current = map.get(key) ?? { name: key, quantite: 0, revenus: 0 }
            current.quantite += (line as any).quantite || 0
            current.revenus += ((line as any).total_ligne ? parseFloat((line as any).total_ligne.toString()) : ((line as any).quantite || 0) * parseFloat((line as any).prix_unitaire?.toString() ?? '0'))
            map.set(key, current)
          }
        }
        return Array.from(map.values())
          .sort((a, b) => b.quantite - a.quantite)
          .slice(0, 10)
      })(),

      // Sales by category as pie parts
      salesByCategory: (() => {
        const map = new Map<number, { category_id: number; name: string; quantite: number }>()
        for (const sale of filteredSales) {
          for (const line of (sale.lignes_vente ?? [])) {
            const cid = (line as any).category_id as number | null
            if (!cid) continue
            const current = map.get(cid) ?? { category_id: cid, name: String(cid), quantite: 0 }
            current.quantite += (line as any).quantite || 0
            map.set(cid, current)
          }
        }
        return Array.from(map.values())
      })(),
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}