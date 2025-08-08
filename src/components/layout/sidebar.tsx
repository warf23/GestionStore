'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
} from 'lucide-react'
import { AuthUser } from '@/types'
import { ENABLE_EMPLOYEE_TRACKING } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface SidebarProps {
  user: AuthUser
  collapsed: boolean
  onToggle: () => void
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ user, collapsed, onToggle, isMobileOpen = false, onMobileClose }: SidebarProps) {
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

  const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-full border-r bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70 transition-transform duration-300 ease-in-out shadow-sm',
        'lg:relative',
        // Desktop: collapsed width; Mobile: off-canvas translate
        isDesktop
          ? (collapsed ? 'w-16 translate-x-0' : 'w-64 translate-x-0')
          : (isMobileOpen ? 'w-64 translate-x-0' : '-translate-x-full w-64'),
      )}
      role="dialog"
      aria-modal={!isDesktop}
      aria-hidden={isDesktop ? undefined : !isMobileOpen}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center group">
            <div className="p-1 rounded-lg shadow-sm">
              <Image src="/logo.png" alt="Logo" width={28} height={28} />
            </div>
            <span className="ml-3 text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              BTL Wood Style
            </span>
          </Link>
        )}
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onToggle}>
                {collapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{collapsed ? 'Déployer' : 'Réduire'}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          
          return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  // Close mobile drawer when navigating
                  if (!isDesktop && onMobileClose) onMobileClose()
                }}
                className={cn(
                  'group relative flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0',
                    collapsed ? 'mx-auto' : 'mr-3'
                  )}
                />
                {!collapsed && (
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                )}
              </Link>
          )
        })}
      </nav>

      {/* User info at bottom */}
      <div className="absolute bottom-0 left-0 right-0 border-t p-3">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}> 
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-semibold">
            {user.prenom?.charAt(0) || user.nom?.charAt(0) || 'U'}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{user.prenom} {user.nom}</div>
              <div className="text-xs text-muted-foreground">{user.role === 'admin' ? 'Admin' : 'Employé'}</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}