import { createFileRoute, redirect } from '@tanstack/react-router'
import { Layers } from 'lucide-react'
import { RegisterForm } from '@/components/feature/auth/RegisterForm'
import { useRegisterMutation } from '@/hooks/useAuthMutation'
import { tokenStorage } from '@/lib/tokenStorage'
import { getErrorMessage } from '@/utils/error'

export const Route = createFileRoute('/register')({
  beforeLoad: () => {
    if (tokenStorage.hasAccessToken()) {
      throw redirect({ to: '/' })
    }
  },
  component: RegisterPage,
})

function RegisterPage() {
  const registerMutation = useRegisterMutation()

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[hsl(var(--muted)/0.4)] px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-lg">
          <div className="mb-6 flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent))]">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">회원가입</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">새 계정을 만들어 보세요</p>
          </div>

          <RegisterForm
            onSubmit={(data) => registerMutation.mutate(data)}
            isLoading={registerMutation.isPending}
            error={registerMutation.isError ? getErrorMessage(registerMutation.error) : undefined}
          />

          <p className="mt-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
            이미 계정이 있으신가요?{' '}
            <a
              href="/login"
              className="font-medium text-[hsl(var(--accent))] hover:underline"
            >
              로그인
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
