import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, CheckCircle2, FileText } from 'lucide-react'
import { useState } from 'react'
import { FileUpload } from '@/components/feature/file/FileUpload'
import { PostForm } from '@/components/feature/post/PostForm'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { tokenStorage } from '@/lib/tokenStorage'
import { postService } from '@/services/postService'
import type { Post } from '@/types/post'
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
  const queryClient = useQueryClient()
  const { isAdmin } = useAuth()
  const [createdPost, setCreatedPost] = useState<Post | null>(null)

  const createMutation = useMutation({
    mutationFn: (body: { title: string; content: string }) => postService.createPost(body),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['posts'] })
      setCreatedPost(data)
    },
  })

  const handleViewPost = () => {
    if (createdPost) {
      void navigate({ to: '/posts/$postId', params: { postId: String(createdPost.id) } })
    }
  }

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

      {!createdPost ? (
        /* ── 1단계: 글쓰기 ── */
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[hsl(var(--accent))]" />
            <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">글쓰기</h1>
          </div>
          <PostForm
            onSubmit={(data) => createMutation.mutate(data)}
            isLoading={createMutation.isPending}
            error={createMutation.isError ? getErrorMessage(createMutation.error) : undefined}
            submitLabel="게시하기"
          />
          {isAdmin && (
            <p className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">
              * 첨부파일은 게시 후 추가할 수 있습니다.
            </p>
          )}
        </div>
      ) : (
        /* ── 2단계: 파일 첨부 ── */
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800">게시글이 등록되었습니다!</p>
              <p className="text-xs text-green-700">
                {isAdmin
                  ? '아래에서 첨부파일을 추가하거나 바로 게시물을 확인하세요.'
                  : '바로 게시물을 확인하세요.'}
              </p>
            </div>
            <Button size="sm" onClick={handleViewPost}>
              게시물 보기
            </Button>
          </div>

          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
            <p className="mb-1 text-sm font-semibold text-[hsl(var(--foreground))]">
              {createdPost.title}
            </p>
            <p className="line-clamp-2 text-xs text-[hsl(var(--muted-foreground))]">
              {createdPost.content}
            </p>
          </div>

          {isAdmin && (
            <FileUpload
              postId={createdPost.id}
              existingAttachments={[]}
              onUploadComplete={() => {}}
              canEdit={true}
            />
          )}
        </div>
      )}
    </div>
  )
}
