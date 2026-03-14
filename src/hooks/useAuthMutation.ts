import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services/authService'
import type { LoginRequest, RegisterRequest } from '@/types/auth'

export function useLoginMutation() {
  const { login } = useAuth()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (body: LoginRequest) => authService.login(body),
    onSuccess: (data) => {
      login(data)
      void navigate({ to: '/' })
    },
  })
}

export function useRegisterMutation() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (body: RegisterRequest) => authService.register(body),
    onSuccess: () => {
      void navigate({ to: '/login', search: { registered: 'true' } })
    },
  })
}
