import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { SalesTable } from '@/components/tables/sales-table'
import { EmployeeSalesTable } from '@/components/tables/employee-sales-table'

export const metadata: Metadata = {
  title: 'Gestion des Ventes | Gestion Magasin',
  description: 'Gérez toutes les ventes et transactions de votre magasin',
}

export default async function SalesPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Show full management for admins, employee-specific view for employees
  if (user.role === 'admin') {
    return <SalesTable />
  } else {
    return <EmployeeSalesTable user={user} />
  }
}