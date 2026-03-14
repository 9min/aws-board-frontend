import { useState } from 'react'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'

const postSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.').max(100, '제목은 100자 이하로 입력해주세요.'),
  content: z.string().min(1, '내용을 입력해주세요.'),
})

type PostFormData = { title: string; content: string }
type FieldErrors = Partial<Record<keyof PostFormData, string>>

interface PostFormProps {
  onSubmit: (data: PostFormData) => void
  isLoading: boolean
  error?: string
  defaultValues?: { title?: string; content?: string }
  submitLabel?: string
}

export function PostForm({
  onSubmit,
  isLoading,
  error,
  defaultValues = {},
  submitLabel = '저장',
}: PostFormProps) {
  const [formData, setFormData] = useState<PostFormData>({
    title: defaultValues.title ?? '',
    content: defaultValues.content ?? '',
  })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const result = postSchema.safeParse(formData)
    if (!result.success) {
      const newErrors: FieldErrors = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FieldErrors
        if (!newErrors[field]) {
          newErrors[field] = issue.message
        }
      }
      setFieldErrors(newErrors)
      return
    }
    onSubmit(result.data)
  }

  return (
    <form onSubmit={handleSubmit} aria-label="게시글 폼" noValidate>
      {error && (
        <div role="alert" className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-4">
        <Input
          label="제목"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          error={fieldErrors.title}
          placeholder="제목을 입력하세요"
        />
        <Textarea
          label="내용"
          name="content"
          value={formData.content}
          onChange={handleTextareaChange}
          error={fieldErrors.content}
          placeholder="내용을 입력하세요"
          rows={10}
        />
        <Button type="submit" isLoading={isLoading} className="self-end">
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
