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
    
    // Fetch purchases with user info and lines
    const { data: purchases, error } = await supabase
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
          quantite,
          prix_unitaire,
          total_ligne
        )
      `)
      .order('date_achat', { ascending: false })

    if (error) {
      console.error('Error fetching purchases:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des achats' },
        { status: 500 }
      )
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