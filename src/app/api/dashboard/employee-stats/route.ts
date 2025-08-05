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

    // Fetch only this employee's sales data
    const { data: mySales, error: salesError } = await supabase
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
      .eq('utilisateur_id', parseInt(user.id))

    if (salesError) {
      console.error('Error fetching employee sales:', salesError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des ventes' },
        { status: 500 }
      )
    }

    // Filter today's data
    const todaySales = mySales.filter(sale => {
      const saleDate = new Date(sale.date_vente)
      return saleDate >= startOfDay && saleDate < endOfDay
    })

    // Calculate statistics for this employee
    const stats = {
      // Today's stats
      todaySales: todaySales.length,
      todayRevenue: todaySales.reduce((sum, sale) => sum + parseFloat(sale.total.toString()), 0),
      
      // All time stats for this employee
      totalSales: mySales.length,
      totalRevenue: mySales.reduce((sum, sale) => sum + parseFloat(sale.total.toString()), 0),
      
      // Products stats
      totalProductsSold: mySales.reduce((sum, sale) => 
        sum + sale.lignes_vente.reduce((lineSum, line) => lineSum + line.quantite, 0), 0
      ),
      
      // Calculated metrics
      averageBasket: mySales.length > 0 ? 
        mySales.reduce((sum, sale) => sum + parseFloat(sale.total.toString()), 0) / mySales.length : 0,
      
      // Weekly stats (last 7 days)
      weeklySales: mySales.filter(sale => {
        const saleDate = new Date(sale.date_vente)
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        return saleDate >= weekAgo
      }).length,
      
      // Monthly stats (current month)
      monthlySales: mySales.filter(sale => {
        const saleDate = new Date(sale.date_vente)
        return saleDate.getMonth() === today.getMonth() && saleDate.getFullYear() === today.getFullYear()
      }).length,
      
      // Performance rank (if admin wants to show it)
      salesThisMonth: mySales.filter(sale => {
        const saleDate = new Date(sale.date_vente)
        return saleDate.getMonth() === today.getMonth() && saleDate.getFullYear() === today.getFullYear()
      }),
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Employee dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}