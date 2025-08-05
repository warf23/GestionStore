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
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-white/40 backdrop-blur-xl border border-white/30 shadow-xl mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/30 to-purple-50/30"></div>
        
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                  Tableau de Bord
                </h1>
              </div>
              <p className="text-lg text-gray-700 font-medium">
                Bonjour <span className="text-blue-600 font-semibold">{user.prenom} {user.nom}</span>, bienvenue dans votre espace de gestion
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Gérez vos ventes, achats et suivez vos performances en temps réel
              </p>
            </div>
            {isLoading && (
              <div className="flex items-center bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 rounded-xl px-4 py-3 shadow-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                </div>
                <span className="text-sm font-medium text-blue-800">Mise à jour en cours...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {mainStats.map((stat, index) => (
          <div
            key={stat.name}
            className={`group relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${
              index === 0 ? 'hover:bg-gradient-to-br hover:from-green-50/80 hover:to-emerald-50/80' :
              index === 1 ? 'hover:bg-gradient-to-br hover:from-blue-50/80 hover:to-sky-50/80' :
              index === 2 ? 'hover:bg-gradient-to-br hover:from-purple-50/80 hover:to-violet-50/80' :
              'hover:bg-gradient-to-br hover:from-orange-50/80 hover:to-amber-50/80'
            }`}
          >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-gray-50/30 group-hover:opacity-100 opacity-0 transition-opacity duration-300"></div>
            
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-600 mb-2">
                    {stat.name}
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </dd>
                  <dd className="text-xs text-gray-500">
                    {stat.description}
                  </dd>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div className={`relative inline-flex h-14 w-14 items-center justify-center rounded-xl ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-7 w-7" aria-hidden="true" />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Subtle border glow */}
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 group-hover:ring-white/20 transition-all duration-300"></div>
          </div>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {additionalStats.map((stat, index) => (
          <div
            key={stat.name}
            className="group relative overflow-hidden rounded-xl bg-white/50 backdrop-blur-lg border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent group-hover:from-white/20 transition-all duration-300"></div>
            
            <div className="relative p-5">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <dt className="text-sm font-medium text-gray-600 truncate mb-1">
                    {stat.name}
                  </dt>
                  <dd className={`text-xl font-bold ${stat.color} group-hover:scale-105 transition-transform duration-300 origin-left`}>
                    {stat.value}
                  </dd>
                </div>
              </div>
            </div>
            
            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20"></div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-xl border border-white/20 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30"></div>
          
          <div className="relative p-6">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <h3 className="ml-3 text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Actions Rapides
              </h3>
            </div>
            
            <div className="space-y-3">
              {user.role === 'admin' && (
                <>
                  <Link 
                    href="/dashboard/sales"
                    className="group w-full flex items-center justify-between px-4 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-xl hover:from-green-100 hover:to-emerald-100 hover:border-green-300/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                  >
                    <span className="flex items-center">
                      <div className="p-2 bg-green-500 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300">
                        <ShoppingCart className="h-4 w-4 text-white" />
                      </div>
                      <span className="ml-3 font-medium text-green-800 group-hover:text-green-900">Gérer les Ventes</span>
                    </span>
                    <div className="p-1 rounded-full bg-green-200 group-hover:bg-green-300 transition-colors duration-300">
                      <span className="text-green-700 group-hover:translate-x-1 transition-transform duration-300 inline-block">→</span>
                    </div>
                  </Link>
                  
                  <Link 
                    href="/dashboard/purchases"
                    className="group w-full flex items-center justify-between px-4 py-4 bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200/50 rounded-xl hover:from-blue-100 hover:to-sky-100 hover:border-blue-300/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                  >
                    <span className="flex items-center">
                      <div className="p-2 bg-blue-500 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300">
                        <Package className="h-4 w-4 text-white" />
                      </div>
                      <span className="ml-3 font-medium text-blue-800 group-hover:text-blue-900">Gérer les Achats</span>
                    </span>
                    <div className="p-1 rounded-full bg-blue-200 group-hover:bg-blue-300 transition-colors duration-300">
                      <span className="text-blue-700 group-hover:translate-x-1 transition-transform duration-300 inline-block">→</span>
                    </div>
                  </Link>
                  
                  <Link 
                    href="/dashboard/users"
                    className="group w-full flex items-center justify-between px-4 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/50 rounded-xl hover:from-orange-100 hover:to-amber-100 hover:border-orange-300/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                  >
                    <span className="flex items-center">
                      <div className="p-2 bg-orange-500 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <span className="ml-3 font-medium text-orange-800 group-hover:text-orange-900">Gérer les Utilisateurs</span>
                    </span>
                    <div className="p-1 rounded-full bg-orange-200 group-hover:bg-orange-300 transition-colors duration-300">
                      <span className="text-orange-700 group-hover:translate-x-1 transition-transform duration-300 inline-block">→</span>
                    </div>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-xl border border-white/20 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-pink-50/30"></div>
          
          <div className="relative p-6">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h3 className="ml-3 text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Résumé Mensuel
              </h3>
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <RefreshCw className="h-8 w-8 animate-spin text-white" />
                  </div>
                </div>
                <p className="text-gray-600 font-medium">Chargement...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-green-50/50 border border-green-200/30">
                  <span className="text-sm font-medium text-gray-700">Ventes ce mois</span>
                  <span className="font-bold text-green-600 text-lg">{stats?.monthlySales || 0}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50/50 border border-blue-200/30">
                  <span className="text-sm font-medium text-gray-700">Achats ce mois</span>
                  <span className="font-bold text-blue-600 text-lg">{stats?.monthlyPurchases || 0}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-lg bg-purple-50/50 border border-purple-200/30">
                  <span className="text-sm font-medium text-gray-700">Revenus ce mois</span>
                  <span className="font-bold text-purple-600 text-lg">
                    {stats ? stats.totalRevenue.toFixed(2) : '0.00'} DH
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200/50 shadow-inner">
                  <span className="text-sm font-semibold text-gray-800">Profit Total</span>
                  <span className={`font-bold text-xl ${stats && stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
        <div className="inline-flex items-center bg-white/50 backdrop-blur-lg border border-white/30 rounded-full px-6 py-3 shadow-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-3"></div>
          <p className="text-sm text-gray-600 font-medium">
            Données en temps réel • Dernière mise à jour: <span className="text-blue-600 font-semibold">{new Date().toLocaleTimeString('fr-FR')}</span>
          </p>
        </div>
      </div>
    </div>
  )
}