import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth'

export interface Category {
  id: number
  nom: string
  description: string | null
  couleur: string
  created_at: string
  updated_at: string
}

// GET /api/categories - Fetch all categories
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const supabase = createAdminClient()
    
    // Fetch all categories
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('nom', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des catégories' },
        { status: 500 }
      )
    }

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Categories API error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// POST /api/categories - Create new category
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
        { error: 'Le nom de la catégorie est requis' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Create category
    const { data: category, error } = await supabase
      .from('categories')
      .insert({
        nom: nom.trim(),
        description: description?.trim() || null,
        couleur: couleur || '#3B82F6'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating category:', error)
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Une catégorie avec ce nom existe déjà' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Erreur lors de la création de la catégorie' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Catégorie créée avec succès',
      category 
    }, { status: 201 })

  } catch (error) {
    console.error('Create category error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}