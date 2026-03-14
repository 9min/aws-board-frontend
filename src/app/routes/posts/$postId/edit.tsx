import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { PostForm } from '@/components/feature/post/PostForm'
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
    return <p className="py-8 text-center text-muted-foreground">불러오는 중...</p>
  }

  if (isError || !post) {
    return <p className="py-8 text-center text-red-500">게시글을 불러오지 못했습니다.</p>
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="mb-6 text-2xl font-bold">게시글 수정</h1>
      <PostForm
        onSubmit={(data) => updateMutation.mutate(data)}
        isLoading={updateMutation.isPending}
        error={updateMutation.isError ? getErrorMessage(updateMutation.error) : undefined}
        defaultValues={{ title: post.title, content: post.content }}
        submitLabel="수정하기"
      />
    </div>
  )
}
