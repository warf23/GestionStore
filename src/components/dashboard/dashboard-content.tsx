'use client'

import Link from 'next/link'
import { BarChart3, ShoppingCart, Package, Users, TrendingUp, DollarSign, RefreshCw } from 'lucide-react'
import { useDashboardStats } from '@/hooks/use-dashboard'
import { AuthUser } from '@/types'
import { EmployeeDashboard } from './employee-dashboard'
import { LowStockAlerts } from '@/components/alerts/low-stock-alerts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { InsightsCharts } from './insights-charts'

interface DashboardContentProps {
  user: AuthUser
}

export function DashboardContent({ user }: DashboardContentProps) {
  // Show employee dashboard for non-admin users
  if (user.role !== 'admin') {
    return <EmployeeDashboard user={user} />
  }
  const { data: stats, isLoading, error, refetch } = useDashboardStats()

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-destructive">Erreur lors du chargement des statistiques</p>
          <Button onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Réessayer
          </Button>
        </div>
      </div>
    )
  }

  const mainStats = [
    {
      name: 'Ventes du jour',
      value: isLoading ? '...' : stats?.todaySales.toString() || '0',
      icon: ShoppingCart,
      color: 'text-green-600 bg-green-100',
      description: `${stats?.totalSales || 0} au total`,
    },
    {
      name: 'Achats du jour',
      value: isLoading ? '...' : stats?.todayPurchases.toString() || '0',
      icon: Package,
      color: 'text-blue-600 bg-blue-100',
      description: `${stats?.totalPurchases || 0} au total`,
    },
    {
      name: 'Revenus du jour',
      value: isLoading ? '...' : `${stats?.todayRevenue.toFixed(2) || '0.00'} DH`,
      icon: BarChart3,
      color: 'text-purple-600 bg-purple-100',
      description: `${stats?.totalRevenue.toFixed(2) || '0.00'} DH au total`,
    },
    {
      name: 'Utilisateurs actifs',
      value: isLoading ? '...' : stats?.activeUsers.toString() || '1',
      icon: Users,
      color: 'text-orange-600 bg-orange-100',
      description: 'Employés et admins',
    },
  ]

  const additionalStats = [
    {
      name: 'Profit Total',
      value: isLoading ? '...' : `${stats?.profit.toFixed(2) || '0.00'} DH`,
      icon: DollarSign,
      color: stats && stats.profit >= 0 ? 'text-green-600' : 'text-red-600',
    },
    // {
    //   name: 'Panier Moyen',
    //   value: isLoading ? '...' : `${stats?.averageBasket.toFixed(2) || '0.00'} DH`,
    //   icon: TrendingUp,
    //   color: 'text-blue-600',
    // },
    {
      name: 'Articles Vendus',
      value: isLoading ? '...' : stats?.totalProductsSold.toString() || '0',
      icon: Package,
      color: 'text-green-600',
    },
    {
      name: 'Articles Achetés',
      value: isLoading ? '...' : stats?.totalProductsPurchased.toString() || '0',
      icon: Package,
      color: 'text-blue-600',
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-2xl">Tableau de Bord</CardTitle>
              <CardDescription>
                Bonjour <span className="font-medium text-foreground">{user.prenom} {user.nom}</span> — suivez vos performances en temps réel
              </CardDescription>
            </div>
          </div>
          {isLoading && (
            <div className="inline-flex items-center rounded-md border bg-muted px-3 py-1 text-sm">
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Mise à jour...
        </div>
          )}
        </CardHeader>
      </Card>

      {/* Low Stock Alerts - Compact View */}
      <LowStockAlerts compact={true} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mainStats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>{stat.name}</CardDescription>
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <>
                  <Skeleton className="mb-2 h-7 w-24" />
                  <Skeleton className="h-4 w-32" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {additionalStats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
              <div>
                <CardDescription>{stat.name}</CardDescription>
                <CardTitle className={`text-xl ${stat.color}`}>{stat.value}</CardTitle>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" /> Actions Rapides
            </CardTitle>
            <CardDescription>Accédez rapidement aux sections les plus utilisées</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
              {user.role === 'admin' && (
                <>
                <Link href="/dashboard/sales" className="flex items-center justify-between rounded-md border p-3 hover:bg-accent hover:text-accent-foreground">
                  <span className="flex items-center gap-3"><ShoppingCart className="h-4 w-4" /> Gérer les Ventes</span>
                  <span>→</span>
                  </Link>
                <Link href="/dashboard/purchases" className="flex items-center justify-between rounded-md border p-3 hover:bg-accent hover:text-accent-foreground">
                  <span className="flex items-center gap-3"><Package className="h-4 w-4" /> Gérer les Achats</span>
                  <span>→</span>
                  </Link>
                <Link href="/dashboard/users" className="flex items-center justify-between rounded-md border p-3 hover:bg-accent hover:text-accent-foreground">
                  <span className="flex items-center gap-3"><Users className="h-4 w-4" /> Gérer les Utilisateurs</span>
                  <span>→</span>
                  </Link>
                </>
              )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" /> Résumé Mensuel
            </CardTitle>
            <CardDescription>Indicateurs clés pour le mois en cours</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-md border p-3">
                  <span className="text-sm text-muted-foreground">Ventes ce mois</span>
                  <span className="text-lg font-bold text-foreground">{stats?.monthlySales || 0}</span>
                </div>
                <div className="flex items-center justify-between rounded-md border p-3">
                  <span className="text-sm text-muted-foreground">Achats ce mois</span>
                  <span className="text-lg font-bold text-foreground">{stats?.monthlyPurchases || 0}</span>
                </div>
                <div className="flex items-center justify-between rounded-md border p-3">
                  <span className="text-sm text-muted-foreground">Revenus ce mois</span>
                  <span className="text-lg font-bold text-foreground">{stats ? stats.totalRevenue.toFixed(2) : '0.00'} DH</span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-muted p-4">
                  <span className="text-sm font-medium">Profit Total</span>
                  <span className={`text-xl font-bold ${stats && stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats ? stats.profit.toFixed(2) : '0.00'} DH
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <InsightsCharts />

      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-2 text-xs text-muted-foreground">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          Données en temps réel • Dernière mise à jour: <span className="font-medium text-foreground">{new Date().toLocaleTimeString('fr-FR')}</span>
        </div>
      </div>
    </div>
  )
}