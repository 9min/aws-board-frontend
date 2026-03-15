import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { AdminCommentTable } from '@/components/feature/admin/AdminCommentTable'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAdminComments, useDeleteAdminCommentMutation } from '@/hooks/useAdmin'

export const Route = createFileRoute('/admin/comments')({
  component: AdminCommentsPage,
})

function AdminCommentsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [postIdFilter, setPostIdFilter] = useState('')

  const postId = postIdFilter ? Number(postIdFilter) : undefined
  const { data, isLoading, isError } = useAdminComments({ page, postId })
  const deleteMutation = useDeleteAdminCommentMutation()

  const handlePostIdChange = (value: string) => {
    setPostIdFilter(value)
    setPage(1)
  }

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        void navigate({ to: '/admin/comments' })
      },
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">댓글 관리</h1>
        {data && (
          <span className="text-sm text-[hsl(var(--muted-foreground))]">총 {data.total}개</span>
        )}
      </div>

      <div className="mb-4">
        <Input
          type="number"
          placeholder="게시글 ID로 필터..."
          value={postIdFilter}
          onChange={(e) => handlePostIdChange(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {isError && (
        <div className="py-12 text-center text-red-500">댓글 목록을 불러오지 못했습니다.</div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <Skeleton key={n} className="h-12 rounded" />
          ))}
        </div>
      ) : (
        <AdminCommentTable
          comments={data?.data ?? []}
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
