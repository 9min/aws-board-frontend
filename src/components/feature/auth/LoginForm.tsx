import { useState } from 'react'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { LoginRequest } from '@/types/auth'

const loginSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
})

type FieldErrors = Partial<Record<keyof LoginRequest, string>>

interface LoginFormProps {
  onSubmit: (data: LoginRequest) => void
  isLoading: boolean
  error?: string
}

export function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginRequest>({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const result = loginSchema.safeParse(formData)
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
    <form onSubmit={handleSubmit} aria-label="로그인 폼" noValidate>
      {error && (
        <div role="alert" className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-4">
        <Input
          label="이메일"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={fieldErrors.email}
          autoComplete="email"
        />
        <Input
          label="비밀번호"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          error={fieldErrors.password}
          autoComplete="current-password"
        />
        <Button type="submit" isLoading={isLoading} className="mt-2 w-full">
          로그인
        </Button>
      </div>
    </form>
  )
}
