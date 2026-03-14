import { useState } from 'react'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { RegisterRequest } from '@/types/auth'

const registerSchema = z
  .object({
    email: z.string().email('올바른 이메일 형식이 아닙니다.'),
    password: z
      .string()
      .min(8, '비밀번호는 8자 이상이어야 합니다.')
      .max(20, '비밀번호는 20자 이하여야 합니다.')
      .refine(
        (val) => /[a-zA-Z]/.test(val) && /[0-9]/.test(val),
        '비밀번호에 영문자와 숫자가 포함되어야 합니다.',
      ),
    passwordConfirm: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
    nickname: z
      .string()
      .min(2, '닉네임은 2자 이상이어야 합니다.')
      .max(20, '닉네임은 20자 이하여야 합니다.'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  })

type FormData = RegisterRequest & { passwordConfirm: string }
type FieldErrors = Partial<Record<keyof FormData, string>>

interface RegisterFormProps {
  onSubmit: (data: RegisterRequest) => void
  isLoading: boolean
  error?: string
}

export function RegisterForm({ onSubmit, isLoading, error }: RegisterFormProps) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
  })
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
    const result = registerSchema.safeParse(formData)
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
    const { passwordConfirm: _, ...submitData } = result.data
    onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit} aria-label="회원가입 폼" noValidate>
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
          autoComplete="new-password"
        />
        <Input
          label="비밀번호 확인"
          name="passwordConfirm"
          type="password"
          value={formData.passwordConfirm}
          onChange={handleChange}
          error={fieldErrors.passwordConfirm}
          autoComplete="new-password"
        />
        <Input
          label="닉네임"
          name="nickname"
          type="text"
          value={formData.nickname}
          onChange={handleChange}
          error={fieldErrors.nickname}
          autoComplete="nickname"
        />
        <Button type="submit" isLoading={isLoading} className="mt-2 w-full">
          회원가입
        </Button>
      </div>
    </form>
  )
}
