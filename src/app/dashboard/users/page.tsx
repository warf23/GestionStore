import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { UsersTable } from '@/components/tables/users-table'

export const metadata: Metadata = {
  title: 'Gestion des Utilisateurs | Gestion Magasin',
  description: 'Gérez les comptes utilisateurs de votre magasin',
}

export default async function UsersPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Only admin can access user management
  if (user.role !== 'admin') {
    redirect('/dashboard')
  }

  return <UsersTable currentUser={user} />
}