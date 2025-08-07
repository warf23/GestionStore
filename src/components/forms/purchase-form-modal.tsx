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

  if (!isOpen) return null

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {mode === 'create' ? 'Nouvel Achat' : 'Modifier l\'Achat'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
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
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {total.toFixed(2)} DH
                </span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit(onSubmit)} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {mode === 'create' ? 'Création...' : 'Modification...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {mode === 'create' ? 'Créer l\'Achat' : 'Modifier l\'Achat'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}