'use client'

import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { MoreHorizontal, Edit, Trash2, Eye, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SaleWithLines } from '@/types'

interface SalesColumnsProps {
  onEdit: (sale: SaleWithLines) => void
  onDelete: (sale: SaleWithLines) => void
  onView: (sale: SaleWithLines) => void
}

export const createSalesColumns = ({ 
  onEdit, 
  onDelete, 
  onView 
}: SalesColumnsProps): ColumnDef<SaleWithLines>[] => [
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
    accessorKey: "nom_client",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Client
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("nom_client")}</div>
    ),
  },
  {
    accessorKey: "date_vente",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("date_vente"))
      return (
        <div className="text-sm">
          {format(date, "dd/MM/yyyy 'à' HH:mm", { locale: fr })}
        </div>
      )
    },
  },
  {
    accessorKey: "utilisateurs",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Vendeur
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const user = row.getValue("utilisateurs") as any
      return user ? (
        <div className="text-sm">
          <div className="font-medium flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs mr-2">
              {user.prenom[0]}{user.nom[0]}
            </div>
            <div>
              <div className="font-medium">{user.prenom} {user.nom}</div>
              <div className="text-muted-foreground text-xs">{user.email}</div>
            </div>
          </div>
        </div>
      ) : (
        <span className="text-muted-foreground">Système</span>
      )
    },
  },
  {
    accessorKey: "lignes_vente",
    header: "Produits",
    cell: ({ row }) => {
      const lines = row.getValue("lignes_vente") as any[]
      return (
        <div className="space-y-1">
          {lines.slice(0, 2).map((line, index) => (
            <div key={index} className="text-sm">
              <span className="font-medium">{line.produit_nom}</span>
              <span className="text-muted-foreground ml-2">
                x{line.quantite}
              </span>
            </div>
          ))}
          {lines.length > 2 && (
            <div className="text-xs text-muted-foreground">
              +{lines.length - 2} autre(s)
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "total",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Total
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const total = parseFloat(row.getValue("total"))
      return (
        <div className="font-medium text-green-600">
          {total.toFixed(2)} DH
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const sale = row.original

      return (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(sale)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(sale)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(sale)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]