import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { AdminUserTable } from '@/components/feature/admin/AdminUserTable'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAdminUsers, useDeleteAdminUserMutation } from '@/hooks/useAdmin'

export const Route = createFileRoute('/admin/users')({
  component: AdminUsersPage,
})

function AdminUsersPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading, isError } = useAdminUsers({ page, search: search || undefined })
  const deleteMutation = useDeleteAdminUserMutation()

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        void navigate({ to: '/admin/users' })
      },
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">회원 관리</h1>
        {data && (
          <span className="text-sm text-[hsl(var(--muted-foreground))]">총 {data.total}명</span>
        )}
      </div>

      <div className="mb-4">
        <Input
          placeholder="이메일 또는 닉네임 검색..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isError && (
        <div className="py-12 text-center text-red-500">회원 목록을 불러오지 못했습니다.</div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <Skeleton key={n} className="h-12 rounded" />
          ))}
        </div>
      ) : (
        <AdminUserTable
          users={data?.data ?? []}
          onDelete={handleDelete}
          isDeleting={deleteMutation.isPending}
        />
      )}

      {data && data.totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={data.totalPages}
            onPageChange={setPage}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  )
}
