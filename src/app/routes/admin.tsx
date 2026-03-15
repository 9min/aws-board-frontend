import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { AdminSidebar } from '@/components/feature/admin/AdminSidebar'
import { useAuth } from '@/contexts/AuthContext'

export const Route = createFileRoute('/admin')({
  component: AdminLayout,
})

function AdminLayout() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      void navigate({ to: '/' })
    }
  }, [isLoading, isAuthenticated, isAdmin, navigate])

  if (isLoading || !isAuthenticated || !isAdmin) return null

  return (
    <div className="flex h-full">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
