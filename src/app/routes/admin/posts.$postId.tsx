import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Calendar, Eye, User } from 'lucide-react'
import { AdminDeleteButton } from '@/components/feature/admin/AdminDeleteButton'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAdminPost, useDeleteAdminPostMutation } from '@/hooks/useAdmin'
import { formatDate } from '@/utils/formatDate'

export const Route = createFileRoute('/admin/posts/$postId')({
  component: AdminPostDetailPage,
})

function AdminPostDetailPage() {
  const { postId } = Route.useParams()
  const navigate = useNavigate()
  const { data: post, isLoading, isError } = useAdminPost(Number(postId))
  const deleteMutation = useDeleteAdminPostMutation()

  const handleDelete = () => {
    deleteMutation.mutate(Number(postId), {
      onSuccess: () => {
        void navigate({ to: '/admin/posts' })
      },
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (isError || !post) {
    return <div className="py-12 text-center text-red-500">게시글 정보를 불러오지 못했습니다.</div>
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void navigate({ to: '/admin/posts' })}
          className="flex items-center gap-1.5 text-[hsl(var(--muted-foreground))]"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Button>
        <AdminDeleteButton
          onConfirm={handleDelete}
          isLoading={deleteMutation.isPending}
          label="게시글 삭제"
        />
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
        <div className="border-b border-[hsl(var(--border))] px-6 py-5">
          <h1 className="mb-3 text-xl font-bold text-[hsl(var(--foreground))]">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-[hsl(var(--muted-foreground))]">
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {post.author.nickname}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(post.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              조회 {post.viewCount}
            </span>
          </div>
        </div>
        <div className="min-h-[120px] px-6 py-5">
          <p className="whitespace-pre-wrap text-sm leading-7 text-[hsl(var(--foreground))]">
            {post.content}
          </p>
        </div>
      </div>
    </div>
  )
}
