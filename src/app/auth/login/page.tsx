import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { LoginForm } from '@/components/forms/login-form'

export const metadata: Metadata = {
  title: 'Connexion | Gestion Magasin',
  description: 'Connectez-vous à votre compte pour accéder au système de gestion des ventes et achats',
}

export default async function LoginPage() {
  // Check if user is already logged in
  const user = await getCurrentUser()
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg border">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}