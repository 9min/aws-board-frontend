import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'
import { PostForm } from '@/components/feature/post/PostForm'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { usePost, useUpdatePostMutation } from '@/hooks/usePosts'
import { tokenStorage } from '@/lib/tokenStorage'
import { getErrorMessage } from '@/utils/error'

export const Route = createFileRoute('/posts/$postId/edit')({
  beforeLoad: () => {
    if (!tokenStorage.hasAccessToken()) {
      throw redirect({ to: '/login' })
    }
  },
  component: EditPostPage,
})

function EditPostPage() {
  const { postId } = Route.useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const postIdNum = Number(postId)
  const { data: post, isLoading, isError } = usePost(postIdNum)
  const updateMutation = useUpdatePostMutation(postIdNum)

  useEffect(() => {
    if (post && user && user.id !== post.authorId) {
      void navigate({ to: '/posts/$postId', params: { postId } })
    }
  }, [post, user, navigate, postId])

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

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void navigate({ to: '/posts/$postId', params: { postId } })}
          className="flex items-center gap-1.5 text-[hsl(var(--muted-foreground))]"
        >
          <ArrowLeft className="h-4 w-4" />
          게시글로
        </Button>
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
        <h1 className="mb-6 text-xl font-bold text-[hsl(var(--foreground))]">게시글 수정</h1>
        <PostForm
          onSubmit={(data) => updateMutation.mutate(data)}
          isLoading={updateMutation.isPending}
          error={updateMutation.isError ? getErrorMessage(updateMutation.error) : undefined}
          defaultValues={{ title: post.title, content: post.content }}
          submitLabel="수정하기"
        />
      </div>
    </div>
  )
}
