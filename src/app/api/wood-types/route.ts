import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth'

// GET /api/wood-types - Fetch all wood types
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const supabase = createAdminClient()
    
    const { data: woodTypes, error } = await supabase
      .from('wood_types')
      .select('*')
      .order('nom', { ascending: true })

    if (error) {
      console.error('Error fetching wood types:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des types de bois' },
        { status: 500 }
      )
    }

    return NextResponse.json({ woodTypes })
  } catch (error) {
    console.error('Wood types API error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// POST /api/wood-types - Create new wood type
export async function POST(request: NextRequest) {
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
      .insert({
        nom: nom.trim(),
        description: description?.trim() || null,
        couleur: couleur || '#8B4513'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating wood type:', error)
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Un type de bois avec ce nom existe déjà' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Erreur lors de la création du type de bois' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Type de bois créé avec succès',
      woodType 
    }, { status: 201 })

  } catch (error) {
    console.error('Create wood type error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}