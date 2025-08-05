'use client'

import { useState } from 'react'
import { 
  Activity, 
  User, 
  Calendar, 
  Eye, 
  Plus, 
  Edit, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Monitor,
  MapPin
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ActivityLog, User as UserType } from '@/types'

interface ActivityLogWithUser extends ActivityLog {
  utilisateur: Pick<UserType, 'nom' | 'prenom' | 'email' | 'role'> | null
}

interface ActivityTrackingTableProps {
  activities: ActivityLogWithUser[]
  isLoading: boolean
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  onPageChange?: (page: number) => void
}

interface ActivityDetailModalProps {
  activity: ActivityLogWithUser | null
  onClose: () => void
}

function ActivityDetailModal({ activity, onClose }: ActivityDetailModalProps) {
  if (!activity) return null

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(dateString))
  }

  const formatData = (data: any) => {
    if (!data) return 'N/A'
    return JSON.stringify(data, null, 2)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Eye className="h-5 w-5 mr-2 text-blue-600" />
              Détails de l&apos;Activité
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="space-y-6">
            {/* General Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Informations Générales
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Employé:</span>
                    <span className="text-gray-700">
                      {activity.utilisateur 
                        ? `${activity.utilisateur.prenom} ${activity.utilisateur.nom} (${activity.utilisateur.email})`
                        : 'Utilisateur supprimé'
                      }
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Action:</span>
                    <Badge 
                      className={`${
                        activity.action_type === 'CREATE' 
                          ? 'bg-green-100 text-green-800' 
                          : activity.action_type === 'UPDATE'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {activity.action_type}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Table:</span>
                    <Badge className="bg-purple-100 text-purple-800">
                      {activity.table_name}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">ID Enregistrement:</span>
                    <span className="text-gray-700">{activity.record_id}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Date:</span>
                    <span className="text-gray-700">{formatDate(activity.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Informations Techniques
                </h3>
                
                <div className="space-y-3">
                  {activity.ip_address && (
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <span className="font-medium">Adresse IP:</span>
                        <div className="text-gray-700 text-sm">{activity.ip_address}</div>
                      </div>
                    </div>
                  )}
                  
                  {activity.user_agent && (
                    <div className="flex items-start space-x-2">
                      <Monitor className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <span className="font-medium">User Agent:</span>
                        <div className="text-gray-700 text-sm break-all">{activity.user_agent}</div>
                      </div>
                    </div>
                  )}
                  
                  {activity.details && (
                    <div className="flex items-start space-x-2">
                      <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <span className="font-medium">Détails:</span>
                        <div className="text-gray-700 text-sm">{activity.details}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Data Changes */}
            {(activity.old_data || activity.new_data) && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Modifications des Données
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {activity.old_data && (
                    <div>
                      <h4 className="font-medium text-red-700 mb-2">Anciennes Données</h4>
                      <pre className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm overflow-x-auto">
                        {formatData(activity.old_data)}
                      </pre>
                    </div>
                  )}
                  
                  {activity.new_data && (
                    <div>
                      <h4 className="font-medium text-green-700 mb-2">Nouvelles Données</h4>
                      <pre className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm overflow-x-auto">
                        {formatData(activity.new_data)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <Button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700"
            >
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ActivityTrackingTable({ 
  activities, 
  isLoading, 
  pagination, 
  onPageChange 
}: ActivityTrackingTableProps) {
  const [selectedActivity, setSelectedActivity] = useState<ActivityLogWithUser | null>(null)

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <Plus className="h-4 w-4 text-green-600" />
      case 'UPDATE':
        return <Edit className="h-4 w-4 text-blue-600" />
      case 'DELETE':
        return <Trash2 className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getActionBadge = (action: string) => {
    const colors = {
      CREATE: 'bg-green-100 text-green-800',
      UPDATE: 'bg-blue-100 text-blue-800',
      DELETE: 'bg-red-100 text-red-800'
    }
    return colors[action as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getTableBadge = (tableName: string) => {
    const colors = {
      ventes: 'bg-purple-100 text-purple-800',
      achats: 'bg-orange-100 text-orange-800',
      utilisateurs: 'bg-indigo-100 text-indigo-800'
    }
    return colors[tableName as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return new Intl.DateTimeFormat('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    } else {
      return new Intl.DateTimeFormat('fr-FR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Aucune activité trouvée
        </h3>
        <p className="text-gray-500">
          Aucune activité n&apos;a été enregistrée pour les critères sélectionnés.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Activities List */}
      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => setSelectedActivity(activity)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {getActionIcon(activity.action_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge className={getActionBadge(activity.action_type)}>
                      {activity.action_type}
                    </Badge>
                    <Badge className={getTableBadge(activity.table_name)}>
                      {activity.table_name}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      ID: {activity.record_id}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {activity.utilisateur 
                          ? `${activity.utilisateur.prenom} ${activity.utilisateur.nom}`
                          : 'Utilisateur supprimé'
                        }
                      </span>
                    </div>
                    
                    {activity.details && (
                      <span className="text-sm text-gray-600 truncate max-w-md">
                        {activity.details}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(activity.created_at)}</span>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedActivity(activity)
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Affichage de {((pagination.page - 1) * pagination.limit) + 1} à{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} sur{' '}
            {pagination.total} activités
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>
            
            <span className="text-sm font-medium">
              Page {pagination.page} sur {pagination.totalPages}
            </span>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Activity Detail Modal */}
      <ActivityDetailModal
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />
    </div>
  )
}