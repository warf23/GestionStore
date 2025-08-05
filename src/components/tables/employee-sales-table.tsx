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
import { AuthUser } from '@/types'

interface EmployeeSalesTableProps {
  user: AuthUser
}

export function EmployeeSalesTable({ user }: EmployeeSalesTableProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingSale, setEditingSale] = useState<SaleWithLines | null>(null)
  const [viewingSale, setViewingSale] = useState<SaleWithLines | null>(null)
  const [deletingSale, setDeletingSale] = useState<SaleWithLines | null>(null)

  const { data: allSales = [], isLoading, error, refetch } = useSales()
  const deleteMutation = useDeleteSale()

  // Filter sales to show only this employee's sales
  const mySales = allSales.filter(sale => 
    sale.utilisateur_id === parseInt(user.id)
  )

  const handleEdit = (sale: SaleWithLines) => {
    // Only allow editing own sales
    if (sale.utilisateur_id === parseInt(user.id)) {
      setEditingSale(sale)
    }
  }

  const handleDelete = (sale: SaleWithLines) => {
    // Only allow deleting own sales
    if (sale.utilisateur_id === parseInt(user.id)) {
      setDeletingSale(sale)
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Mes Ventes</h1>
          <p className="text-gray-600 mt-2">
            Gérez vos ventes et consultez vos performances
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Vente
        </Button>
      </div>

      {/* Employee Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Plus className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Espace Vente Employé
            </h3>
            <div className="mt-1 text-sm text-blue-700">
              <p>Vous pouvez créer, modifier et supprimer vos propres ventes. Toutes vos actions sont visibles par l'administrateur.</p>
            </div>
          </div>
        </div>
      </div>

      {/* My Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{mySales.length}</div>
          <div className="text-sm text-gray-600">Mes Ventes</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">
            {mySales.reduce((sum, sale) => sum + parseFloat(sale.total.toString()), 0).toFixed(2)} DH
          </div>
          <div className="text-sm text-gray-600">Mon Chiffre d'Affaires</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">
            {mySales.reduce((sum, sale) => sum + sale.lignes_vente.length, 0)}
          </div>
          <div className="text-sm text-gray-600">Articles que j'ai Vendus</div>
        </div>
        {/* <div className="bg-white p-6 rounded-lg border">
          <div className="text-2xl font-bold text-orange-600">
            {mySales.length > 0 ? (
              mySales.reduce((sum, sale) => sum + parseFloat(sale.total.toString()), 0) / mySales.length
            ).toFixed(2) : '0.00'} DH
          </div>
          <div className="text-sm text-gray-600">Mon Panier Moyen</div>
        </div> */}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Chargement de vos ventes...</p>
              </div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={mySales}
              searchKey="nom_client"
              searchPlaceholder="Rechercher par nom de client..."
            />
          )}
        </div>
      </div>

      {mySales.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <Plus className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune vente</h3>
          <p className="text-gray-600 mb-4">Vous n'avez pas encore créé de vente.</p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Créer ma première vente
          </Button>
        </div>
      )}

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
        title="Supprimer ma vente"
        message={`Êtes-vous sûr de vouloir supprimer votre vente #${deletingSale?.id} de ${deletingSale?.nom_client} ?`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}