import { useQuery } from '@tanstack/react-query'
import { ActivityLog, User } from '@/types'

interface ActivityLogWithUser extends ActivityLog {
  utilisateur: Pick<User, 'nom' | 'prenom' | 'email' | 'role'> | null
}

interface TrackingResponse {
  activities: ActivityLogWithUser[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function useEmployeeActivities(employeeId: string | null, page: number = 1, limit: number = 50) {
  return useQuery<TrackingResponse>({
    queryKey: ['employee-activities', employeeId, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      
      if (employeeId) {
        params.append('employeeId', employeeId)
      }

      const response = await fetch(`/api/tracking?${params}`)
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des activités')
      }
      
      return response.json()
    },
    enabled: true
  })
}

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users')
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des utilisateurs')
      }
      
      const data = await response.json()
      return data.users || []
    }
  })
}