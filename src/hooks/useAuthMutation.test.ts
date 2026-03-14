import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useLoginMutation, useRegisterMutation } from './useAuthMutation'

const mockNavigate = vi.fn()
const mockLogin = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}))

vi.mock('@/services/authService', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
  },
}))

const mockUser = {
  id: 1,
  email: 'test@example.com',
  nickname: '테스터',
  createdAt: '2024-01-01T00:00:00.000Z',
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: 0 } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useLoginMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('로그인 성공 시 login()과 navigate("/")를 호출한다', async () => {
    const { authService } = await import('@/services/authService')
    const loginResponse = { accessToken: 'token123', user: mockUser }
    vi.mocked(authService.login).mockResolvedValue(loginResponse)

    const { result } = renderHook(() => useLoginMutation(), { wrapper: createWrapper() })

    result.current.mutate({ email: 'test@example.com', password: 'password1' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockLogin).toHaveBeenCalledWith(loginResponse)
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
  })

  it('로그인 실패 시 에러 상태가 된다', async () => {
    const { authService } = await import('@/services/authService')
    vi.mocked(authService.login).mockRejectedValue({ code: 'AUTH_FAILED', message: '인증 실패' })

    const { result } = renderHook(() => useLoginMutation(), { wrapper: createWrapper() })

    result.current.mutate({ email: 'test@example.com', password: 'wrong' })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(mockLogin).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})

describe('useRegisterMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('회원가입 성공 시 /login으로 navigate한다', async () => {
    const { authService } = await import('@/services/authService')
    vi.mocked(authService.register).mockResolvedValue(undefined)

    const { result } = renderHook(() => useRegisterMutation(), { wrapper: createWrapper() })

    result.current.mutate({ email: 'new@example.com', password: 'password1', nickname: '새유저' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/login',
      search: { registered: 'true' },
    })
  })

  it('회원가입 실패 시 에러 상태가 된다', async () => {
    const { authService } = await import('@/services/authService')
    vi.mocked(authService.register).mockRejectedValue({ code: 'CONFLICT', message: '중복' })

    const { result } = renderHook(() => useRegisterMutation(), { wrapper: createWrapper() })

    result.current.mutate({ email: 'dup@example.com', password: 'password1', nickname: '중복' })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
