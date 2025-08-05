import { Metadata } from 'next'
import { getCurrentUser } from '@/lib/auth'
import { DashboardContent } from '@/components/dashboard/dashboard-content'

export const metadata: Metadata = {
  title: 'Tableau de Bord | Gestion Magasin',
  description: 'Tableau de bord principal pour la gestion des ventes et achats',
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    return null // This will be redirected by middleware
  }

  return <DashboardContent user={user} />
}