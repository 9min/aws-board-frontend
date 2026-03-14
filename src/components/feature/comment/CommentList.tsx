import { useState } from 'react'
import { Button } from '@/components/ui/Button'
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
    <div className="mt-8">
      <h2 className="mb-4 text-xl font-semibold">댓글</h2>

      {comments.length === 0 ? (
        <p className="mb-4 text-sm text-muted-foreground">아직 댓글이 없습니다.</p>
      ) : (
        <ul className="mb-6 divide-y divide-border">
          {comments.map((comment) => (
            <li key={comment.id} className="py-4">
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
                  <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{comment.authorNickname}</span>
                    <span>{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm">{comment.content}</p>
                  {user?.id === comment.authorId && (
                    <div className="mt-2 flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingId(comment.id)}>
                        수정
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(comment.id)}
                        isLoading={
                          deleteMutation.isPending && deleteMutation.variables === comment.id
                        }
                      >
                        삭제
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <CommentForm
        key={createFormKey}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
        error={createMutation.isError ? getErrorMessage(createMutation.error) : undefined}
      />
    </div>
  )
}
