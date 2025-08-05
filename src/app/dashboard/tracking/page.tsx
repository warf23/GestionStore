'use client'

import { useState } from 'react'
import { useEmployeeActivities, useUsers } from '@/hooks/use-tracking'
import { ActivityTrackingTable } from '@/components/tables/activity-tracking-table'
import { Badge } from '@/components/ui/badge'
import { Search, Clock, User, Activity } from 'lucide-react'

export default function TrackingPage() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const limit = 20

  const { data: usersData, isLoading: usersLoading, error: usersError } = useUsers()
  const { data: activitiesData, isLoading: activitiesLoading, error: activitiesError } = useEmployeeActivities(
    selectedEmployeeId === 'all' ? null : selectedEmployeeId,
    currentPage,
    limit
  )

  const employees = Array.isArray(usersData) ? usersData.filter(user => user.role === 'employe') : []
  const activities = activitiesData?.activities || []
  const pagination = activitiesData?.pagination

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Suivi des Activités
          </h1>
          <p className="text-gray-600">
            Surveillez toutes les actions effectuées par vos employés
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-xl bg-white p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 h-16 w-16 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/20"></div>
          <div className="relative">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Employés Actifs</dt>
                  <dd className="text-lg font-medium text-gray-900">{employees.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-white p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 h-16 w-16 rounded-full bg-gradient-to-br from-green-400/20 to-emerald-400/20"></div>
          <div className="relative">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Activités</dt>
                  <dd className="text-lg font-medium text-gray-900">{pagination?.total || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-white p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 h-16 w-16 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20"></div>
          <div className="relative">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Activités Récentes</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {activities.filter(activity => {
                      const activityDate = new Date(activity.created_at)
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      return activityDate >= today
                    }).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-white p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 h-16 w-16 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-400/20"></div>
          <div className="relative">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Search className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Filtre Actuel</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {selectedEmployeeId === 'all' ? 'Tous' : 'Employé'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Filter */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Search className="h-5 w-5 mr-2 text-blue-600" />
            Filtrer par Employé
          </h3>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setSelectedEmployeeId('all')
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                selectedEmployeeId === 'all'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              Tous les employés
            </button>
            
            {usersLoading ? (
              <div className="px-4 py-2 bg-gray-100 rounded-lg animate-pulse">
                Chargement...
              </div>
            ) : usersError ? (
              <div className="px-4 py-2 bg-red-100 text-red-700 rounded-lg">
                Erreur lors du chargement des employés
              </div>
            ) : (
              employees.map((employee) => (
                <button
                  key={employee.id}
                  onClick={() => {
                    setSelectedEmployeeId(employee.id.toString())
                    setCurrentPage(1)
                  }}
                  className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                    selectedEmployeeId === employee.id.toString()
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {employee.prenom} {employee.nom}
                  <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">
                    {employee.role}
                  </Badge>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Activities Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-600" />
            Journal d&apos;Activités
            {selectedEmployeeId !== 'all' && (
              <Badge className="ml-3 bg-blue-100 text-blue-800">
                Employé sélectionné
              </Badge>
            )}
          </h3>
        </div>
        
        <div className="p-6">
          {activitiesError ? (
            <div className="text-center py-8">
              <div className="text-red-500 text-lg">
                Erreur lors du chargement des activités
              </div>
              <p className="text-gray-500 mt-2">
                Veuillez réessayer plus tard
              </p>
            </div>
          ) : (
            <ActivityTrackingTable
              activities={activities}
              isLoading={activitiesLoading}
              pagination={pagination}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>
    </div>
  )
}