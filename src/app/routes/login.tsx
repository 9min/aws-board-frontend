import { createFileRoute, redirect } from '@tanstack/react-router'
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
    <div className="mx-auto max-w-sm py-16">
      <h1 className="mb-6 text-2xl font-bold">로그인</h1>
      {registered === 'true' && (
        <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
          회원가입이 완료됐습니다. 로그인해주세요.
        </div>
      )}
      <LoginForm
        onSubmit={(data) => loginMutation.mutate(data)}
        isLoading={loginMutation.isPending}
        error={loginMutation.isError ? getErrorMessage(loginMutation.error) : undefined}
      />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        계정이 없으신가요?{' '}
        <a href="/register" className="text-foreground underline hover:no-underline">
          회원가입
        </a>
      </p>
    </div>
  )
}
