import { Database } from './database.types'

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Application types
export type User = Tables<'utilisateurs'>
export type Category = Tables<'categories'>
export type WoodType = Tables<'wood_types'>
export type Sale = Tables<'ventes'>
export type SaleLine = Tables<'lignes_vente'>
export type Purchase = Tables<'achats'>
export type PurchaseLine = Tables<'lignes_achat'>
export type ActivityLog = Tables<'activity_logs'>

export type CreateUser = InsertTables<'utilisateurs'>
export type CreateCategory = InsertTables<'categories'>
export type CreateWoodType = InsertTables<'wood_types'>
export type CreateSale = InsertTables<'ventes'>
export type CreateSaleLine = InsertTables<'lignes_vente'>
export type CreatePurchase = InsertTables<'achats'>
export type CreatePurchaseLine = InsertTables<'lignes_achat'>
export type CreateActivityLog = InsertTables<'activity_logs'>

export type UserRole = 'admin' | 'employe'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  nom: string
  prenom: string
}

export interface LoginFormData {
  email: string
  password: string
}

export interface SaleWithLines extends Sale {
  lignes_vente: SaleLine[]
  utilisateurs?: User
}

export interface PurchaseWithLines extends Purchase {
  lignes_achat: PurchaseLine[]
  utilisateurs?: User
}