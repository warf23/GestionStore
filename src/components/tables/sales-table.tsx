'use client'

import { useState } from 'react'
import { Plus, RefreshCw, ShoppingCart } from 'lucide-react'
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
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-white/40 backdrop-blur-xl border border-white/30 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-emerald-50/30 to-teal-50/30"></div>
        
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-green-800 to-emerald-800 bg-clip-text text-transparent">
                  Gestion des Ventes
                </h1>
              </div>
              <p className="text-lg text-gray-700 font-medium">
                Gérez toutes les ventes et transactions de votre magasin
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Suivez vos performances et analysez vos résultats en temps réel
              </p>
            </div>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Vente
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="group relative overflow-hidden rounded-xl bg-white/60 backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-sky-50/30"></div>
          <div className="relative p-6">
            <div className="text-2xl font-bold text-blue-600 mb-2">{sales.length}</div>
            <div className="text-sm text-gray-600 font-medium">Total Ventes</div>
          </div>
        </div>
        
        <div className="group relative overflow-hidden rounded-xl bg-white/60 backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-emerald-50/30"></div>
          <div className="relative p-6">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {sales.reduce((sum, sale) => sum + parseFloat(sale.total.toString()), 0).toFixed(2)} DH
            </div>
            <div className="text-sm text-gray-600 font-medium">Chiffre d'Affaires</div>
          </div>
        </div>
        
        <div className="group relative overflow-hidden rounded-xl bg-white/60 backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-violet-50/30"></div>
          <div className="relative p-6">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {sales.reduce((sum, sale) => sum + sale.lignes_vente.length, 0)}
            </div>
            <div className="text-sm text-gray-600 font-medium">Articles Vendus</div>
          </div>
        </div>
        
        {/* <div className="group relative overflow-hidden rounded-xl bg-white/60 backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 to-amber-50/30"></div>
          <div className="relative p-6">
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {sales.length > 0 ? (
                sales.reduce((sum, sale) => sum + parseFloat(sale.total.toString()), 0) / sales.length
              ).toFixed(2) : '0.00'} DH
            </div>
            <div className="text-sm text-gray-600 font-medium">Panier Moyen</div>
          </div>
        </div> */}
        
        <div className="group relative overflow-hidden rounded-xl bg-white/60 backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-blue-50/30"></div>
          <div className="relative p-6">
            <div className="text-2xl font-bold text-indigo-600 mb-2">
              {new Set(sales.map(sale => sale.utilisateur_id).filter(Boolean)).size}
            </div>
            <div className="text-sm text-gray-600 font-medium">Vendeurs Actifs</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-xl border border-white/20 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-gray-50/30"></div>
        
        <div className="relative p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <RefreshCw className="h-8 w-8 animate-spin text-white" />
                </div>
                <p className="text-gray-700 font-medium text-lg">Chargement des ventes...</p>
                <p className="text-gray-500 text-sm mt-1">Veuillez patienter</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Liste des Ventes
                </h3>
                <div className="text-sm text-gray-500 bg-white/50 rounded-full px-3 py-1">
                  {sales.length} vente{sales.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              <DataTable
                columns={columns}
                data={sales}
                searchKey="nom_client"
                searchPlaceholder="Rechercher par nom de client..."
              />
            </div>
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