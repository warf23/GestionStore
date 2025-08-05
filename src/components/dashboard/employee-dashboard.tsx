'use client'

import Link from 'next/link'
import { ShoppingCart, TrendingUp, Package, DollarSign, RefreshCw, Plus, Award } from 'lucide-react'
import { useEmployeeDashboardStats } from '@/hooks/use-employee-dashboard'
import { AuthUser } from '@/types'
import { Button } from '@/components/ui/button'

interface EmployeeDashboardProps {
  user: AuthUser
}

export function EmployeeDashboard({ user }: EmployeeDashboardProps) {
  const { data: stats, isLoading, error, refetch } = useEmployeeDashboardStats()

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur lors du chargement des statistiques</p>
          <Button onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  const todayStats = [
    {
      name: 'Ventes Aujourd\'hui',
      value: isLoading ? '...' : stats?.todaySales.toString() || '0',
      icon: ShoppingCart,
      color: 'text-green-600 bg-green-100',
      description: 'Nouvelles ventes',
    },
    {
      name: 'Revenus du Jour',
      value: isLoading ? '...' : `${stats?.todayRevenue.toFixed(2) || '0.00'} DH`,
      icon: DollarSign,
      color: 'text-purple-600 bg-purple-100',
      description: 'Chiffre d\'affaires',
    },
    {
      name: 'Mes Articles Vendus',
      value: isLoading ? '...' : stats?.totalProductsSold.toString() || '0',
      icon: Package,
      color: 'text-blue-600 bg-blue-100',
      description: 'Quantité totale',
    },
    {
      name: 'Panier Moyen',
      value: isLoading ? '...' : `${stats?.averageBasket.toFixed(2) || '0.00'} DH`,
      icon: TrendingUp,
      color: 'text-orange-600 bg-orange-100',
      description: 'Par transaction',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="border-b border-gray-200 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Espace Employé
            </h1>
            <p className="mt-2 text-gray-600">
              Bonjour {user.prenom}, voici vos indicateurs du jour
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

      {/* Today's Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {todayStats.map((stat) => (
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg bg-white shadow border">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Actions Rapides
            </h3>
            <div className="space-y-3">
              <Link 
                href="/dashboard/sales"
                className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <span className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-3 text-green-600" />
                  Gérer Mes Ventes
                </span>
                <span className="text-gray-400">→</span>
              </Link>
              <Link 
                href="/dashboard/sales"
                className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-md hover:bg-green-50 transition-colors bg-green-50"
              >
                <span className="flex items-center">
                  <Plus className="h-5 w-5 mr-3 text-green-600" />
                  Nouvelle Vente
                </span>
                <span className="text-gray-400">→</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow border">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Mes Statistiques
            </h3>
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Chargement...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Mes ventes totales</span>
                  <span className="font-medium text-green-600">{stats?.totalSales || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Mes revenus générés</span>
                  <span className="font-medium text-purple-600">
                    {stats ? stats.totalRevenue.toFixed(2) : '0.00'} DH
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Cette semaine</span>
                  <span className="font-medium text-blue-600">
                    {stats?.weeklySales || 0} vente(s)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Ce mois</span>
                  <span className="font-medium text-orange-600">
                    {stats?.monthlySales || 0} vente(s)
                  </span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="text-sm font-medium text-gray-700">Ma Performance</span>
                  <span className="font-bold text-green-600 flex items-center">
                    <Award className="h-4 w-4 mr-1" />
                    {stats?.totalSales && stats.totalSales > 0 ? 'Excellent!' : 'Commencer!'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <ShoppingCart className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Accès Employé
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                En tant qu'employé, vous avez accès à :
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Consultation des ventes en lecture seule</li>
                <li>Vos indicateurs de performance du jour</li>
                <li>Statistiques globales du magasin</li>
              </ul>
              <p className="mt-2 text-xs">
                Pour plus de fonctionnalités, contactez votre administrateur.
              </p>
            </div>
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