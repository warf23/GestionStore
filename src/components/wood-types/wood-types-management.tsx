'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Save, X, TreePine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useWoodTypes, useCreateWoodType, useUpdateWoodType, useDeleteWoodType } from '@/hooks/use-wood-types'
import { WoodType } from '@/types'

interface WoodTypeFormData {
  nom: string
  description: string
  couleur: string
}

export function WoodTypesManagement() {
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<WoodTypeFormData>({
    nom: '',
    description: '',
    couleur: '#8B4513'
  })
  const [error, setError] = useState<string | null>(null)

  const { data: woodTypes = [], isLoading } = useWoodTypes()
  const createMutation = useCreateWoodType()
  const updateMutation = useUpdateWoodType()
  const deleteMutation = useDeleteWoodType()

  const resetForm = () => {
    setFormData({
      nom: '',
      description: '',
      couleur: '#8B4513'
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
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce type de bois ?')) return
    setError(null)
    try {
      await deleteMutation.mutateAsync(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
    }
  }

  const startEdit = (woodType: WoodType) => {
    setFormData({
      nom: woodType.nom,
      description: woodType.description || '',
      couleur: woodType.couleur
    })
    setEditingId(woodType.id)
    setIsCreating(false)
  }

  const startCreate = () => {
    resetForm()
    setIsCreating(true)
  }

  const predefinedColors = [
    '#8B4513', '#DEB887', '#D2691E', '#F5DEB3',
    '#CD853F', '#F4A460', '#A0522D', '#8FBC8F'
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <TreePine className="h-6 w-6 text-green-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Types de Bois</h2>
            <p className="text-sm text-gray-600">Gérez les différents types de bois pour vos achats</p>
          </div>
        </div>
        <Button onClick={startCreate} disabled={isCreating || editingId !== null}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Type
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Create/Edit Form */}
      {(isCreating || editingId !== null) && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-4">
            {isCreating ? 'Nouveau Type de Bois' : 'Modifier le Type de Bois'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nom">Nom *</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Ex: Chêne, Pin, Hêtre..."
                disabled={createMutation.isPending || updateMutation.isPending}
              />
            </div>

            <div>
              <Label htmlFor="couleur">Couleur</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="couleur"
                  type="color"
                  value={formData.couleur}
                  onChange={(e) => setFormData({ ...formData, couleur: e.target.value })}
                  className="w-16 h-10 p-1"
                  disabled={createMutation.isPending || updateMutation.isPending}
                />
                <div className="flex space-x-1">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, couleur: color })}
                      disabled={createMutation.isPending || updateMutation.isPending}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du type de bois..."
                disabled={createMutation.isPending || updateMutation.isPending}
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={resetForm}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button
              onClick={isCreating ? handleCreate : handleUpdate}
              disabled={!formData.nom || createMutation.isPending || updateMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {isCreating ? 'Créer' : 'Mettre à jour'}
            </Button>
          </div>
        </div>
      )}

      {/* Wood Types List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des types de bois...</p>
          </div>
        ) : woodTypes.length === 0 ? (
          <div className="p-8 text-center">
            <TreePine className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Aucun type de bois configuré</p>
            <p className="text-sm text-gray-500">Commencez par ajouter votre premier type de bois</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {woodTypes.map((woodType) => (
              <div key={woodType.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-8 h-8 rounded-full border border-gray-300 flex-shrink-0"
                      style={{ backgroundColor: woodType.couleur }}
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{woodType.nom}</h3>
                      {woodType.description && (
                        <p className="text-sm text-gray-600">{woodType.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(woodType)}
                      disabled={isCreating || editingId !== null}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(woodType.id)}
                      disabled={deleteMutation.isPending || isCreating || editingId !== null}
                      className="hover:bg-red-50 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}