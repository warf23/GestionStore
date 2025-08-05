import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { PurchasesTable } from '@/components/tables/purchases-table'

export const metadata: Metadata = {
  title: 'Gestion des Achats | Gestion Magasin',
  description: 'Gérez tous les achats et approvisionnements de votre magasin',
}

export default async function PurchasesPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Only admin can access purchases management
  if (user.role !== 'admin') {
    redirect('/dashboard')
  }

  return <PurchasesTable />
}