'use client'

import { RefreshCw, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { useSales } from '@/hooks/use-sales'
import { SaleWithLines } from '@/types'
import { SaleViewModal } from '@/components/modals/sale-view-modal'
import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export function SalesReadOnlyTable() {
  const [viewingSale, setViewingSale] = useState<SaleWithLines | null>(null)
  const { data: sales = [], isLoading, error, refetch } = useSales({})

  const columns: ColumnDef<SaleWithLines>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-medium">#{row.getValue("id")}</div>
      ),
    },
    {
      accessorKey: "nom_client",
      header: "Client",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("nom_client")}</div>
      ),
    },
    {
      accessorKey: "date_vente",
      header: "Date",
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
      header: "Vendeur",
      cell: ({ row }) => {
        const user = row.getValue("utilisateurs") as any
        return user ? (
          <div className="text-sm">
            <div className="font-medium">{user.prenom} {user.nom}</div>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
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
      header: "Total",
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewingSale(sale)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
        )
      },
    },
  ]

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur lors du chargement des ventes</p>
          <Button onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consultation des Ventes</h1>
          <p className="text-gray-600 mt-2">
            Consultez l'historique des ventes du magasin
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Eye className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Mode Consultation
            </h3>
            <div className="mt-1 text-sm text-blue-700">
              <p>Vous consultez les ventes en lecture seule. Seuls les administrateurs peuvent modifier les données.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{sales.length}</div>
          <div className="text-sm text-gray-600">Total Ventes</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">
            {sales.reduce((sum, sale) => sum + parseFloat(sale.total.toString()), 0).toFixed(2)} DH
          </div>
          <div className="text-sm text-gray-600">Chiffre d'Affaires</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">
            {sales.reduce((sum, sale) => sum + sale.lignes_vente.length, 0)}
          </div>
          <div className="text-sm text-gray-600">Articles Vendus</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Chargement des ventes...</p>
              </div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={sales}
              searchKey="nom_client"
              searchPlaceholder="Rechercher par nom de client..."
            />
          )}
        </div>
      </div>

      {/* View Modal */}
      <SaleViewModal
        isOpen={!!viewingSale}
        onClose={() => setViewingSale(null)}
        sale={viewingSale}
      />
    </div>
  )
}