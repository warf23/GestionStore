'use client'

import { useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { createPurchasesColumns } from './purchases-columns'
import { usePurchases, useDeletePurchase, PurchasesFilters } from '@/hooks/use-purchases'
import { PurchaseWithLines } from '@/types'
import { PurchaseFormModal } from '@/components/forms/purchase-form-modal'
import { PurchaseViewModal } from '@/components/modals/purchase-view-modal'
import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { useCategories } from '@/hooks/use-categories'
import { useWoodTypes } from '@/hooks/use-wood-types'
import { exportPurchasesReportPDF } from '@/lib/report-export'

export function PurchasesTable() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingPurchase, setEditingPurchase] = useState<PurchaseWithLines | null>(null)
  const [viewingPurchase, setViewingPurchase] = useState<PurchaseWithLines | null>(null)
  const [deletingPurchase, setDeletingPurchase] = useState<PurchaseWithLines | null>(null)

  const [filters, setFilters] = useState<PurchasesFilters>({})
  const { data: purchases = [], isLoading, error, refetch } = usePurchases(filters)
  const { data: categories = [] } = useCategories()
  const { data: woodTypes = [] } = useWoodTypes()
  const deleteMutation = useDeletePurchase()

  const handleEdit = (purchase: PurchaseWithLines) => {
    setEditingPurchase(purchase)
  }

  const handleDelete = (purchase: PurchaseWithLines) => {
    setDeletingPurchase(purchase)
  }

  const handleView = (purchase: PurchaseWithLines) => {
    setViewingPurchase(purchase)
  }

  const confirmDelete = async () => {
    if (deletingPurchase) {
      try {
        await deleteMutation.mutateAsync(deletingPurchase.id)
        setDeletingPurchase(null)
      } catch (error) {
        console.error('Delete error:', error)
      }
    }
  }

  const columns = createPurchasesColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onView: handleView,
  })

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur lors du chargement des achats</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Achats</h1>
          <p className="text-gray-600 mt-2">
            Gérez tous les achats et approvisionnements de votre magasin
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Achat
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{purchases.length}</div>
          <div className="text-sm text-gray-600">Total Achats</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-2xl font-bold text-red-600">
            {purchases.reduce((sum, purchase) => sum + parseFloat(purchase.total.toString()), 0).toFixed(2)} DH
          </div>
          <div className="text-sm text-gray-600">Coût Total</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">
            {purchases.reduce((sum, purchase) => sum + purchase.lignes_achat.length, 0)}
          </div>
          <div className="text-sm text-gray-600">Articles Achetés</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-2xl font-bold text-orange-600">
            {purchases.length > 0 ? (
              purchases.reduce((sum, purchase) => sum + parseFloat(purchase.total.toString()), 0) / purchases.length
            ).toFixed(2) : '0.00'} DH
          </div>
          <div className="text-sm text-gray-600">Coût Moyen</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Chargement des achats...</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <DateRangePicker
                  from={filters.from}
                  to={filters.to}
                  onChange={(r) => setFilters((f) => ({ ...f, ...r }))}
                />
                <select
                  value={filters.categoryId ?? ''}
                  onChange={(e) => setFilters((f) => ({ ...f, categoryId: e.target.value ? Number(e.target.value) : undefined }))}
                  className="h-10 rounded-md border px-3 text-sm"
                >
                  <option value="">Toutes catégories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </select>
                <select
                  value={filters.woodTypeId ?? ''}
                  onChange={(e) => setFilters((f) => ({ ...f, woodTypeId: e.target.value ? Number(e.target.value) : undefined }))}
                  className="h-10 rounded-md border px-3 text-sm"
                >
                  <option value="">Tous types de bois</option>
                  {woodTypes.map((w) => (
                    <option key={w.id} value={w.id}>{w.nom}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Produit ou fournisseur..."
                  value={filters.q || ''}
                  onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                  className="h-10 rounded-md border px-3 text-sm min-w-[220px]"
                />
                <Button
                  variant="outline"
                  onClick={() => exportPurchasesReportPDF({
                    purchases,
                    periodLabel: filters.from || filters.to ? `Période: ${(filters.from||'...')} → ${(filters.to||'...')}` : undefined,
                    filtersLabel: filters.categoryId || filters.woodTypeId || filters.q ? 'Filtre actif' : undefined,
                  })}
                >
                  Export PDF
                </Button>
              </div>

              <DataTable
                columns={columns}
                data={purchases}
                searchKey="nom_fournisseur"
                searchPlaceholder="Rechercher par nom de fournisseur..."
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <PurchaseFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        mode="create"
      />

      <PurchaseFormModal
        isOpen={!!editingPurchase}
        onClose={() => setEditingPurchase(null)}
        mode="edit"
        purchase={editingPurchase}
      />

      <PurchaseViewModal
        isOpen={!!viewingPurchase}
        onClose={() => setViewingPurchase(null)}
        purchase={viewingPurchase}
      />

      <DeleteConfirmModal
        isOpen={!!deletingPurchase}
        onClose={() => setDeletingPurchase(null)}
        onConfirm={confirmDelete}
        title="Supprimer l'achat"
        message={`Êtes-vous sûr de vouloir supprimer l'achat #${deletingPurchase?.id} de ${deletingPurchase?.nom_fournisseur} ?`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}