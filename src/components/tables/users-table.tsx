'use client'

import { useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { createUsersColumns } from './users-columns'
import { useUsers, useDeleteUser } from '@/hooks/use-users'
import { User } from '@/types'
import { UserFormModal } from '@/components/forms/user-form-modal'
import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal'
import { AuthUser } from '@/types'

interface UsersTableProps {
  currentUser: AuthUser
}

export function UsersTable({ currentUser }: UsersTableProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  const { data: users = [], isLoading, error, refetch } = useUsers()
  const deleteMutation = useDeleteUser()

  const handleEdit = (user: User) => {
    setEditingUser(user)
  }

  const handleDelete = (user: User) => {
    setDeletingUser(user)
  }

  const confirmDelete = async () => {
    if (deletingUser) {
      try {
        await deleteMutation.mutateAsync(deletingUser.id)
        setDeletingUser(null)
      } catch (error) {
        console.error('Delete error:', error)
      }
    }
  }

  const columns = createUsersColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    currentUserId: currentUser.id,
  })

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur lors du chargement des utilisateurs</p>
          <Button onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  const adminCount = users.filter(user => user.role === 'admin').length
  const employeeCount = users.filter(user => user.role === 'employe').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-gray-600 mt-2">
            Gérez les comptes administrateurs et employés de votre magasin
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Utilisateur
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">{users.length}</div>
          <div className="text-sm text-gray-600">Total Utilisateurs</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{adminCount}</div>
          <div className="text-sm text-gray-600">Administrateurs</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{employeeCount}</div>
          <div className="text-sm text-gray-600">Employés</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-2xl font-bold text-orange-600">
            {users.filter(user => {
              const createdDate = new Date(user.created_at)
              const today = new Date()
              return createdDate.toDateString() === today.toDateString()
            }).length}
          </div>
          <div className="text-sm text-gray-600">Nouveaux Aujourd'hui</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Chargement des utilisateurs...</p>
              </div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={users}
              searchKey="nom"
              searchPlaceholder="Rechercher par nom ou email..."
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <UserFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        mode="create"
      />

      <UserFormModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        mode="edit"
        user={editingUser}
      />

      <DeleteConfirmModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={confirmDelete}
        title="Supprimer l'utilisateur"
        message={`Êtes-vous sûr de vouloir supprimer l'utilisateur ${deletingUser?.prenom} ${deletingUser?.nom} ?`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}