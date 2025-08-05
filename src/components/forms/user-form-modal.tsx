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

const userSchema = z.object({
  email: z.string().min(1, 'L\'email est requis').email('Format d\'email invalide'),
  nom: z.string().min(1, 'Le nom est requis').min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: z.string().min(1, 'Le prénom est requis').min(2, 'Le prénom doit contenir au moins 2 caractères'),
  password: z.string().optional(),
  role: z.enum(['admin', 'employe']).default('employe'),
})

type UserFormData = z.infer<typeof userSchema>

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
  } = useForm<UserFormData>({
    resolver: zodResolver(
      mode === 'edit' 
        ? userSchema.extend({
            password: z.string().optional().refine(
              (val) => !val || val.length >= 6,
              { message: 'Le mot de passe doit contenir au moins 6 caractères si renseigné' }
            )
          })
        : userSchema.extend({
            password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères')
          })
    ),
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

  const onSubmit = async (data: UserFormData) => {
    setError(null)
    
    try {
      if (mode === 'create') {
        if (!data.password) {
          setError('Le mot de passe est requis')
          return
        }
        await createMutation.mutateAsync({
          email: data.email,
          nom: data.nom,
          prenom: data.prenom,
          password: data.password,
          role: data.role,
        })
      } else if (mode === 'edit' && user) {
        const updateData: any = {
          id: user.id,
          email: data.email,
          nom: data.nom,
          prenom: data.prenom,
          role: data.role,
        }
        
        if (data.password) {
          updateData.password = data.password
        }
        
        await updateMutation.mutateAsync(updateData)
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    }
  }

  if (!isOpen) return null

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {mode === 'create' ? 'Nouvel Utilisateur' : 'Modifier l\'Utilisateur'}
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
                {mode === 'create' ? 'Créer l\'Utilisateur' : 'Modifier l\'Utilisateur'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}