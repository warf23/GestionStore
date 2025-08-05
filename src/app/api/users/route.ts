import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth'
import { hashPassword } from '@/lib/auth'
import { logActivity, formatActivityDetails } from '@/lib/activity-logger'

// GET - Fetch all users (Admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé - Admin requis' }, { status: 403 })
    }

    const supabase = createAdminClient()
    
    const { data: users, error } = await supabase
      .from('utilisateurs')
      .select('id, email, nom, prenom, role, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des utilisateurs' },
        { status: 500 }
      )
    }

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Users API error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// POST - Create new user (Admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé - Admin requis' }, { status: 403 })
    }

    const body = await request.json()
    const { email, nom, prenom, password, role = 'employe' } = body

    if (!email || !nom || !prenom || !password) {
      return NextResponse.json(
        { error: 'Email, nom, prénom et mot de passe requis' },
        { status: 400 }
      )
    }

    // Validate role
    if (!['admin', 'employe'].includes(role)) {
      return NextResponse.json(
        { error: 'Rôle invalide' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('utilisateurs')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from('utilisateurs')
      .insert({
        email,
        nom,
        prenom,
        role,
        password_hash: passwordHash
      })
      .select('id, email, nom, prenom, role, created_at')
      .single()

    if (createError) {
      console.error('Error creating user:', createError)
      return NextResponse.json(
        { error: 'Erreur lors de la création de l\'utilisateur' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Utilisateur créé avec succès',
      user: newUser 
    }, { status: 201 })

  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}