import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth'
import { logActivity, formatActivityDetails } from '@/lib/activity-logger'

// GET - Fetch all sales with their lines and user info
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const supabase = createAdminClient()

    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from') // ISO date string
    const to = searchParams.get('to') // ISO date string
    const q = searchParams.get('q')?.toLowerCase() || ''
    const categoryId = searchParams.get('categoryId')

    // Base query with joins
    let query = supabase
      .from('ventes')
      .select(`
        *,
        utilisateurs:utilisateur_id (
          id,
          nom,
          prenom,
          email
        ),
        lignes_vente (
          id,
          produit_nom,
          category_id,
          quantite,
          prix_unitaire,
          total_ligne,
          categories:category_id (
            id,
            nom,
            couleur
          )
        )
      `)
      .order('date_vente', { ascending: false })

    // Apply date filters at DB level
    if (from) {
      query = query.gte('date_vente', from)
    }
    if (to) {
      query = query.lte('date_vente', to)
    }

    const { data: rawSales, error } = await query

    if (error) {
      console.error('Error fetching sales:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des ventes' },
        { status: 500 }
      )
    }

    // Apply in-memory filters that depend on nested arrays
    let sales = rawSales || []
    if (q || categoryId) {
      sales = sales.filter((sale: any) => {
        const clientMatch = sale.nom_client?.toLowerCase().includes(q)
        const lineMatch = (sale.lignes_vente || []).some((line: any) => {
          const matchesQ = q
            ? line.produit_nom?.toLowerCase().includes(q)
            : true
          const matchesCategory = categoryId
            ? String(line.category_id) === String(categoryId)
            : true
          return matchesQ && matchesCategory
        })
        return (q ? (clientMatch || lineMatch) : true) && lineMatch
      })
    }

    return NextResponse.json({ sales })
  } catch (error) {
    console.error('Sales API error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// POST - Create new sale
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    
    // Both admin and employee can create sales
    if (!['admin', 'employe'].includes(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const body = await request.json()
    const { nom_client, lignes } = body

    if (!nom_client || !lignes || lignes.length === 0) {
      return NextResponse.json(
        { error: 'Nom client et lignes de vente requis' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // First, get category_id for each product by looking up the most recent purchase
    const productNames = lignes.map((ligne: any) => ligne.produit_nom)
    const { data: purchaseData, error: purchaseDataError } = await supabase
      .from('lignes_achat')
      .select('produit_nom, category_id')
      .in('produit_nom', productNames)
      .order('id', { ascending: false })

    if (purchaseDataError) {
      console.error('Error fetching product categories:', purchaseDataError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des catégories de produits' },
        { status: 500 }
      )
    }

    // Create a map of product names to category IDs (use the most recent one)
    const productCategoryMap = new Map()
    purchaseData?.forEach((item: any) => {
      if (!productCategoryMap.has(item.produit_nom)) {
        productCategoryMap.set(item.produit_nom, item.category_id)
      }
    })

    // Calculate total
    const total = lignes.reduce((sum: number, ligne: any) => 
      sum + (ligne.quantite * ligne.prix_unitaire), 0
    )

    // Start transaction
    const { data: sale, error: saleError } = await supabase
      .from('ventes')
      .insert({
        utilisateur_id: parseInt(user.id),
        nom_client,
        total
      })
      .select()
      .single()

    if (saleError) {
      console.error('Error creating sale:', saleError)
      return NextResponse.json(
        { error: 'Erreur lors de la création de la vente' },
        { status: 500 }
      )
    }

    // Insert sale lines with category_id
    const saleLines = lignes.map((ligne: any) => ({
      vente_id: sale.id,
      produit_nom: ligne.produit_nom,
      category_id: productCategoryMap.get(ligne.produit_nom) || null,
      quantite: ligne.quantite,
      prix_unitaire: ligne.prix_unitaire
    }))

    const { error: linesError } = await supabase
      .from('lignes_vente')
      .insert(saleLines)

    if (linesError) {
      console.error('Error creating sale lines:', linesError)
      // Rollback sale if lines failed
      await supabase.from('ventes').delete().eq('id', sale.id)
      return NextResponse.json(
        { error: 'Erreur lors de la création des lignes de vente' },
        { status: 500 }
      )
    }

    // Log the activity
    await logActivity({
      userId: parseInt(user.id),
      actionType: 'CREATE',
      tableName: 'ventes',
      recordId: sale.id,
      newData: { ...sale, lignes_vente: saleLines },
      details: formatActivityDetails('CREATE', 'ventes', sale),
      request
    })

    return NextResponse.json({ 
      message: 'Vente créée avec succès',
      sale 
    }, { status: 201 })

  } catch (error) {
    console.error('Create sale error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}