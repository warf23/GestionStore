import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { hashPassword } from '@/lib/auth'

// POST - Create test employee (for development)
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    // Check if employee already exists
    const { data: existingEmployee } = await supabase
      .from('utilisateurs')
      .select('id')
      .eq('email', 'employe@store.com')
      .single()

    if (existingEmployee) {
      return NextResponse.json({
        message: 'Employee user already exists',
        credentials: {
          email: 'employe@store.com',
          password: 'employe123'
        }
      })
    }

    // Hash password for 'employe123'
    const passwordHash = await hashPassword('employe123')

    // Create employee user
    const { data: newEmployee, error: createError } = await supabase
      .from('utilisateurs')
      .insert({
        email: 'employe@store.com',
        nom: 'Dupont',
        prenom: 'Jean',
        role: 'employe',
        password_hash: passwordHash
      })
      .select('id, email, nom, prenom, role')
      .single()

    if (createError) {
      console.error('Error creating employee:', createError)
      return NextResponse.json(
        { error: 'Failed to create employee user' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Test employee created successfully',
      user: newEmployee,
      credentials: {
        email: 'employe@store.com',
        password: 'employe123'
      }
    })

  } catch (error) {
    console.error('Setup employee error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}