import bcrypt from 'bcryptjs'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AuthUser } from '@/types'

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  // Use admin client to bypass RLS for authentication
  const supabase = createAdminClient()
  
  try {
    // Get user from database
    const { data: user, error } = await supabase
      .from('utilisateurs')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      return null
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash)
    
    if (!isValidPassword) {
      return null
    }

    // Return user without password hash
    return {
      id: user.id.toString(),
      email: user.email,
      role: user.role,
      nom: user.nom,
      prenom: user.prenom,
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    // Read user from session cookie
    const { cookies } = await import('next/headers')
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('user-session')
    
    if (!sessionCookie) {
      return null
    }

    const userData = JSON.parse(sessionCookie.value)
    
    return {
      id: userData.id.toString(),
      email: userData.email,
      role: userData.role,
      nom: userData.nom,
      prenom: userData.prenom,
    }
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}