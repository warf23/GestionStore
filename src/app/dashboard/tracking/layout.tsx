import { redirect } from 'next/navigation'
import { ENABLE_EMPLOYEE_TRACKING } from '@/lib/constants'

export default function TrackingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Redirect to dashboard if tracking is disabled
  if (!ENABLE_EMPLOYEE_TRACKING) {
    redirect('/dashboard')
  }

  return <>{children}</>
}