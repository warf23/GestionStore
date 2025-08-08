'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from './sidebar'
import { DashboardNavigation } from './dashboard-navigation'
import { AuthUser } from '@/types'

interface DashboardLayoutProps {
  children: React.ReactNode
  user: AuthUser
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed')
    if (savedState !== null) {
      setSidebarCollapsed(JSON.parse(savedState))
    }
  }, [])

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(sidebarCollapsed))
  }, [sidebarCollapsed])

  const toggleSidebar = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches) {
      setSidebarCollapsed((prev) => !prev)
    } else {
      setIsMobileSidebarOpen((prev) => !prev)
    }
  }

  // Lock body scroll when mobile sidebar is open and close on Escape
  useEffect(() => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = isMobileSidebarOpen ? 'hidden' : ''
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileSidebarOpen(false)
    }
    if (isMobileSidebarOpen) {
      window.addEventListener('keydown', handleKey)
    }
    return () => window.removeEventListener('keydown', handleKey)
  }, [isMobileSidebarOpen])

  return (
    <div className="min-h-svh bg-background">
      <div className="flex h-svh">
        <Sidebar
          user={user}
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />
        <div className="flex flex-1 flex-col">
          <DashboardNavigation
            user={user}
            sidebarCollapsed={sidebarCollapsed}
            onSidebarToggle={toggleSidebar}
          />
          <main className="flex-1 overflow-auto">
            <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
          </main>
        </div>
      </div>
      {/* Mobile overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px] lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  )
}