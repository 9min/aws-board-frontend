import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authService } from './authService'

vi.mock('@/lib/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
  },
}))

const createMockAxiosError = (status?: number, message?: string) => ({
  isAxiosError: true as const,
  response: status !== undefined ? { status, data: message ? { message } : {} } : undefined,
})

describe('authService.register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('회원가입 성공 시 void를 반환한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: {} })

    await expect(
      authService.register({
        email: 'test@example.com',
        password: 'password1',
        nickname: '테스터',
      }),
    ).resolves.toBeUndefined()
  })

  it('400 에러 시 BAD_REQUEST AppError를 throw한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.post).mockRejectedValueOnce(createMockAxiosError(400))

    await expect(
      authService.register({
        email: 'test@example.com',
        password: 'password1',
        nickname: '테스터',
      }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
  })

  it('409 에러 시 CONFLICT AppError를 throw한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.post).mockRejectedValueOnce(createMockAxiosError(409))

    await expect(
      authService.register({
        email: 'test@example.com',
        password: 'password1',
        nickname: '테스터',
      }),
    ).rejects.toMatchObject({ code: 'CONFLICT' })
  })
})

describe('authService.login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('로그인 성공 시 LoginResponse를 반환한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    const loginResponse = { accessToken: 'token123' }
    // 실제 API 응답: { data: { accessToken: '...' }, error: null, meta: null }
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { data: loginResponse, error: null, meta: null },
    })

    const result = await authService.login({ email: 'test@example.com', password: 'password1' })
    expect(result).toEqual(loginResponse)
  })

  it('401 에러 시 AUTH_FAILED AppError를 throw한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.post).mockRejectedValueOnce(createMockAxiosError(401))

    await expect(
      authService.login({ email: 'test@example.com', password: 'wrong' }),
    ).rejects.toMatchObject({ code: 'AUTH_FAILED' })
  })

  it('500 에러 시 SERVER_ERROR AppError를 throw한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.post).mockRejectedValueOnce(createMockAxiosError(500))

    await expect(
      authService.login({ email: 'test@example.com', password: 'password1' }),
    ).rejects.toMatchObject({ code: 'SERVER_ERROR' })
  })
})
