'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Save, X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/use-categories'
import { EnhancedCategoryList } from '@/components/categories/enhanced-category-list'
import { LowStockAlerts } from '@/components/alerts/low-stock-alerts'
import { WoodTypesManagement } from '@/components/wood-types/wood-types-management'

interface CategoryFormData {
  nom: string
  description: string
  couleur: string
}

export default function SettingsPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>({
    nom: '',
    description: '',
    couleur: '#3B82F6'
  })
  const [error, setError] = useState<string | null>(null)
  const [showEnhancedView, setShowEnhancedView] = useState(true)

  const { data: categories = [], isLoading } = useCategories()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  const resetForm = () => {
    setFormData({
      nom: '',
      description: '',
      couleur: '#3B82F6'
    })
    setIsCreating(false)
    setEditingId(null)
    setError(null)
  }

  const handleCreate = async () => {
    setError(null)
    try {
      await createMutation.mutateAsync(formData)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création')
    }
  }

  const handleUpdate = async () => {
    if (!editingId) return
    setError(null)
    try {
      await updateMutation.mutateAsync({ id: editingId, ...formData })
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return
    setError(null)
    try {
      await deleteMutation.mutateAsync(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
    }
  }

  const startEdit = (category: any) => {
    setFormData({
      nom: category.nom,
      description: category.description || '',
      couleur: category.couleur
    })
    setEditingId(category.id)
    setIsCreating(false)
    setError(null)
  }

  const startCreate = () => {
    resetForm()
    setIsCreating(true)
  }

  const predefinedColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#06B6D4', '#EC4899', '#84CC16'
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600 mt-1">Gérez les catégories, types de bois et surveillez les stocks</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowEnhancedView(!showEnhancedView)}
          >
            {showEnhancedView ? 'Vue Simple' : 'Vue Détaillée'}
          </Button>
          <Button onClick={startCreate} disabled={isCreating || editingId !== null}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Catégorie
          </Button>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <LowStockAlerts />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Create/Edit Form */}
      {(isCreating || editingId !== null) && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            {isCreating ? 'Nouvelle Catégorie' : 'Modifier la Catégorie'}
          </h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="nom">Nom de la catégorie *</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                placeholder="Nom de la catégorie"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description de la catégorie"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Couleur</Label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={formData.couleur}
                    onChange={(e) => setFormData(prev => ({ ...prev, couleur: e.target.value }))}
                    className="w-12 h-8 rounded border border-gray-300"
                  />
                  <Input
                    value={formData.couleur}
                    onChange={(e) => setFormData(prev => ({ ...prev, couleur: e.target.value }))}
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                </div>
                <div className="flex space-x-2">
                  {predefinedColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setFormData(prev => ({ ...prev, couleur: color }))}
                      className={`w-8 h-8 rounded border-2 ${
                        formData.couleur === color ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-4">
              <Button
                onClick={isCreating ? handleCreate : handleUpdate}
                disabled={!formData.nom.trim() || createMutation.isPending || updateMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {isCreating ? 'Créer' : 'Mettre à jour'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Catégories existantes</h2>
        </div>
        
        <div className="p-6">
          {showEnhancedView ? (
            <EnhancedCategoryList />
          ) : (
            <>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Chargement des catégories...</p>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Aucune catégorie trouvée</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {categories.map(category => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.couleur }}
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">{category.nom}</h3>
                          {category.description && (
                            <p className="text-sm text-gray-500">{category.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(category)}
                          disabled={isCreating || editingId !== null}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                          disabled={deleteMutation.isPending || isCreating || editingId !== null}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Wood Types Management */}
      <WoodTypesManagement />
    </div>
  )
}