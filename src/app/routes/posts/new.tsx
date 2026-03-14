import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { PostForm } from '@/components/feature/post/PostForm'
import { Button } from '@/components/ui/Button'
import { useCreatePostMutation } from '@/hooks/usePosts'
import { tokenStorage } from '@/lib/tokenStorage'
import { getErrorMessage } from '@/utils/error'

export const Route = createFileRoute('/posts/new')({
  beforeLoad: () => {
    if (!tokenStorage.hasAccessToken()) {
      throw redirect({ to: '/login' })
    }
  },
  component: NewPostPage,
})

function NewPostPage() {
  const navigate = useNavigate()
  const createMutation = useCreatePostMutation()

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void navigate({ to: '/' })}
          className="flex items-center gap-1.5 text-[hsl(var(--muted-foreground))]"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Button>
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
        <h1 className="mb-6 text-xl font-bold text-[hsl(var(--foreground))]">글쓰기</h1>
        <PostForm
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
          error={createMutation.isError ? getErrorMessage(createMutation.error) : undefined}
          submitLabel="게시하기"
        />
      </div>
    </div>
  )
}
