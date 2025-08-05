'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Menu, 
  X, 
  LogOut,
  Store,
  Activity
} from 'lucide-react'
import { AuthUser } from '@/types'
import { ENABLE_EMPLOYEE_TRACKING } from '@/lib/constants'

interface DashboardNavigationProps {
  user: AuthUser
}

export function DashboardNavigation({ user }: DashboardNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  const navigation = [
    { name: 'Tableau de Bord', href: '/dashboard', icon: LayoutDashboard },
    ...(user.role === 'admin' ? [
      { name: 'Ventes', href: '/dashboard/sales', icon: ShoppingCart },
      { name: 'Achats', href: '/dashboard/purchases', icon: Package },
      { name: 'Utilisateurs', href: '/dashboard/users', icon: Users },
      ...(ENABLE_EMPLOYEE_TRACKING ? [
        { name: 'Suivi Activités', href: '/dashboard/tracking', icon: Activity }
      ] : [])
    ] : [
      { name: 'Ventes', href: '/dashboard/sales', icon: ShoppingCart }
    ]),
  ]

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
      router.push('/auth/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <nav className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20 sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/dashboard" className="flex items-center group transition-all duration-200 hover:scale-105">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-200">
                  <Store className="h-6 w-6 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  GestionStore
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all duration-200 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/10 group-hover:to-indigo-500/10 transition-all duration-200"></div>
                  <item.icon className="h-4 w-4 mr-2 relative z-10 group-hover:scale-110 transition-transform duration-200" />
                  <span className="relative z-10">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="font-medium text-gray-900">
                  {user.prenom} {user.nom}
                </span>
                <span className="ml-2 inline-flex items-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-1 text-xs font-medium text-white shadow-lg">
                  {user.role === 'admin' ? 'Admin' : 'Employé'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50/50 rounded-lg transition-all duration-200 group"
              >
                <LogOut className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Déconnexion
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="space-y-1 pb-3 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center px-4 py-2">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">
                    {user.prenom} {user.nom}
                  </div>
                  <div className="text-gray-500">{user.email}</div>
                  <span className="mt-1 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    {user.role === 'admin' ? 'Admin' : 'Employé'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  handleLogout()
                }}
                className="flex w-full items-center px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}