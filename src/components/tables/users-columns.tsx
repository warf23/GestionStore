'use client'

import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Edit, Trash2, ArrowUpDown, Shield, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User as UserType } from '@/types'

interface UsersColumnsProps {
  onEdit: (user: UserType) => void
  onDelete: (user: UserType) => void
  currentUserId: string
}

export const createUsersColumns = ({ 
  onEdit, 
  onDelete,
  currentUserId
}: UsersColumnsProps): ColumnDef<UserType>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium">#{row.getValue("id")}</div>
    ),
  },
  {
    accessorKey: "nom",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Nom Complet
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="space-y-1">
          <div className="font-medium">{user.prenom} {user.nom}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Rôle
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const role = row.getValue("role") as string
      const isCurrentUser = row.original.id.toString() === currentUserId
      
      return (
        <div className="flex items-center space-x-2">
          <Badge 
            variant={role === 'admin' ? 'default' : 'secondary'}
            className={role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}
          >
            {role === 'admin' ? (
              <Shield className="h-3 w-3 mr-1" />
            ) : (
              <User className="h-3 w-3 mr-1" />
            )}
            {role === 'admin' ? 'Administrateur' : 'Employé'}
          </Badge>
          {isCurrentUser && (
            <Badge variant="outline" className="text-xs">
              Vous
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Date de création
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))
      return (
        <div className="text-sm">
          {format(date, "dd/MM/yyyy", { locale: fr })}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original
      const isCurrentUser = user.id.toString() === currentUserId

      return (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(user)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(user)}
            disabled={isCurrentUser}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title={isCurrentUser ? "Vous ne pouvez pas supprimer votre propre compte" : "Supprimer l'utilisateur"}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]