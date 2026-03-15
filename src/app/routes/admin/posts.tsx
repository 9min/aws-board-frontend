import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { AdminPostTable } from '@/components/feature/admin/AdminPostTable'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAdminPosts, useDeleteAdminPostMutation } from '@/hooks/useAdmin'

export const Route = createFileRoute('/admin/posts')({
  component: AdminPostsPage,
})

function AdminPostsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading, isError } = useAdminPosts({ page, search: search || undefined })
  const deleteMutation = useDeleteAdminPostMutation()

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        void navigate({ to: '/admin/posts' })
      },
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">게시글 관리</h1>
        {data && (
          <span className="text-sm text-[hsl(var(--muted-foreground))]">
            총 {data.total}개
          </span>
        )}
      </div>

      <div className="mb-4">
        <Input
          placeholder="제목 검색..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isError && (
        <div className="py-12 text-center text-red-500">
          게시글 목록을 불러오지 못했습니다.
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded" />
          ))}
        </div>
      ) : (
        <AdminPostTable
          posts={data?.data ?? []}
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
