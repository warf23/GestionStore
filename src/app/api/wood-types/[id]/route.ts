import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth'

// GET /api/wood-types/[id] - Fetch single wood type
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const supabase = createAdminClient()
    
    const { data: woodType, error } = await supabase
      .from('wood_types')
      .select('*')
      .eq('id', (await params).id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Type de bois non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ woodType })
  } catch (error) {
    console.error('Get wood type error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// PUT /api/wood-types/[id] - Update wood type
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé - Admin requis' }, { status: 403 })
    }

    const body = await request.json()
    const { nom, description, couleur } = body

    if (!nom) {
      return NextResponse.json(
        { error: 'Le nom du type de bois est requis' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data: woodType, error } = await supabase
      .from('wood_types')
      .update({
        nom: nom.trim(),
        description: description?.trim() || null,
        couleur: couleur || '#8B4513',
        updated_at: new Date().toISOString()
      })
      .eq('id', (await params).id)
      .select()
      .single()

    if (error) {
      console.error('Error updating wood type:', error)
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Un type de bois avec ce nom existe déjà' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du type de bois' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Type de bois mis à jour avec succès',
      woodType 
    })

  } catch (error) {
    console.error('Update wood type error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// DELETE /api/wood-types/[id] - Delete wood type
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé - Admin requis' }, { status: 403 })
    }

    const supabase = createAdminClient()

    // Check if wood type is used in any purchases
    const { data: purchases, error: checkError } = await supabase
      .from('lignes_achat')
      .select('id')
      .eq('wood_type_id', (await params).id)
      .limit(1)

    if (checkError) {
      console.error('Error checking wood type usage:', checkError)
      return NextResponse.json(
        { error: 'Erreur lors de la vérification du type de bois' },
        { status: 500 }
      )
    }

    if (purchases && purchases.length > 0) {
      return NextResponse.json(
        { error: 'Ce type de bois ne peut pas être supprimé car il est utilisé dans des achats' },
        { status: 409 }
      )
    }

    const { error } = await supabase
      .from('wood_types')
      .delete()
      .eq('id', (await params).id)

    if (error) {
      console.error('Error deleting wood type:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression du type de bois' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Type de bois supprimé avec succès' 
    })

  } catch (error) {
    console.error('Delete wood type error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}