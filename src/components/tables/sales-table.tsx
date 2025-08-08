'use client'

import { useState } from 'react'
import { Plus, RefreshCw, ShoppingCart, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { createSalesColumns } from './sales-columns'
import { useSales, useDeleteSale, SalesFilters } from '@/hooks/use-sales'
import { SaleWithLines } from '@/types'
import { SaleFormModal } from '@/components/forms/sale-form-modal'
import { SaleViewModal } from '@/components/modals/sale-view-modal'
import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { useCategories } from '@/hooks/use-categories'
import { exportSalesReportPDF } from '@/lib/report-export'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function SalesTable() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingSale, setEditingSale] = useState<SaleWithLines | null>(null)
  const [viewingSale, setViewingSale] = useState<SaleWithLines | null>(null)
  const [deletingSale, setDeletingSale] = useState<SaleWithLines | null>(null)

  const [filters, setFilters] = useState<SalesFilters>({})
  const { data: sales = [], isLoading, error, refetch, isFetching } = useSales(filters) as any
  const { data: categories = [] } = useCategories()
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-2xl">Gestion des Ventes</CardTitle>
              <CardDescription>Gérez les ventes, filtrez et exportez vos données</CardDescription>
            </div>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nouvelle Vente
          </Button>
        </CardHeader>
      </Card>

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
              {sales.reduce((sum: number, sale: SaleWithLines) => sum + parseFloat(String(sale.total)), 0).toFixed(2)} DH
            </div>
            <div className="text-sm text-gray-600 font-medium">Chiffre d'Affaires</div>
          </div>
        </div>
        
        <div className="group relative overflow-hidden rounded-xl bg-white/60 backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-violet-50/30"></div>
          <div className="relative p-6">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {sales.reduce((sum: number, sale: SaleWithLines) => sum + sale.lignes_vente.length, 0)}
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
              {new Set(sales.map((sale: SaleWithLines) => sale.utilisateur_id).filter(Boolean)).size}
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
                <div className="flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-sm text-muted-foreground">
                  {isFetching && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  {sales.length} vente{sales.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
                  <DateRangePicker
                    from={filters.from}
                    to={filters.to}
                    onChange={(r) => setFilters((f) => ({ ...f, ...r }))}
                  />
                <Select
                  value={filters.categoryId ? String(filters.categoryId) : 'all'}
                  onValueChange={(value) =>
                    setFilters((f) => ({
                      ...f,
                      categoryId: value === 'all' ? undefined : Number(value),
                    }))
                  }
                >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Toutes catégories" />
                    </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes catégories</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.nom}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Rechercher produit ou client..."
                    value={filters.q || ''}
                    onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                    className="h-10 w-full"
                  />
                  <Button
                    variant="destructive"
                    className="h-10 w-full"
                    onClick={() => exportSalesReportPDF({
                      sales,
                      periodLabel: filters.from || filters.to ? `Période: ${(filters.from||'...')} → ${(filters.to||'...')}` : undefined,
                      filtersLabel: filters.categoryId || filters.q ? `Filtre: ${filters.categoryId ? 'Catégorie' : ''} ${filters.q ? ' / Mot-clé' : ''}` : undefined,
                    })}
                  >
                    <Download className="mr-2 h-4 w-4" /> Export PDF
                  </Button>
                </div>

                <DataTable
                columns={columns}
                data={sales}
                />
              </div>
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