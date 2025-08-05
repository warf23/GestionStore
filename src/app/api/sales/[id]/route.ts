import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth'
import { logActivity, formatActivityDetails } from '@/lib/activity-logger'

// GET - Fetch single sale with details
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
    
    const { data: sale, error } = await supabase
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
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Vente non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json({ sale })
  } catch (error) {
    console.error('Get sale error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// PUT - Update sale
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Get the current sale data before modification for logging
    const { data: currentSale } = await supabase
      .from('ventes')
      .select(`
        *,
        lignes_vente(*)
      `)
      .eq('id', params.id)
      .single()

    if (!currentSale) {
      return NextResponse.json({ error: 'Vente non trouvée' }, { status: 404 })
    }

    // Check if user can edit this sale
    if (user.role === 'employe') {
      // Employees can only edit their own sales
      if (currentSale.utilisateur_id !== parseInt(user.id)) {
        return NextResponse.json({ error: 'Vous ne pouvez modifier que vos propres ventes' }, { status: 403 })
      }
    }

    const body = await request.json()
    const { nom_client, lignes } = body

    if (!nom_client || !lignes || lignes.length === 0) {
      return NextResponse.json(
        { error: 'Nom client et lignes de vente requis' },
        { status: 400 }
      )
    }

    // Calculate new total
    const total = lignes.reduce((sum: number, ligne: any) => 
      sum + (ligne.quantite * ligne.prix_unitaire), 0
    )

    // Update sale
    const { error: saleError } = await supabase
      .from('ventes')
      .update({
        nom_client,
        total
      })
      .eq('id', params.id)

    if (saleError) {
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour de la vente' },
        { status: 500 }
      )
    }

    // Delete existing lines
    await supabase
      .from('lignes_vente')
      .delete()
      .eq('vente_id', params.id)

    // Insert new lines
    const saleLines = lignes.map((ligne: any) => ({
      vente_id: parseInt(params.id),
      produit_nom: ligne.produit_nom,
      quantite: ligne.quantite,
      prix_unitaire: ligne.prix_unitaire
    }))

    const { error: linesError } = await supabase
      .from('lignes_vente')
      .insert(saleLines)

    if (linesError) {
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour des lignes de vente' },
        { status: 500 }
      )
    }

    // Log the activity
    const newSaleData = {
      id: parseInt(params.id),
      nom_client,
      total,
      lignes_vente: saleLines
    }

    await logActivity({
      userId: parseInt(user.id),
      actionType: 'UPDATE',
      tableName: 'ventes',
      recordId: parseInt(params.id),
      oldData: currentSale,
      newData: newSaleData,
      details: formatActivityDetails('UPDATE', 'ventes', newSaleData),
      request
    })

    return NextResponse.json({ 
      message: 'Vente mise à jour avec succès'
    })

  } catch (error) {
    console.error('Update sale error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// DELETE - Delete sale
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Get sale data before deletion for logging
    const { data: saleToDelete } = await supabase
      .from('ventes')
      .select(`
        *,
        lignes_vente(*)
      `)
      .eq('id', params.id)
      .single()

    if (!saleToDelete) {
      return NextResponse.json({ error: 'Vente non trouvée' }, { status: 404 })
    }

    // Check if user can delete this sale
    if (user.role === 'employe') {
      // Employees can only delete their own sales
      if (saleToDelete.utilisateur_id !== parseInt(user.id)) {
        return NextResponse.json({ error: 'Vous ne pouvez supprimer que vos propres ventes' }, { status: 403 })
      }
    }

    // Delete sale (lines will be deleted automatically due to CASCADE)
    const { error } = await supabase
      .from('ventes')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json(
        { error: 'Erreur lors de la suppression de la vente' },
        { status: 500 }
      )
    }

    // Log the activity
    await logActivity({
      userId: parseInt(user.id),
      actionType: 'DELETE',
      tableName: 'ventes',
      recordId: parseInt(params.id),
      oldData: saleToDelete,
      details: formatActivityDetails('DELETE', 'ventes', { id: params.id }),
      request
    })

    return NextResponse.json({ 
      message: 'Vente supprimée avec succès'
    })

  } catch (error) {
    console.error('Delete sale error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}