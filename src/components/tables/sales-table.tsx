'use client'

import { useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { createSalesColumns } from './sales-columns'
import { useSales, useDeleteSale } from '@/hooks/use-sales'
import { SaleWithLines } from '@/types'
import { SaleFormModal } from '@/components/forms/sale-form-modal'
import { SaleViewModal } from '@/components/modals/sale-view-modal'
import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal'

export function SalesTable() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingSale, setEditingSale] = useState<SaleWithLines | null>(null)
  const [viewingSale, setViewingSale] = useState<SaleWithLines | null>(null)
  const [deletingSale, setDeletingSale] = useState<SaleWithLines | null>(null)

  const { data: sales = [], isLoading, error, refetch } = useSales()
  const deleteMutation = useDeleteSale()

  const handleEdit = (sale: SaleWithLines) => {
    setEditingSale(sale)
  }

  const handleDelete = (sale: SaleWithLines) => {
    setDeletingSale(sale)
  }

  const handleView = (sale: SaleWithLines) => {
    setViewingSale(sale)
  }

  const confirmDelete = async () => {
    if (deletingSale) {
      try {
        await deleteMutation.mutateAsync(deletingSale.id)
        setDeletingSale(null)
      } catch (error) {
        console.error('Delete error:', error)
      }
    }
  }

  const columns = createSalesColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onView: handleView,
  })

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
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Ventes</h1>
          <p className="text-gray-600 mt-2">
            Gérez toutes les ventes et transactions de votre magasin
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Vente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{sales.length}</div>
          <div className="text-sm text-gray-600">Total Ventes</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            {sales.reduce((sum, sale) => sum + parseFloat(sale.total.toString()), 0).toFixed(2)} DH
          </div>
          <div className="text-sm text-gray-600">Chiffre d'Affaires</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">
            {sales.reduce((sum, sale) => sum + sale.lignes_vente.length, 0)}
          </div>
          <div className="text-sm text-gray-600">Articles Vendus</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-2xl font-bold text-orange-600">
            {sales.length > 0 ? (
              sales.reduce((sum, sale) => sum + parseFloat(sale.total.toString()), 0) / sales.length
            ).toFixed(2) : '0.00'} DH
          </div>
          <div className="text-sm text-gray-600">Panier Moyen</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-2xl font-bold text-indigo-600">
            {new Set(sales.map(sale => sale.utilisateur_id).filter(Boolean)).size}
          </div>
          <div className="text-sm text-gray-600">Vendeurs Actifs</div>
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

      {/* Modals */}
      <SaleFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        mode="create"
      />

      <SaleFormModal
        isOpen={!!editingSale}
        onClose={() => setEditingSale(null)}
        mode="edit"
        sale={editingSale}
      />

      <SaleViewModal
        isOpen={!!viewingSale}
        onClose={() => setViewingSale(null)}
        sale={viewingSale}
      />

      <DeleteConfirmModal
        isOpen={!!deletingSale}
        onClose={() => setDeletingSale(null)}
        onConfirm={confirmDelete}
        title="Supprimer la vente"
        message={`Êtes-vous sûr de vouloir supprimer la vente #${deletingSale?.id} de ${deletingSale?.nom_client} ?`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}