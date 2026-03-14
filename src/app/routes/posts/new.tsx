import { createFileRoute, redirect } from '@tanstack/react-router'
import { PostForm } from '@/components/feature/post/PostForm'
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
  const createMutation = useCreatePostMutation()

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="mb-6 text-2xl font-bold">글쓰기</h1>
      <PostForm
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
        error={createMutation.isError ? getErrorMessage(createMutation.error) : undefined}
        submitLabel="게시하기"
      />
    </div>
  )
}
