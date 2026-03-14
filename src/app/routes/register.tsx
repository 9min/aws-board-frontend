import { createFileRoute, redirect } from '@tanstack/react-router'
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
    <div className="mx-auto max-w-sm py-16">
      <h1 className="mb-6 text-2xl font-bold">회원가입</h1>
      <RegisterForm
        onSubmit={(data) => registerMutation.mutate(data)}
        isLoading={registerMutation.isPending}
        error={registerMutation.isError ? getErrorMessage(registerMutation.error) : undefined}
      />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        이미 계정이 있으신가요?{' '}
        <a href="/login" className="text-foreground underline hover:no-underline">
          로그인
        </a>
      </p>
    </div>
  )
}
