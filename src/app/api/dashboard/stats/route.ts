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
          total_ligne
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
          total_ligne
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

    // Calculate statistics
    const stats = {
      // Today's stats
      todaySales: todaySales.length,
      todayPurchases: todayPurchases.length,
      todayRevenue: todaySales.reduce((sum, sale) => sum + parseFloat(sale.total.toString()), 0),
      todayCosts: todayPurchases.reduce((sum, purchase) => sum + parseFloat(purchase.total.toString()), 0),
      
      // All time stats
      totalSales: allSales.length,
      totalPurchases: allPurchases.length,
      totalRevenue: allSales.reduce((sum, sale) => sum + parseFloat(sale.total.toString()), 0),
      totalCosts: allPurchases.reduce((sum, purchase) => sum + parseFloat(purchase.total.toString()), 0),
      
      // Products stats
      totalProductsSold: allSales.reduce((sum: number, sale: any) => {
        const lines = (sale.lignes_vente ?? []) as Array<{ quantite: number }>
        const perSaleCount = lines.reduce(
          (lineSum: number, line: { quantite: number }) => lineSum + line.quantite,
          0
        )
        return sum + perSaleCount
      }, 0),
      totalProductsPurchased: allPurchases.reduce((sum: number, purchase: any) => {
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
      averageBasket: allSales.length > 0 ? 
        allSales.reduce((sum, sale) => sum + parseFloat(sale.total.toString()), 0) / allSales.length : 0,
      profit: allSales.reduce((sum, sale) => sum + parseFloat(sale.total.toString()), 0) - 
              allPurchases.reduce((sum, purchase) => sum + parseFloat(purchase.total.toString()), 0),
      
      // Monthly stats (current month)
      monthlySales: allSales.filter(sale => {
        const saleDate = new Date(sale.date_vente)
        return saleDate.getMonth() === today.getMonth() && saleDate.getFullYear() === today.getFullYear()
      }).length,
      monthlyPurchases: allPurchases.filter(purchase => {
        const purchaseDate = new Date(purchase.date_achat)
        return purchaseDate.getMonth() === today.getMonth() && purchaseDate.getFullYear() === today.getFullYear()
      }).length,
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