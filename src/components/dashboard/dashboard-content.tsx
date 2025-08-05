'use client'

import Link from 'next/link'
import { BarChart3, ShoppingCart, Package, Users, TrendingUp, DollarSign, RefreshCw } from 'lucide-react'
import { useDashboardStats } from '@/hooks/use-dashboard'
import { AuthUser } from '@/types'
import { EmployeeDashboard } from './employee-dashboard'

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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur lors du chargement des statistiques</p>
          <button 
            onClick={() => refetch()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </button>
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
    {
      name: 'Panier Moyen',
      value: isLoading ? '...' : `${stats?.averageBasket.toFixed(2) || '0.00'} DH`,
      icon: TrendingUp,
      color: 'text-blue-600',
    },
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
      {/* Welcome Header */}
      <div className="border-b border-gray-200 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tableau de Bord
            </h1>
            <p className="mt-2 text-gray-600">
              Bonjour {user.prenom} {user.nom}, bienvenue dans votre espace de gestion
            </p>
          </div>
          {isLoading && (
            <div className="flex items-center text-sm text-gray-500">
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Mise à jour...
            </div>
          )}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {mainStats.map((stat) => (
          <div
            key={stat.name}
            className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow border sm:p-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-md ${stat.color}`}>
                  <stat.icon className="h-6 w-6" aria-hidden="true" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    {stat.name}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stat.value}
                  </dd>
                  <dd className="text-xs text-gray-400">
                    {stat.description}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {additionalStats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg border"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className={`text-lg font-medium ${stat.color}`}>
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg bg-white shadow border">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Actions Rapides
            </h3>
            <div className="space-y-3">
              {user.role === 'admin' && (
                <>
                  <Link 
                    href="/dashboard/sales"
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <span className="flex items-center">
                      <ShoppingCart className="h-5 w-5 mr-3 text-green-600" />
                      Gérer les Ventes
                    </span>
                    <span className="text-gray-400">→</span>
                  </Link>
                  <Link 
                    href="/dashboard/purchases"
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <span className="flex items-center">
                      <Package className="h-5 w-5 mr-3 text-blue-600" />
                      Gérer les Achats
                    </span>
                    <span className="text-gray-400">→</span>
                  </Link>
                  <Link 
                    href="/dashboard/users"
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <span className="flex items-center">
                      <Users className="h-5 w-5 mr-3 text-orange-600" />
                      Gérer les Utilisateurs
                    </span>
                    <span className="text-gray-400">→</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow border">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Résumé Mensuel
            </h3>
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Chargement...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Ventes ce mois</span>
                  <span className="font-medium text-green-600">{stats?.monthlySales || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Achats ce mois</span>
                  <span className="font-medium text-blue-600">{stats?.monthlyPurchases || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Revenus ce mois</span>
                  <span className="font-medium text-purple-600">
                    {stats ? stats.totalRevenue.toFixed(2) : '0.00'} DH
                  </span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="text-sm font-medium text-gray-700">Profit</span>
                  <span className={`font-bold ${stats && stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats ? stats.profit.toFixed(2) : '0.00'} DH
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real-time indicator */}
      <div className="text-center">
        <p className="text-xs text-gray-400">
          Données mises à jour automatiquement • Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}
        </p>
      </div>
    </div>
  )
}