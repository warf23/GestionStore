'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Save, X, TreePine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useWoodTypes, useCreateWoodType, useUpdateWoodType, useDeleteWoodType } from '@/hooks/use-wood-types'
import { WoodType } from '@/types'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet'
import { toast } from 'sonner'

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
      toast.success('Type de bois créé')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création')
      toast.error('Erreur lors de la création')
    }
  }

  const handleUpdate = async () => {
    if (!editingId) return
    setError(null)
    try {
      await updateMutation.mutateAsync({ id: editingId, ...formData })
      resetForm()
      toast.success('Type de bois mis à jour')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour')
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce type de bois ?')) return
    setError(null)
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Type de bois supprimé')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
      toast.error('Erreur lors de la suppression')
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
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Create/Edit Form */}
      {(isCreating || editingId !== null) && (
        <Sheet open={true} onOpenChange={(open) => { if (!open) resetForm() }}>
          <SheetContent side="right" className="w-full max-w-[42vw] min-w-[360px] p-0">
            <div className="flex h-full flex-col">
              <SheetHeader className="border-b p-6">
                <SheetTitle>{isCreating ? 'Nouveau Type de Bois' : 'Modifier le Type de Bois'}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto p-6">
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
                        className="h-10 w-16 p-1"
                        disabled={createMutation.isPending || updateMutation.isPending}
                      />
                      <div className="flex space-x-1">
                        {predefinedColors.map((color) => (
                          <button key={color} type="button" className="h-6 w-6 rounded border" style={{ backgroundColor: color }} onClick={() => setFormData({ ...formData, couleur: color })} disabled={createMutation.isPending || updateMutation.isPending} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description du type de bois..." disabled={createMutation.isPending || updateMutation.isPending} />
                  </div>
                </div>
              </div>
              <SheetFooter className="border-t p-6">
                <div className="flex w-full items-center justify-end gap-3">
                  <SheetClose asChild>
                    <Button variant="outline" disabled={createMutation.isPending || updateMutation.isPending} onClick={resetForm}>Annuler</Button>
                  </SheetClose>
                  <Button onClick={isCreating ? handleCreate : handleUpdate} disabled={!formData.nom || createMutation.isPending || updateMutation.isPending}>
                    <Save className="mr-2 h-4 w-4" /> {isCreating ? 'Créer' : 'Mettre à jour'}
                  </Button>
                </div>
              </SheetFooter>
            </div>
          </SheetContent>
        </Sheet>
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