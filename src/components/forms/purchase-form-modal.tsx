'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { X, Plus, Trash2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreatePurchase, useUpdatePurchase } from '@/hooks/use-purchases'
import { useCategories } from '@/hooks/use-categories'
import { useWoodTypes } from '@/hooks/use-wood-types'
import { PurchaseWithLines } from '@/types'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet'

const purchaseSchema = z.object({
  nom_fournisseur: z.string().min(1, 'Le nom du fournisseur est requis'),
  lignes: z.array(z.object({
    produit_nom: z.string().min(1, 'Le nom du produit est requis'),
    category_id: z.number().min(1, 'La catégorie est requise'),
    wood_type_id: z.number().nullable().optional(),
    quantite: z.number().min(1, 'La quantité doit être au moins 1'),
    prix_unitaire: z.number().min(0, 'Le prix doit être positif'),
  })).min(1, 'Au moins une ligne d\'achat est requise'),
})

type PurchaseFormData = z.infer<typeof purchaseSchema>

interface PurchaseFormModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  purchase?: PurchaseWithLines | null
}

export function PurchaseFormModal({ isOpen, onClose, mode, purchase }: PurchaseFormModalProps) {
  const [error, setError] = useState<string | null>(null)
  
  const queryClient = useQueryClient()
  const createMutation = useCreatePurchase()
  const updateMutation = useUpdatePurchase()
  const { data: categories = [] } = useCategories()
  const { data: woodTypes = [] } = useWoodTypes()

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      nom_fournisseur: '',
      lignes: [{ produit_nom: '', category_id: 0, wood_type_id: null, quantite: 1, prix_unitaire: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lignes',
  })

  const watchedLines = watch('lignes')

  // Calculate total
  const total = watchedLines.reduce((sum, line) => {
    return sum + (line.quantite || 0) * (line.prix_unitaire || 0)
  }, 0)

  // Reset form when modal opens/closes or purchase changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && purchase) {
        reset({
          nom_fournisseur: purchase.nom_fournisseur,
          lignes: purchase.lignes_achat.map(line => ({
            produit_nom: line.produit_nom,
            category_id: line.category_id || (categories.length > 0 ? categories[0].id : 0),
            wood_type_id: line.wood_type_id || null,
            quantite: line.quantite,
            prix_unitaire: parseFloat(line.prix_unitaire.toString()),
          })),
        })
      } else {
        reset({
          nom_fournisseur: '',
          lignes: [{ produit_nom: '', category_id: categories.length > 0 ? categories[0].id : 0, wood_type_id: null, quantite: 1, prix_unitaire: 0 }],
        })
      }
      setError(null)
    }
  }, [isOpen, mode, purchase, reset])

  const onSubmit = async (data: PurchaseFormData) => {
    setError(null)
    
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(data)
      } else if (mode === 'edit' && purchase) {
        await updateMutation.mutateAsync({ id: purchase.id, ...data })
      }
      onClose()
      // Force refresh of product suggestions immediately
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['product-suggestions'] })
        queryClient.invalidateQueries({ queryKey: ['product-stock'] })
      }, 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    }
  }

  const addLine = () => {
    append({ produit_nom: '', category_id: categories.length > 0 ? categories[0].id : 0, wood_type_id: null, quantite: 1, prix_unitaire: 0 })
  }

  const removeLine = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent side="right" className="w-full max-w-[52vw] min-w-[420px] p-0">
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b p-6">
            <SheetTitle>{mode === 'create' ? 'Nouvel Achat' : "Modifier l'Achat"}</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Supplier Name */}
            <div>
              <Label htmlFor="nom_fournisseur">Nom du Fournisseur *</Label>
              <Input
                id="nom_fournisseur"
                {...register('nom_fournisseur')}
                className={errors.nom_fournisseur ? 'border-red-500' : ''}
                placeholder="Nom du fournisseur"
              />
              {errors.nom_fournisseur && (
                <p className="text-sm text-red-600 mt-1">{errors.nom_fournisseur.message}</p>
              )}
            </div>

            {/* Purchase Lines */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label>Produits *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLine}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un produit
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-3 items-end p-4 border rounded-lg">
                    <div className="col-span-3">
                      <Label htmlFor={`lignes.${index}.produit_nom`}>Produit</Label>
                      <Input
                        {...register(`lignes.${index}.produit_nom`)}
                        placeholder="Nom du produit"
                        className={errors.lignes?.[index]?.produit_nom ? 'border-red-500' : ''}
                      />
                      {errors.lignes?.[index]?.produit_nom && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.lignes[index]?.produit_nom?.message}
                        </p>
                      )}
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor={`lignes.${index}.category_id`}>Catégorie</Label>
                      <select
                        {...register(`lignes.${index}.category_id`, { valueAsNumber: true })}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.lignes?.[index]?.category_id ? 'border-red-500' : ''
                        }`}
                      >
                        <option value="">Sélectionner...</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.nom}
                          </option>
                        ))}
                      </select>
                      {errors.lignes?.[index]?.category_id && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.lignes[index]?.category_id?.message}
                        </p>
                      )}
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor={`lignes.${index}.wood_type_id`}>Type de Bois</Label>
                      <select
                        {...register(`lignes.${index}.wood_type_id`, { 
                          valueAsNumber: true,
                          setValueAs: (value) => value === "" ? null : Number(value)
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Aucun</option>
                        {woodTypes.map(woodType => (
                          <option key={woodType.id} value={woodType.id}>
                            {woodType.nom}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-1">
                      <Label htmlFor={`lignes.${index}.quantite`}>Qté</Label>
                      <Input
                        type="number"
                        min="1"
                        {...register(`lignes.${index}.quantite`, { valueAsNumber: true })}
                        className={errors.lignes?.[index]?.quantite ? 'border-red-500' : ''}
                      />
                      {errors.lignes?.[index]?.quantite && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.lignes[index]?.quantite?.message}
                        </p>
                      )}
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor={`lignes.${index}.prix_unitaire`}>Prix (DH)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register(`lignes.${index}.prix_unitaire`, { valueAsNumber: true })}
                        className={errors.lignes?.[index]?.prix_unitaire ? 'border-red-500' : ''}
                      />
                      {errors.lignes?.[index]?.prix_unitaire && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.lignes[index]?.prix_unitaire?.message}
                        </p>
                      )}
                    </div>

                    <div className="col-span-1">
                      <Label>Total</Label>
                      <div className="text-sm font-medium text-blue-600 mt-2">
                        {((watchedLines[index]?.quantite || 0) * (watchedLines[index]?.prix_unitaire || 0)).toFixed(2)} DH
                      </div>
                    </div>

                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLine(index)}
                        disabled={fields.length === 1}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {errors.lignes && (
                <p className="text-sm text-red-600 mt-2">{errors.lignes.message}</p>
              )}
            </div>

            {/* Total */}
            <div className="rounded-lg border bg-muted p-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {total.toFixed(2)} DH
                </span>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            </form>
          </div>

          <SheetFooter className="border-t p-6">
            <div className="flex w-full items-center justify-end gap-3">
              <SheetClose asChild>
                <Button variant="outline" disabled={isLoading}>Annuler</Button>
              </SheetClose>
              <Button onClick={handleSubmit(onSubmit)} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                    {mode === 'create' ? 'Création...' : 'Modification...'}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {mode === 'create' ? "Créer l'Achat" : "Modifier l'Achat"}
                  </>
                )}
              </Button>
            </div>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}