import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth'
import { hashPassword } from '@/lib/auth'

// GET - Fetch single user (Admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé - Admin requis' }, { status: 403 })
    }

    const supabase = createAdminClient()
    
    const { data: user, error } = await supabase
      .from('utilisateurs')
      .select('id, email, nom, prenom, role, created_at, updated_at')
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// PUT - Update user (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé - Admin requis' }, { status: 403 })
    }

    const body = await request.json()
    const { email, nom, prenom, password, role } = body

    if (!email || !nom || !prenom) {
      return NextResponse.json(
        { error: 'Email, nom et prénom requis' },
        { status: 400 }
      )
    }

    // Validate role
    if (role && !['admin', 'employe'].includes(role)) {
      return NextResponse.json(
        { error: 'Rôle invalide' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check if email already exists for other users
    const { data: existingUser } = await supabase
      .from('utilisateurs')
      .select('id')
      .eq('email', email)
      .neq('id', params.id)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé par un autre utilisateur' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: any = {
      email,
      nom,
      prenom,
      role: role || 'employe'
    }

    // Hash new password if provided
    if (password) {
      updateData.password_hash = await hashPassword(password)
    }

    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from('utilisateurs')
      .update(updateData)
      .eq('id', params.id)
      .select('id, email, nom, prenom, role, updated_at')
      .single()

    if (updateError) {
      console.error('Error updating user:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour de l\'utilisateur' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Utilisateur mis à jour avec succès',
      user: updatedUser
    })

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// DELETE - Delete user (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé - Admin requis' }, { status: 403 })
    }

    // Prevent admin from deleting themselves
    if (currentUser.id === params.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas supprimer votre propre compte' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check if user has sales or purchases
    const { data: userSales } = await supabase
      .from('ventes')
      .select('id')
      .eq('utilisateur_id', params.id)
      .limit(1)

    const { data: userPurchases } = await supabase
      .from('achats')
      .select('id')
      .eq('utilisateur_id', params.id)
      .limit(1)

    if (userSales && userSales.length > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un utilisateur qui a des ventes associées' },
        { status: 400 }
      )
    }

    if (userPurchases && userPurchases.length > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un utilisateur qui a des achats associés' },
        { status: 400 }
      )
    }

    // Delete user
    const { error } = await supabase
      .from('utilisateurs')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting user:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression de l\'utilisateur' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Utilisateur supprimé avec succès'
    })

  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}