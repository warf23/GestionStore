import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { CreateActivityLog } from '@/types'
import { ENABLE_EMPLOYEE_TRACKING } from '@/lib/constants'

interface LogActivityParams {
  userId: number
  actionType: 'CREATE' | 'UPDATE' | 'DELETE'
  tableName: 'ventes' | 'achats' | 'utilisateurs'
  recordId: number
  oldData?: any
  newData?: any
  details?: string
  request?: NextRequest
}

export async function logActivity({
  userId,
  actionType,
  tableName,
  recordId,
  oldData,
  newData,
  details,
  request
}: LogActivityParams) {
  // Skip logging if tracking is disabled
  if (!ENABLE_EMPLOYEE_TRACKING) {
    return
  }

  try {
    const supabase = createAdminClient()

    // Extract IP and User Agent from request if available
    let ipAddress: string | null = null
    let userAgent: string | null = null

    if (request) {
      // Get IP address from headers
      ipAddress = 
        request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        request.headers.get('cf-connecting-ip') ||
        null

      userAgent = request.headers.get('user-agent') || null
    }

    const logData: CreateActivityLog = {
      utilisateur_id: userId,
      action_type: actionType,
      table_name: tableName,
      record_id: recordId,
      old_data: oldData || null,
      new_data: newData || null,
      details: details || null,
      ip_address: ipAddress,
      user_agent: userAgent
    }

    const { error } = await supabase
      .from('activity_logs')
      .insert(logData)

    if (error) {
      console.error('Failed to log activity:', error)
    }
  } catch (error) {
    console.error('Error logging activity:', error)
  }
}

export function formatActivityDetails(actionType: string, tableName: string, data?: any): string {
  switch (actionType) {
    case 'CREATE':
      switch (tableName) {
        case 'ventes':
          return `Vente créée pour le client: ${data?.nom_client || 'N/A'} - Total: ${data?.total || 'N/A'}€`
        case 'achats':
          return `Achat créé auprès du fournisseur: ${data?.nom_fournisseur || 'N/A'} - Total: ${data?.total || 'N/A'}€`
        case 'utilisateurs':
          return `Utilisateur créé: ${data?.nom || 'N/A'} ${data?.prenom || 'N/A'} (${data?.role || 'N/A'})`
        default:
          return `Enregistrement créé dans ${tableName}`
      }
    
    case 'UPDATE':
      switch (tableName) {
        case 'ventes':
          return `Vente modifiée - Client: ${data?.nom_client || 'N/A'} - Total: ${data?.total || 'N/A'}€`
        case 'achats':
          return `Achat modifié - Fournisseur: ${data?.nom_fournisseur || 'N/A'} - Total: ${data?.total || 'N/A'}€`
        case 'utilisateurs':
          return `Utilisateur modifié: ${data?.nom || 'N/A'} ${data?.prenom || 'N/A'} (${data?.role || 'N/A'})`
        default:
          return `Enregistrement modifié dans ${tableName}`
      }
    
    case 'DELETE':
      return `Enregistrement supprimé de ${tableName} (ID: ${data?.id || 'N/A'})`
    
    default:
      return `Action ${actionType} sur ${tableName}`
  }
}