'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Menu,
  LogOut,
  Store,
  Activity,
  Settings,
  Search,
  User,
} from 'lucide-react'
import { AuthUser } from '@/types'
import { ENABLE_EMPLOYEE_TRACKING } from '@/lib/constants'
import { AlertsDropdown } from './alerts-dropdown'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface DashboardNavigationProps {
  user: AuthUser
  sidebarCollapsed?: boolean
  onSidebarToggle?: () => void
}

export function DashboardNavigation({ user, sidebarCollapsed = false, onSidebarToggle }: DashboardNavigationProps) {
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
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            {onSidebarToggle && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={onSidebarToggle}>
                      <Menu className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Menu</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <div className="hidden md:flex items-center gap-2 min-w-0 max-w-md">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="h-9"
              />
            </div>
          </div>

          {!onSidebarToggle && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Logo" width={22} height={22} />
              <span className="text-base font-semibold">BTL Wood Style</span>
            </Link>
          )}

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>

            <AlertsDropdown onSettingsClick={handleSettingsClick} />

            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden sm:flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium leading-none">{user.prenom} {user.nom}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user.prenom?.charAt(0) || user.nom?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSettingsClick}>
                  <Settings className="mr-2 h-4 w-4" /> Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" /> Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="sm:hidden">
                  <User className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher..."
                    />
                  </div>
                  <div className="space-y-1">
                    {navigation.map((item) => (
                      <Link key={item.name} href={item.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground">
                        <item.icon className="h-4 w-4" />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                  <div className="pt-2">
                    <Button variant="destructive" className="w-full" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" /> Déconnexion
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}