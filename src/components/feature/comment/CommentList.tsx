import { MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useUpdateCommentMutation,
} from '@/hooks/useComments'
import type { Comment } from '@/types/comment'
import { getErrorMessage } from '@/utils/error'
import { formatDate } from '@/utils/formatDate'
import { CommentForm } from './CommentForm'

interface CommentListProps {
  postId: number
  comments: Comment[]
}

export function CommentList({ postId, comments }: CommentListProps) {
  const { user } = useAuth()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [createFormKey, setCreateFormKey] = useState(0)

  const createMutation = useCreateCommentMutation(postId)
  const updateMutation = useUpdateCommentMutation(postId)
  const deleteMutation = useDeleteCommentMutation(postId)

  const handleCreate = (data: { content: string }) => {
    createMutation.mutate(data, { onSuccess: () => setCreateFormKey((k) => k + 1) })
  }

  const handleUpdate = (id: number, data: { content: string }) => {
    updateMutation.mutate({ id, body: data }, { onSuccess: () => setEditingId(null) })
  }

  const handleDelete = (id: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return
    deleteMutation.mutate(id, {
      onError: (error) => {
        alert(getErrorMessage(error))
      },
    })
  }

  return (
    <div>
      <h2 className="mb-4 flex items-center gap-1.5 text-base font-semibold text-[hsl(var(--foreground))]">
        <MessageSquare className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
        댓글
        {comments.length > 0 && (
          <span className="ml-0.5 rounded-full bg-[hsl(var(--accent)/0.1)] px-1.5 py-0.5 text-xs font-medium text-[hsl(var(--accent))]">
            {comments.length}
          </span>
        )}
      </h2>

      {comments.length === 0 ? (
        <p className="mb-4 text-sm text-[hsl(var(--muted-foreground))]">아직 댓글이 없습니다.</p>
      ) : (
        <ul className="mb-6 space-y-3">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"
            >
              {editingId === comment.id ? (
                <CommentForm
                  onSubmit={(data) => handleUpdate(comment.id, data)}
                  isLoading={updateMutation.isPending}
                  error={updateMutation.isError ? getErrorMessage(updateMutation.error) : undefined}
                  defaultValue={comment.content}
                  submitLabel="댓글 수정"
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--accent)/0.15)] text-xs font-bold text-[hsl(var(--accent))]">
                        {(comment.author?.nickname ?? comment.authorNickname ?? '?')[0]?.toUpperCase() ?? '?'}
                      </div>
                      <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                        {comment.author?.nickname ?? comment.authorNickname}
                      </span>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    {user?.id === comment.authorId && (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingId(comment.id)}
                          className="cursor-pointer rounded px-2 py-1 text-xs text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(comment.id)}
                          disabled={
                            deleteMutation.isPending && deleteMutation.variables === comment.id
                          }
                          className="cursor-pointer rounded px-2 py-1 text-xs text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--destructive))] disabled:opacity-50"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-[hsl(var(--foreground))]">
                    {comment.content}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
        <CommentForm
          key={createFormKey}
          onSubmit={handleCreate}
          isLoading={createMutation.isPending}
          error={createMutation.isError ? getErrorMessage(createMutation.error) : undefined}
        />
      </div>
    </div>
  )
}
