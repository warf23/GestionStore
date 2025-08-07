import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth'
import { logActivity, formatActivityDetails } from '@/lib/activity-logger'

// GET - Fetch single purchase with details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const supabase = createAdminClient()
    
    const { data: purchase, error } = await supabase
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
          quantite,
          prix_unitaire,
          total_ligne
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Achat non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ purchase })
  } catch (error) {
    console.error('Get purchase error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// PUT - Update purchase
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Calculate new total
    const total = lignes.reduce((sum: number, ligne: any) => 
      sum + (ligne.quantite * ligne.prix_unitaire), 0
    )

    // Update purchase
    const { error: purchaseError } = await supabase
      .from('achats')
      .update({
        nom_fournisseur,
        total
      })
      .eq('id', params.id)

    if (purchaseError) {
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour de l\'achat' },
        { status: 500 }
      )
    }

    // Delete existing lines
    await supabase
      .from('lignes_achat')
      .delete()
      .eq('achat_id', params.id)

    // Insert new lines
    const purchaseLines = lignes.map((ligne: any) => ({
      achat_id: parseInt(params.id),
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
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour des lignes d\'achat' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Achat mis à jour avec succès'
    })

  } catch (error) {
    console.error('Update purchase error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// DELETE - Delete purchase
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé - Admin requis' }, { status: 403 })
    }

    const supabase = createAdminClient()

    // Delete purchase (lines will be deleted automatically due to CASCADE)
    const { error } = await supabase
      .from('achats')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json(
        { error: 'Erreur lors de la suppression de l\'achat' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Achat supprimé avec succès'
    })

  } catch (error) {
    console.error('Delete purchase error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}