'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  Store,
  TrendingUp,
  Archive
} from 'lucide-react'
import { AuthUser } from '@/types'
import { ENABLE_EMPLOYEE_TRACKING } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface SidebarProps {
  user: AuthUser
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ user, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  const navigation = [
    { 
      name: 'Tableau de Bord', 
      href: '/dashboard', 
      icon: LayoutDashboard,
      description: 'Vue d\'ensemble'
    },
    ...(user.role === 'admin' ? [
      { 
        name: 'Ventes', 
        href: '/dashboard/sales', 
        icon: ShoppingCart,
        description: 'Gérer les ventes'
      },
      { 
        name: 'Achats', 
        href: '/dashboard/purchases', 
        icon: Package,
        description: 'Gérer les achats'
      },
      { 
        name: 'Utilisateurs', 
        href: '/dashboard/users', 
        icon: Users,
        description: 'Gérer les utilisateurs'
      },
      ...(ENABLE_EMPLOYEE_TRACKING ? [
        { 
          name: 'Suivi Activités', 
          href: '/dashboard/tracking', 
          icon: Activity,
          description: 'Activités des employés'
        }
      ] : []),
      { 
        name: 'Paramètres', 
        href: '/dashboard/settings', 
        icon: Settings,
        description: 'Configuration'
      }
    ] : [
      { 
        name: 'Ventes', 
        href: '/dashboard/sales', 
        icon: ShoppingCart,
        description: 'Effectuer des ventes'
      }
    ]),
  ]

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-xl z-40 transition-all duration-300 ease-in-out",
      "lg:relative lg:translate-x-0",
      collapsed ? "w-18-translate-x-full lg:translate-x-0" : "w-64 translate-x-0"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center group">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-200">
              <Store className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              GestionStore
            </span>
          </Link>
        )}
        
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden",
                isActive
                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-md border border-blue-200/50"
                  : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-r"></div>
              )}
              
              {/* Background gradient for active state */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5"></div>
              )}
              
              <item.icon className={cn(
                "h-5 w-5 flex-shrink-0 transition-all duration-200 relative z-10",
                collapsed ? "mx-auto" : "mr-3",
                isActive ? "text-blue-600" : "group-hover:text-blue-600 group-hover:scale-110"
              )} />
              
              {!collapsed && (
                <div className="flex-1 relative z-10">
                  <div className="font-medium">{item.name}</div>
                  <div className={cn(
                    "text-xs transition-colors duration-200",
                    isActive ? "text-blue-600/80" : "text-gray-500 group-hover:text-blue-600/80"
                  )}>
                    {item.description}
                  </div>
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User info at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200/50 bg-gradient-to-t from-gray-50/50 to-transparent">
        <div className={cn(
          "flex items-center space-x-3 p-3 rounded-xl bg-white/60 border border-gray-200/30 shadow-sm",
          collapsed && "justify-center"
        )}>
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
            {user.prenom?.charAt(0) || user.nom?.charAt(0) || 'U'}
          </div>
          
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {user.prenom} {user.nom}
              </div>
              <div className="flex items-center mt-1">
                <span className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                  user.role === 'admin' 
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white" 
                    : "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                )}>
                  {user.role === 'admin' ? 'Admin' : 'Employé'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}