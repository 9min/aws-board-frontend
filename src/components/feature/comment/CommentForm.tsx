import { useState } from 'react'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { useAuth } from '@/contexts/AuthContext'

const commentSchema = z.object({
  content: z
    .string()
    .min(1, '댓글 내용을 입력해주세요.')
    .max(500, '댓글은 500자 이하로 입력해주세요.'),
})

interface CommentFormProps {
  onSubmit: (data: { content: string }) => void
  isLoading: boolean
  error?: string
  defaultValue?: string
  submitLabel?: string
  onCancel?: () => void
}

export function CommentForm({
  onSubmit,
  isLoading,
  error,
  defaultValue = '',
  submitLabel = '댓글 작성',
  onCancel,
}: CommentFormProps) {
  const { isAuthenticated } = useAuth()
  const [content, setContent] = useState(defaultValue)
  const [fieldError, setFieldError] = useState<string | undefined>(undefined)

  if (!isAuthenticated) {
    return (
      <p className="text-sm text-[hsl(var(--muted-foreground))]">
        로그인 후 댓글을 작성할 수 있습니다.
      </p>
    )
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const result = commentSchema.safeParse({ content })
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message)
      return
    }
    onSubmit(result.data)
  }

  return (
    <form onSubmit={handleSubmit} aria-label="댓글 폼" noValidate>
      {error && (
        <div role="alert" className="mb-2 rounded-md bg-red-50 p-2 text-sm text-red-600">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Textarea
          id="comment-content"
          aria-label="댓글 내용"
          name="content"
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            setFieldError(undefined)
          }}
          error={fieldError}
          placeholder="댓글을 입력하세요"
          rows={3}
        />
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              취소
            </Button>
          )}
          <Button type="submit" size="sm" isLoading={isLoading}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  )
}
