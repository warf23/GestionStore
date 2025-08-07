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
  Activity,
  Settings,
  Search,
  User
} from 'lucide-react'
import { AuthUser } from '@/types'
import { ENABLE_EMPLOYEE_TRACKING } from '@/lib/constants'
import { AlertsDropdown } from './alerts-dropdown'

interface DashboardNavigationProps {
  user: AuthUser
  sidebarCollapsed?: boolean
  onSidebarToggle?: () => void
}

export function DashboardNavigation({ user, sidebarCollapsed = false, onSidebarToggle }: DashboardNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const navigation = [
    { name: 'Tableau de Bord', href: '/dashboard', icon: LayoutDashboard },
    ...(user.role === 'admin' ? [
      { name: 'Ventes', href: '/dashboard/sales', icon: ShoppingCart },
      { name: 'Achats', href: '/dashboard/purchases', icon: Package },
      { name: 'Utilisateurs', href: '/dashboard/users', icon: Users },
      ...(ENABLE_EMPLOYEE_TRACKING ? [
        { name: 'Suivi Activités', href: '/dashboard/tracking', icon: Activity }
      ] : []),
      { name: 'Paramètres', href: '/dashboard/settings', icon: Settings }
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

  const handleSettingsClick = () => {
    router.push('/dashboard/settings')
  }

  return (
    <nav className="bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
      <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Left side - Menu button for sidebar and search */}
          <div className="flex items-center space-x-4">
            {/* Sidebar toggle button */}
            {onSidebarToggle && (
              <button
                onClick={onSidebarToggle}
                className="p-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 group"
              >
                <Menu className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              </button>
            )}

            {/* Search Bar */}
            <div className="hidden md:flex items-center bg-gray-50/50 rounded-xl px-4 py-2 min-w-0 max-w-md">
              <Search className="h-4 w-4 text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-gray-600 placeholder-gray-400 flex-1 min-w-0"
              />
            </div>
          </div>

          {/* Center - Brand (hidden when sidebar is present) */}
          {!onSidebarToggle && (
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center group transition-all duration-200 hover:scale-105">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-200">
                  <Store className="h-6 w-6 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  GestionStore
                </span>
              </Link>
            </div>
          )}
          
          {/* Right side - Alerts, User info, Actions */}
          <div className="flex items-center space-x-3">
            {/* Mobile search button */}
            <button className="md:hidden p-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">
              <Search className="h-5 w-5" />
            </button>

            {/* Alerts Dropdown */}
            <AlertsDropdown onSettingsClick={handleSettingsClick} />

            {/* User Menu */}
            <div className="hidden sm:flex items-center space-x-3 pl-3 border-l border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {user.prenom} {user.nom}
                  </div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
                
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                  {user.prenom?.charAt(0) || user.nom?.charAt(0) || 'U'}
                </div>
                
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
                  {user.role === 'admin' ? 'Admin' : 'Employé'}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group"
                title="Déconnexion"
              >
                <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="p-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <User className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200/50">
          <div className="p-4 space-y-4">
            {/* Mobile Search */}
            <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3">
              <Search className="h-4 w-4 text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-gray-600 placeholder-gray-400 flex-1"
              />
            </div>

            {/* Mobile Navigation */}
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-4 py-3 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Mobile User Info */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-semibold">
                  {user.prenom?.charAt(0) || user.nom?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {user.prenom} {user.nom}
                  </div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                  <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                    {user.role === 'admin' ? 'Admin' : 'Employé'}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  handleLogout()
                }}
                className="flex w-full items-center justify-center mt-3 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}