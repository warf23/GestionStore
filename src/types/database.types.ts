export interface Database {
  public: {
    Tables: {
      utilisateurs: {
        Row: {
          id: number
          email: string
          nom: string
          prenom: string
          role: 'admin' | 'employe'
          password_hash: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          email: string
          nom: string
          prenom: string
          role?: 'admin' | 'employe'
          password_hash: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          email?: string
          nom?: string
          prenom?: string
          role?: 'admin' | 'employe'
          password_hash?: string
          created_at?: string
          updated_at?: string
        }
      }
      ventes: {
        Row: {
          id: number
          utilisateur_id: number | null
          nom_client: string
          date_vente: string
          total: number
        }
        Insert: {
          id?: number
          utilisateur_id?: number | null
          nom_client: string
          date_vente?: string
          total: number
        }
        Update: {
          id?: number
          utilisateur_id?: number | null
          nom_client?: string
          date_vente?: string
          total?: number
        }
      }
      lignes_vente: {
        Row: {
          id: number
          vente_id: number
          produit_nom: string
          quantite: number
          prix_unitaire: number
          total_ligne: number
        }
        Insert: {
          id?: number
          vente_id: number
          produit_nom: string
          quantite: number
          prix_unitaire: number
        }
        Update: {
          id?: number
          vente_id?: number
          produit_nom?: string
          quantite?: number
          prix_unitaire?: number
        }
      }
      achats: {
        Row: {
          id: number
          utilisateur_id: number | null
          nom_fournisseur: string
          date_achat: string
          total: number
        }
        Insert: {
          id?: number
          utilisateur_id?: number | null
          nom_fournisseur: string
          date_achat?: string
          total: number
        }
        Update: {
          id?: number
          utilisateur_id?: number | null
          nom_fournisseur?: string
          date_achat?: string
          total?: number
        }
      }
      lignes_achat: {
        Row: {
          id: number
          achat_id: number
          produit_nom: string
          quantite: number
          prix_unitaire: number
          total_ligne: number
        }
        Insert: {
          id?: number
          achat_id: number
          produit_nom: string
          quantite: number
          prix_unitaire: number
        }
        Update: {
          id?: number
          achat_id?: number
          produit_nom?: string
          quantite?: number
          prix_unitaire?: number
        }
      }
      activity_logs: {
        Row: {
          id: number
          utilisateur_id: number | null
          action_type: 'CREATE' | 'UPDATE' | 'DELETE'
          table_name: 'ventes' | 'achats' | 'utilisateurs'
          record_id: number
          old_data: any | null
          new_data: any | null
          details: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: number
          utilisateur_id?: number | null
          action_type: 'CREATE' | 'UPDATE' | 'DELETE'
          table_name: 'ventes' | 'achats' | 'utilisateurs'
          record_id: number
          old_data?: any | null
          new_data?: any | null
          details?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          utilisateur_id?: number | null
          action_type?: 'CREATE' | 'UPDATE' | 'DELETE'
          table_name?: 'ventes' | 'achats' | 'utilisateurs'
          record_id?: number
          old_data?: any | null
          new_data?: any | null
          details?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}