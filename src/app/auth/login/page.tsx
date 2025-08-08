import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Image from 'next/image'
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
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Cover image - visible on large screens */}
      <div className="relative hidden lg:block">
        <Image
          src="/cover_login.png"
          alt="Image de couverture"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Login panel */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-lg">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}