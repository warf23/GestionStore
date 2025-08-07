import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth'
import { logActivity, formatActivityDetails } from '@/lib/activity-logger'

// GET - Fetch all purchases with their lines and user info
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const supabase = createAdminClient()

    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const q = searchParams.get('q')?.toLowerCase() || ''
    const categoryId = searchParams.get('categoryId')
    const woodTypeId = searchParams.get('woodTypeId')

    // Fetch purchases with user info and lines
    let query = supabase
      .from('achats')
      .select(`
        *,
        utilisateurs:utilisateur_id (
          id,
          nom,
          prenom,
          email
        ),
        lignes_achat (
          id,
          produit_nom,
          category_id,
          wood_type_id,
          quantite,
          prix_unitaire,
          total_ligne,
          categories:category_id (
            id,
            nom,
            couleur
          ),
          wood_types:wood_type_id (
            id,
            nom,
            couleur
          )
        )
      `)
      .order('date_achat', { ascending: false })

    if (from) {
      query = query.gte('date_achat', from)
    }
    if (to) {
      query = query.lte('date_achat', to)
    }

    const { data: rawPurchases, error } = await query

    if (error) {
      console.error('Error fetching purchases:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des achats' },
        { status: 500 }
      )
    }

    let purchases = rawPurchases || []
    if (q || categoryId || woodTypeId) {
      purchases = purchases.filter((purchase: any) => {
        const fournisseurMatch = purchase.nom_fournisseur?.toLowerCase().includes(q)
        const lineMatch = (purchase.lignes_achat || []).some((line: any) => {
          const matchesQ = q ? line.produit_nom?.toLowerCase().includes(q) : true
          const matchesCategory = categoryId ? String(line.category_id) === String(categoryId) : true
          const matchesWood = woodTypeId ? String(line.wood_type_id) === String(woodTypeId) : true
          return matchesQ && matchesCategory && matchesWood
        })
        return (q ? (fournisseurMatch || lineMatch) : true) && lineMatch
      })
    }

    return NextResponse.json({ purchases })
  } catch (error) {
    console.error('Purchases API error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// POST - Create new purchase
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé - Admin requis' }, { status: 403 })
    }

    const body = await request.json()
    const { nom_fournisseur, lignes } = body

    if (!nom_fournisseur || !lignes || lignes.length === 0) {
      return NextResponse.json(
        { error: 'Nom fournisseur et lignes d\'achat requis' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Calculate total
    const total = lignes.reduce((sum: number, ligne: any) => 
      sum + (ligne.quantite * ligne.prix_unitaire), 0
    )

    // Start transaction
    const { data: purchase, error: purchaseError } = await supabase
      .from('achats')
      .insert({
        utilisateur_id: parseInt(user.id),
        nom_fournisseur,
        total
      })
      .select()
      .single()

    if (purchaseError) {
      console.error('Error creating purchase:', purchaseError)
      return NextResponse.json(
        { error: 'Erreur lors de la création de l\'achat' },
        { status: 500 }
      )
    }

    // Insert purchase lines
    const purchaseLines = lignes.map((ligne: any) => ({
      achat_id: purchase.id,
      produit_nom: ligne.produit_nom,
      category_id: ligne.category_id,
      wood_type_id: ligne.wood_type_id || null,
      quantite: ligne.quantite,
      prix_unitaire: ligne.prix_unitaire
    }))

    const { error: linesError } = await supabase
      .from('lignes_achat')
      .insert(purchaseLines)

    if (linesError) {
      console.error('Error creating purchase lines:', linesError)
      // Rollback purchase if lines failed
      await supabase.from('achats').delete().eq('id', purchase.id)
      return NextResponse.json(
        { error: 'Erreur lors de la création des lignes d\'achat' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Achat créé avec succès',
      purchase 
    }, { status: 201 })

  } catch (error) {
    console.error('Create purchase error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}