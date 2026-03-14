import { createFileRoute, useNavigate } from '@tanstack/react-router'
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
    return <p className="py-8 text-center text-muted-foreground">불러오는 중...</p>
  }

  if (isError || !post) {
    return <p className="py-8 text-center text-red-500">게시글을 불러오지 못했습니다.</p>
  }

  const isAuthor = user?.id === post.authorId

  const handleDelete = () => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    deleteMutation.mutate(post.id)
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => void navigate({ to: '/' })}>
          ← 목록으로
        </Button>
      </div>

      <h1 className="mb-4 text-3xl font-bold">{post.title}</h1>

      <div className="mb-6 flex items-center gap-4 text-sm text-muted-foreground">
        <span>{post.author.nickname}</span>
        <span>{formatDate(post.createdAt)}</span>
        <span>조회 {post.viewCount}</span>
      </div>

      {isAuthor && (
        <div className="mb-6 flex gap-2">
          <Button
            variant="secondary"
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

      <div className="whitespace-pre-wrap rounded-lg border border-border p-6">{post.content}</div>
    </div>
  )
}
