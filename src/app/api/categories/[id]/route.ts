import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth'

// PUT /api/categories/[id] - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé - Admin requis' }, { status: 403 })
    }

    const categoryId = parseInt(params.id)
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'ID de catégorie invalide' }, { status: 400 })
    }

    const body = await request.json()
    const { nom, description, couleur } = body

    if (!nom) {
      return NextResponse.json(
        { error: 'Le nom de la catégorie est requis' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Update category
    const { data: category, error } = await supabase
      .from('categories')
      .update({
        nom: nom.trim(),
        description: description?.trim() || null,
        couleur: couleur || '#3B82F6'
      })
      .eq('id', categoryId)
      .select()
      .single()

    if (error) {
      console.error('Error updating category:', error)
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Une catégorie avec ce nom existe déjà' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour de la catégorie' },
        { status: 500 }
      )
    }

    if (!category) {
      return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: 'Catégorie mise à jour avec succès',
      category 
    })

  } catch (error) {
    console.error('Update category error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// DELETE /api/categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé - Admin requis' }, { status: 403 })
    }

    const categoryId = parseInt(params.id)
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'ID de catégorie invalide' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Check if category is being used in any products
    const { data: usageCheck, error: usageError } = await supabase
      .from('lignes_achat')
      .select('id')
      .eq('category_id', categoryId)
      .limit(1)

    if (usageError) {
      console.error('Error checking category usage:', usageError)
      return NextResponse.json(
        { error: 'Erreur lors de la vérification de l\'utilisation de la catégorie' },
        { status: 500 }
      )
    }

    if (usageCheck && usageCheck.length > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer cette catégorie car elle est utilisée par des produits' },
        { status: 409 }
      )
    }

    // Delete category
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)

    if (error) {
      console.error('Error deleting category:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression de la catégorie' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Catégorie supprimée avec succès' })

  } catch (error) {
    console.error('Delete category error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}