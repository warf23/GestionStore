import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { ENABLE_EMPLOYEE_TRACKING } from '@/lib/constants'

// GET - Get activity logs for a specific employee or all employees
export async function GET(request: NextRequest) {
  // Return 404 if tracking is disabled
  if (!ENABLE_EMPLOYEE_TRACKING) {
    return NextResponse.json({ error: 'Fonctionnalité non disponible' }, { status: 404 })
  }

  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Only admins can view activity logs
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé - Admin uniquement' }, { status: 403 })
    }

    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    let query = supabase
      .from('activity_logs')
      .select(`
        *,
        utilisateur:utilisateur_id(nom, prenom, email, role)
      `)

    // Filter by employee if specified
    if (employeeId && employeeId !== 'all') {
      query = query.eq('utilisateur_id', employeeId)
    }

    const { data: activities, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching activities:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des activités' },
        { status: 500 }
      )
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('activity_logs')
      .select('*', { count: 'exact', head: true })

    if (employeeId && employeeId !== 'all') {
      countQuery = countQuery.eq('utilisateur_id', employeeId)
    }

    const { count } = await countQuery

    return NextResponse.json({
      activities: activities || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Tracking API error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}