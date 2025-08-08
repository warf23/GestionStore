'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/use-categories'
import { EnhancedCategoryList } from '@/components/categories/enhanced-category-list'
import { LowStockAlerts } from '@/components/alerts/low-stock-alerts'
import { WoodTypesManagement } from '@/components/wood-types/wood-types-management'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'

interface CategoryFormData {
  nom: string
  description: string
  couleur: string
}

export default function SettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>({
    nom: '',
    description: '',
    couleur: '#3B82F6'
  })
  const [error, setError] = useState<string | null>(null)
  const [showEnhancedView, setShowEnhancedView] = useState(true)
  const [activeTab, setActiveTab] = useState<string>('categories')

  const { data: categories = [], isLoading } = useCategories()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  // Initialize tab from URL or localStorage, then keep them in sync
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab')
    const tabFromStorage = typeof window !== 'undefined' ? localStorage.getItem('settings-tab') : null
    const initialTab = (tabFromUrl || tabFromStorage || 'categories') as string
    if (initialTab !== activeTab) {
      setActiveTab(initialTab)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

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
      toast.success('Catégorie créée')
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
      toast.success('Catégorie mise à jour')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour')
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return
    setError(null)
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Catégorie supprimée')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
      toast.error('Erreur lors de la suppression')
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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Paramètres</CardTitle>
              <CardDescription>Gérez les catégories, types de bois et surveillez les stocks</CardDescription>
            </div>
          </CardHeader>
        </Card>

      {/* Removed duplicate top-level alerts; alerts live in the Alerts tab and right sidebar */}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Create/Edit Form */}
      {(isCreating || editingId !== null) && (
        <Sheet open={true} onOpenChange={(open) => { if (!open) resetForm() }}>
          <SheetContent side="right" className="w-full max-w-[42vw] min-w-[360px] p-0">
            <div className="flex h-full flex-col">
              <SheetHeader className="border-b p-6">
                <SheetTitle>{isCreating ? 'Nouvelle Catégorie' : 'Modifier la Catégorie'}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nom">Nom de la catégorie *</Label>
                    <Input id="nom" value={formData.nom} onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))} placeholder="Nom de la catégorie" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Description de la catégorie" className="mt-1" />
                  </div>
                  <div>
                    <Label>Couleur</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="color" value={formData.couleur} onChange={(e) => setFormData(prev => ({ ...prev, couleur: e.target.value }))} className="h-8 w-12 rounded border" />
                        <Input value={formData.couleur} onChange={(e) => setFormData(prev => ({ ...prev, couleur: e.target.value }))} placeholder="#3B82F6" className="flex-1" />
                      </div>
                      <div className="flex space-x-2">
                        {predefinedColors.map(color => (
                          <button key={color} onClick={() => setFormData(prev => ({ ...prev, couleur: color }))} className={`h-8 w-8 rounded border-2 ${formData.couleur === color ? 'border-gray-800' : 'border-gray-300'}`} style={{ backgroundColor: color }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <SheetFooter className="border-t p-6">
                <div className="flex w-full items-center justify-end gap-3">
                  <SheetClose asChild>
                    <Button variant="outline" onClick={resetForm}>Annuler</Button>
                  </SheetClose>
                  <Button onClick={isCreating ? handleCreate : handleUpdate} disabled={!formData.nom.trim() || createMutation.isPending || updateMutation.isPending}>
                    <Save className="mr-2 h-4 w-4" /> {isCreating ? 'Créer' : 'Mettre à jour'}
                  </Button>
                </div>
              </SheetFooter>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Tabs for settings sections with URL/localStorage synced value */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value)
          if (typeof window !== 'undefined') {
            localStorage.setItem('settings-tab', value)
          }
          const params = new URLSearchParams(searchParams.toString())
          params.set('tab', value)
          router.replace(`?${params.toString()}`)
        }}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="categories">Catégories</TabsTrigger>
          <TabsTrigger value="wood">Types de Bois</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Catégories</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setShowEnhancedView(!showEnhancedView)}>
                  {showEnhancedView ? 'Vue Simple' : 'Vue Détaillée'}
                </Button>
                <Button onClick={startCreate} disabled={isCreating || editingId !== null}>
                  <Plus className="h-4 w-4 mr-2" /> Nouvelle Catégorie
                </Button>
              </div>
            </CardHeader>
            <CardContent>
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
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className="h-4 w-4 rounded-full"
                              style={{ backgroundColor: category.couleur }}
                            />
                            <div>
                              <h3 className="font-medium">{category.nom}</h3>
                              {category.description && (
                                <p className="text-sm text-muted-foreground">{category.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => startEdit(category)} disabled={isCreating || editingId !== null}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id)} disabled={deleteMutation.isPending || isCreating || editingId !== null} className="text-red-600 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wood" className="mt-4">
          <WoodTypesManagement />
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertes et Notifications</CardTitle>
              <CardDescription>Configuration des seuils et préférences</CardDescription>
            </CardHeader>
            <CardContent>
              <LowStockAlerts />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>

      {/* Right sidebar: quick tools / create forms (slide-overs via Sheets) */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Alertes de Stock</CardTitle>
            <CardDescription>Produits avec stock bas</CardDescription>
          </CardHeader>
          <CardContent>
            <LowStockAlerts compact={true} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}