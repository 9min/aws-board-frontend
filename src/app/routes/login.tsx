import { createFileRoute, redirect } from '@tanstack/react-router'
import { Layers } from 'lucide-react'
import { LoginForm } from '@/components/feature/auth/LoginForm'
import { useLoginMutation } from '@/hooks/useAuthMutation'
import { tokenStorage } from '@/lib/tokenStorage'
import { getErrorMessage } from '@/utils/error'

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): { registered?: string } => ({
    registered: typeof search.registered === 'string' ? search.registered : undefined,
  }),
  beforeLoad: () => {
    if (tokenStorage.hasAccessToken()) {
      throw redirect({ to: '/' })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const { registered } = Route.useSearch()
  const loginMutation = useLoginMutation()

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[hsl(var(--muted)/0.4)] px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-lg">
          <div className="mb-6 flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent))]">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">로그인</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              AWS Board에 오신 것을 환영합니다
            </p>
          </div>

          {registered === 'true' && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              회원가입이 완료됐습니다. 로그인해주세요.
            </div>
          )}

          <LoginForm
            onSubmit={(data) => loginMutation.mutate(data)}
            isLoading={loginMutation.isPending}
            error={loginMutation.isError ? getErrorMessage(loginMutation.error) : undefined}
          />

          <p className="mt-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
            계정이 없으신가요?{' '}
            <a href="/register" className="font-medium text-[hsl(var(--accent))] hover:underline">
              회원가입
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
