'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Save, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateUser, useUpdateUser } from '@/hooks/use-users'
import { User } from '@/types'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet'

const userSchema = z.object({
  email: z.string().min(1, 'L\'email est requis').email('Format d\'email invalide'),
  nom: z.string().min(1, 'Le nom est requis').min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: z.string().min(1, 'Le prénom est requis').min(2, 'Le prénom doit contenir au moins 2 caractères'),
  password: z.string().optional(),
  role: z.enum(['admin', 'employe']).default('employe'),
})

type UserFormData = z.output<typeof userSchema>
type UserFormValues = z.input<typeof userSchema>

interface UserFormModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  user?: User | null
}

export function UserFormModal({ isOpen, onClose, mode, user }: UserFormModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  
  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: '',
      nom: '',
      prenom: '',
      password: '',
      role: 'employe',
    },
  })

  const watchedRole = watch('role')

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && user) {
        reset({
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          password: '',
          role: user.role,
        })
      } else {
        reset({
          email: '',
          nom: '',
          prenom: '',
          password: '',
          role: 'employe',
        })
      }
      setError(null)
      setShowPassword(false)
    }
  }, [isOpen, mode, user, reset])

  const onSubmit = async (data: UserFormValues) => {
    setError(null)
    
    try {
      if (mode === 'create') {
        const createSchema = userSchema.extend({
          password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères')
        })
        const parsed = createSchema.parse(data)
        await createMutation.mutateAsync({
          email: parsed.email,
          nom: parsed.nom,
          prenom: parsed.prenom,
          password: parsed.password!,
          role: parsed.role,
        })
      } else if (mode === 'edit' && user) {
        const updateSchema = userSchema.extend({
          password: z.string().optional().refine(
            (val) => !val || val.length >= 6,
            { message: 'Le mot de passe doit contenir au moins 6 caractères si renseigné' }
          )
        })
        const parsed = updateSchema.parse(data)
        const updateData: any = {
          id: user.id,
          email: parsed.email,
          nom: parsed.nom,
          prenom: parsed.prenom,
          role: parsed.role,
        }
        
        if (parsed.password) {
          updateData.password = parsed.password
        }
        
        await updateMutation.mutateAsync(updateData)
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent side="right" className="w-full max-w-[36vw] min-w-[360px] p-0">
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b p-6">
            <SheetTitle>{mode === 'create' ? 'Nouvel Utilisateur' : "Modifier l'Utilisateur"}</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
                placeholder="utilisateur@store.com"
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* First Name */}
            <div>
              <Label htmlFor="prenom">Prénom *</Label>
              <Input
                id="prenom"
                {...register('prenom')}
                className={errors.prenom ? 'border-red-500' : ''}
                placeholder="Jean"
              />
              {errors.prenom && (
                <p className="text-sm text-red-600 mt-1">{errors.prenom.message}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <Label htmlFor="nom">Nom *</Label>
              <Input
                id="nom"
                {...register('nom')}
                className={errors.nom ? 'border-red-500' : ''}
                placeholder="Dupont"
              />
              {errors.nom && (
                <p className="text-sm text-red-600 mt-1">{errors.nom.message}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <Label htmlFor="role">Rôle *</Label>
              <select
                id="role"
                {...register('role')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="employe">Employé</option>
                <option value="admin">Administrateur</option>
              </select>
              {watchedRole === 'admin' && (
                <p className="text-sm text-amber-600 mt-1">
                  ⚠️ L'utilisateur aura accès à toutes les fonctionnalités
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">
                Mot de passe {mode === 'create' ? '*' : '(laisser vide pour ne pas changer)'}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                  placeholder={mode === 'edit' ? 'Nouveau mot de passe' : 'Mot de passe'}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
              )}
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
                    {mode === 'create' ? "Créer l'Utilisateur" : "Modifier l'Utilisateur"}
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