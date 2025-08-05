import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth'

// GET - Fetch all sales with their lines and user info
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const supabase = createAdminClient()
    
    // Fetch sales with user info and lines
    const { data: sales, error } = await supabase
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
          quantite,
          prix_unitaire,
          total_ligne
        )
      `)
      .order('date_vente', { ascending: false })

    if (error) {
      console.error('Error fetching sales:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des ventes' },
        { status: 500 }
      )
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

    // Insert sale lines
    const saleLines = lignes.map((ligne: any) => ({
      vente_id: sale.id,
      produit_nom: ligne.produit_nom,
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