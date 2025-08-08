'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { X, Plus, Trash2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ProductAutocomplete, ProductAutocompleteOption } from '@/components/ui/product-autocomplete'
import { useCreateSale, useUpdateSale } from '@/hooks/use-sales'
import { useProductSuggestions } from '@/hooks/use-product-suggestions'
import { useProductStock } from '@/hooks/use-product-stock'
import { SaleWithLines } from '@/types'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet'

const saleSchema = z.object({
  nom_client: z.string().min(1, 'Le nom du client est requis'),
  lignes: z.array(z.object({
    produit_nom: z.string().min(1, 'Le nom du produit est requis'),
    quantite: z.number().min(1, 'La quantité doit être au moins 1'),
    prix_unitaire: z.number().min(0, 'Le prix doit être positif'),
  })).min(1, 'Au moins une ligne de vente est requise'),
})

type SaleFormData = z.infer<typeof saleSchema>

interface SaleFormModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  sale?: SaleWithLines | null
}

// Memoized component for individual product lines
const ProductLine = memo(({ field, index, register, errors, productOptions, handleProductSelect, removeLine, fieldsLength, getValues, watch, setValue }: {
  field: any
  index: number
  register: any
  errors: any
  productOptions: ProductAutocompleteOption[]
  handleProductSelect: (index: number, option: ProductAutocompleteOption) => void
  removeLine: (index: number) => void
  fieldsLength: number
  getValues: any
  watch: any
  setValue: any
}) => {
  const currentValues = getValues()
  const currentLine = currentValues.lignes?.[index] || {}
  const subtotal = (currentLine.quantite || 0) * (currentLine.prix_unitaire || 0)
  
  // Watch for product name changes to get current stock
  const selectedProductName = watch(`lignes.${index}.produit_nom`)
  const selectedQuantity = watch(`lignes.${index}.quantite`)
  
  // Find the selected product in options to get available stock
  const selectedProduct = productOptions.find(p => 
    p.value.toLowerCase() === selectedProductName?.toLowerCase()
  )
  const maxQuantity = selectedProduct?.quantite_disponible || 0
  
  // Dynamic validation for quantity input
  const quantityError = selectedQuantity > maxQuantity && selectedProductName
    ? `Stock disponible: ${maxQuantity}`
    : errors.lignes?.[index]?.quantite?.message
  
  return (
    <div key={field.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-end p-4 border rounded-lg bg-card">
      <div className="sm:col-span-6">
        <Label htmlFor={`lignes.${index}.produit_nom`}>Produit *</Label>
        <ProductAutocomplete
          value={currentLine.produit_nom || ''}
          onChange={(value) => {
            // This will be handled by the register
          }}
          onSelect={(option) => handleProductSelect(index, option)}
          options={productOptions}
          placeholder="Rechercher ou sélectionner un produit..."
          className={errors.lignes?.[index]?.produit_nom ? 'border-red-500' : ''}
        />
        <input
          type="hidden"
          {...register(`lignes.${index}.produit_nom`)}
        />
        {errors.lignes?.[index]?.produit_nom && (
          <p className="text-sm text-red-600 mt-1">
            {errors.lignes[index]?.produit_nom?.message}
          </p>
        )}
        {selectedProduct && (
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span className={`inline-flex items-center gap-1 ${maxQuantity === 0 ? 'text-red-600' : maxQuantity <= 5 ? 'text-orange-600' : 'text-green-600'}`}>
              <span className={`h-2 w-2 rounded-full ${maxQuantity === 0 ? 'bg-red-500' : maxQuantity <= 5 ? 'bg-orange-500' : 'bg-green-500'}`} />
              Stock: {maxQuantity}
            </span>
            <span>Dernier prix: <span className="font-medium">{selectedProduct.dernier_prix_achat.toFixed(2)} DH</span></span>
          </div>
        )}
      </div>

      <div className="sm:col-span-2">
        <Label htmlFor={`lignes.${index}.quantite`}>
          Quantité * 
          {selectedProduct && (
            <span className="text-xs text-gray-500 ml-1">
              (Stock: {maxQuantity})
            </span>
          )}
        </Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => {
              const next = Math.max(1, (selectedQuantity || 1) - 1)
              setValue(`lignes.${index}.quantite`, next, { shouldValidate: true })
            }}
            disabled={!selectedProductName}
          >
            −
          </Button>
          <Input
            type="number"
            min="1"
            max={maxQuantity > 0 ? maxQuantity : undefined}
            {...register(`lignes.${index}.quantite`, { 
              valueAsNumber: true,
              onChange: () => setTimeout(() => {}, 0)
            })}
            className={quantityError ? 'border-red-500 text-center' : 'text-center'}
            placeholder="1"
            disabled={!selectedProductName || maxQuantity === 0}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => {
              const current = selectedQuantity || 1
              const next = maxQuantity ? Math.min(maxQuantity, current + 1) : current + 1
              setValue(`lignes.${index}.quantite`, next, { shouldValidate: true })
            }}
            disabled={!selectedProductName || maxQuantity === 0}
          >
            +
          </Button>
        </div>
        {quantityError && (
          <p className="text-sm text-red-600 mt-1">
            {quantityError}
          </p>
        )}
        {selectedProduct && maxQuantity === 0 && (
          <p className="text-sm text-red-600 mt-1">
            Produit en rupture de stock
          </p>
        )}
      </div>

      <div className="sm:col-span-3">
        <Label htmlFor={`lignes.${index}.prix_unitaire`}>Prix Unitaire (DH) *</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            step="0.01"
            min="0"
            {...register(`lignes.${index}.prix_unitaire`, { 
              valueAsNumber: true,
              onChange: () => setTimeout(() => {}, 0)
            })}
            className={errors.lignes?.[index]?.prix_unitaire ? 'border-red-500' : ''}
            placeholder="0.00"
          />
          {selectedProduct && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setValue(`lignes.${index}.prix_unitaire`, selectedProduct.dernier_prix_achat, { shouldValidate: true })}
            >
              Dernier prix
            </Button>
          )}
        </div>
        {errors.lignes?.[index]?.prix_unitaire && (
          <p className="text-sm text-red-600 mt-1">
            {errors.lignes[index]?.prix_unitaire?.message}
          </p>
        )}
      </div>

      <div className="sm:col-span-1">
        <Label>Sous-total</Label>
        <div className="mt-2 rounded border bg-muted p-2 text-sm font-medium text-green-600">
          {subtotal.toFixed(2)} DH
        </div>
      </div>

      <div className="sm:col-span-12 flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => removeLine(index)}
          disabled={fieldsLength === 1}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          title={fieldsLength === 1 ? "Au moins une ligne est requise" : "Supprimer cette ligne"}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})

export function SaleFormModal({ isOpen, onClose, mode, sale }: SaleFormModalProps) {
  const [error, setError] = useState<string | null>(null)
  
  const queryClient = useQueryClient()
  const createMutation = useCreateSale()
  const updateMutation = useUpdateSale()

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      nom_client: '',
      lignes: [{ produit_nom: '', quantite: 1, prix_unitaire: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lignes',
  })

  // Remove watch to prevent re-renders on every keystroke
  // const watchedLines = watch('lignes')
  
  // Get product suggestions (load all available products once)
  const { data: allProductSuggestions = [], isLoading: isLoadingSuggestions, refetch: refetchSuggestions } = useProductSuggestions(
    '', // Empty query to get all products
    isOpen
  )

  // Refresh suggestions when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        refetchSuggestions()
      }, 200)
    }
  }, [isOpen, refetchSuggestions])

  // Calculate total using getValues instead of watch to avoid re-renders
  const [total, setTotal] = useState(0)
  
  const calculateTotal = useCallback(() => {
    const formData = getValues()
    const newTotal = formData.lignes?.reduce((sum, line) => {
      return sum + (line.quantite || 0) * (line.prix_unitaire || 0)
    }, 0) || 0
    setTotal(newTotal)
  }, [getValues])

  // Helper function to get product suggestions for the autocomplete
  const getProductOptions = (): ProductAutocompleteOption[] => {
    return allProductSuggestions.map(product => ({
      value: product.produit_nom,
      label: product.produit_nom,
      quantite_disponible: product.quantite_disponible,
      dernier_prix_achat: product.dernier_prix_achat,
      category: product.category_nom || 'Produit',
      category_nom: product.category_nom || undefined,
      category_couleur: product.category_couleur || undefined,
      wood_type_nom: product.wood_type_nom || undefined,
      wood_type_couleur: product.wood_type_couleur || undefined
    }))
  }

  // Handle product selection from autocomplete
  const handleProductSelect = (index: number, option: ProductAutocompleteOption) => {
    // Update product name and price using setValue to avoid focus loss
    setValue(`lignes.${index}.produit_nom`, option.value)
    setValue(`lignes.${index}.prix_unitaire`, option.dernier_prix_achat)
    
    // Recalculate total
    setTimeout(() => calculateTotal(), 100)
  }



  // Reset form when modal opens/closes or sale changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && sale) {
        reset({
          nom_client: sale.nom_client,
          lignes: sale.lignes_vente.map(line => ({
            produit_nom: line.produit_nom,
            quantite: line.quantite,
            prix_unitaire: parseFloat(line.prix_unitaire.toString()),
          })),
        })

      } else {
        reset({
          nom_client: '',
          lignes: [{ produit_nom: '', quantite: 1, prix_unitaire: 0 }],
        })
      }
      setError(null)
    }
  }, [isOpen, mode, sale, reset])

  const onSubmit = async (data: SaleFormData) => {
    setError(null)
    
    // Check for stock validation before submitting
    const stockValidationErrors: string[] = []
    
    for (let i = 0; i < data.lignes.length; i++) {
      const ligne = data.lignes[i]
      if (ligne.produit_nom) {
        // Find product in suggestions to check stock
        const product = allProductSuggestions.find(p => 
          p.produit_nom.toLowerCase() === ligne.produit_nom.toLowerCase()
        )
        
        if (!product) {
          stockValidationErrors.push(
            `${ligne.produit_nom}: Produit non trouvé dans l'inventaire`
          )
        } else if (product.quantite_disponible <= 0) {
          stockValidationErrors.push(
            `${ligne.produit_nom}: Produit en rupture de stock`
          )
        } else if (ligne.quantite > product.quantite_disponible) {
          stockValidationErrors.push(
            `${ligne.produit_nom}: Quantité demandée (${ligne.quantite}) supérieure au stock disponible (${product.quantite_disponible})`
          )
        }
      }
    }
    
    if (stockValidationErrors.length > 0) {
      setError(`Erreurs de stock:\n${stockValidationErrors.join('\n')}`)
      return
    }
    
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(data)
      } else if (mode === 'edit' && sale) {
        await updateMutation.mutateAsync({ id: sale.id, ...data })
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
    append({ produit_nom: '', quantite: 1, prix_unitaire: 0 })
  }

  const removeLine = (index: number) => {
    if (fields.length > 1) {
      remove(index)

    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent side="right" className="w-full max-w-[60vw] min-w-[500px] p-0">
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b p-6">
            <SheetTitle>{mode === 'create' ? 'Nouvelle Vente' : 'Modifier la Vente'}</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Client Name */}
            <div>
              <Label htmlFor="nom_client">Nom du Client *</Label>
              <Input
                id="nom_client"
                {...register('nom_client')}
                className={errors.nom_client ? 'border-red-500' : ''}
                placeholder="Nom du client"
              />
              {errors.nom_client && (
                <p className="text-sm text-red-600 mt-1">{errors.nom_client.message}</p>
              )}
            </div>

            {/* Sale Lines */}
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
                  <ProductLine 
                    key={field.id} 
                    field={field} 
                    index={index}
                    register={register}
                    errors={errors}
                    productOptions={getProductOptions()}
                    handleProductSelect={handleProductSelect}
                    removeLine={removeLine}
                    fieldsLength={fields.length}
                    getValues={getValues}
                    watch={watch}
                    setValue={setValue}
                  />
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
                <span className="text-2xl font-bold text-green-600">
                  {total.toFixed(2)} DH
                </span>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
                <div className="text-sm text-destructive whitespace-pre-line">{error}</div>
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
                    {mode === 'create' ? 'Créer la Vente' : 'Modifier la Vente'}
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