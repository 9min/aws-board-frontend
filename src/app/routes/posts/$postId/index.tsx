import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Calendar, Eye, User } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { useDeletePostMutation, usePost } from '@/hooks/usePosts'
import { formatDate } from '@/utils/formatDate'

export const Route = createFileRoute('/posts/$postId/')({
  component: PostDetailPage,
})

function PostDetailPage() {
  const { postId } = Route.useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: post, isLoading, isError } = usePost(Number(postId))
  const deleteMutation = useDeletePostMutation()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-[hsl(var(--muted-foreground))]">
        불러오는 중...
      </div>
    )
  }

  if (isError || !post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-red-500">
        게시글을 불러오지 못했습니다.
      </div>
    )
  }

  const isAuthor = user?.id === post.authorId

  const handleDelete = () => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    deleteMutation.mutate(post.id)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void navigate({ to: '/' })}
          className="flex items-center gap-1.5 text-[hsl(var(--muted-foreground))]"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Button>

        {isAuthor && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void navigate({ to: '/posts/$postId/edit', params: { postId } })}
            >
              수정
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
            >
              삭제
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
        <h1 className="mb-4 text-2xl font-bold leading-tight text-[hsl(var(--foreground))]">
          {post.title}
        </h1>

        <div className="mb-6 flex flex-wrap items-center gap-3 border-b border-[hsl(var(--border))] pb-4">
          <div className="flex items-center gap-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--accent))] text-xs font-bold text-white">
              {post.author.nickname[0].toUpperCase()}
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-[hsl(var(--foreground))]">
              <User className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
              {post.author.nickname}
            </span>
          </div>
          <span className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))]">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(post.createdAt)}
          </span>
          <Badge variant="outline" className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            조회 {post.viewCount}
          </Badge>
        </div>

        <div className="whitespace-pre-wrap text-[0.9375rem] leading-7 text-[hsl(var(--foreground))]">
          {post.content}
        </div>
      </div>
    </div>
  )
}
