import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider, useAuth } from './AuthContext'

vi.mock('@/lib/tokenStorage', () => ({
  tokenStorage: {
    getAccessToken: vi.fn(),
    setAccessToken: vi.fn(),
    clearTokens: vi.fn(),
  },
}))

vi.mock('@/services/authService', () => ({
  authService: {
    getMe: vi.fn(),
  },
}))

const mockMeResponse = {
  id: 1,
  email: 'test@example.com',
  nickname: '테스터',
  isAdmin: false,
  createdAt: '2024-01-01T00:00:00.000Z',
}

const VALID_TOKEN = 'valid.token.here'

// 테스트용 컨슈머 컴포넌트
function TestConsumer() {
  const { user, isLoading, isAuthenticated, isAdmin, login, logout } = useAuth()
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'done'}</div>
      <div data-testid="user">{user?.email ?? 'none'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'yes' : 'no'}</div>
      <div data-testid="admin">{isAdmin ? 'yes' : 'no'}</div>
      <button type="button" onClick={() => { login({ accessToken: VALID_TOKEN }).catch(() => undefined) }}>
        login
      </button>
      <button type="button" onClick={logout}>
        logout
      </button>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('토큰이 없으면 isLoading이 false로 완료되고 user는 null이다', async () => {
    const { tokenStorage } = await import('@/lib/tokenStorage')
    vi.mocked(tokenStorage.getAccessToken).mockReturnValue(null)

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('done')
    })
    expect(screen.getByTestId('user')).toHaveTextContent('none')
    expect(screen.getByTestId('authenticated')).toHaveTextContent('no')
  })

  it('유효한 토큰이 있으면 getMe를 호출하여 user를 복원한다', async () => {
    const { tokenStorage } = await import('@/lib/tokenStorage')
    const { authService } = await import('@/services/authService')
    vi.mocked(tokenStorage.getAccessToken).mockReturnValue(VALID_TOKEN)
    vi.mocked(authService.getMe).mockResolvedValue(mockMeResponse)

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    })
    expect(screen.getByTestId('authenticated')).toHaveTextContent('yes')
    expect(screen.getByTestId('admin')).toHaveTextContent('no')
  })

  it('getMe 실패 시 clearTokens를 호출하고 user를 null로 유지한다', async () => {
    const { tokenStorage } = await import('@/lib/tokenStorage')
    const { authService } = await import('@/services/authService')
    vi.mocked(tokenStorage.getAccessToken).mockReturnValue(VALID_TOKEN)
    vi.mocked(authService.getMe).mockRejectedValue({ code: 'UNAUTHORIZED', message: '인증 실패' })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('done')
    })
    expect(tokenStorage.clearTokens).toHaveBeenCalled()
    expect(screen.getByTestId('user')).toHaveTextContent('none')
  })

  it('login 중 getMe 실패 시 토큰을 제거하고 에러를 throw한다', async () => {
    const { tokenStorage } = await import('@/lib/tokenStorage')
    const { authService } = await import('@/services/authService')
    vi.mocked(tokenStorage.getAccessToken).mockReturnValue(null)
    vi.mocked(authService.getMe).mockRejectedValue({ code: 'UNAUTHORIZED', message: '인증 실패' })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('done')
    })

    fireEvent.click(screen.getByText('login'))

    await waitFor(() => {
      expect(tokenStorage.clearTokens).toHaveBeenCalled()
    })
    expect(screen.getByTestId('user')).toHaveTextContent('none')
  })

  it('login 호출 시 토큰을 저장하고 getMe로 user를 설정한다', async () => {
    const { tokenStorage } = await import('@/lib/tokenStorage')
    const { authService } = await import('@/services/authService')
    vi.mocked(tokenStorage.getAccessToken).mockReturnValue(null)
    vi.mocked(authService.getMe).mockResolvedValue(mockMeResponse)

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('done')
    })

    fireEvent.click(screen.getByText('login'))

    await waitFor(() => {
      expect(tokenStorage.setAccessToken).toHaveBeenCalledWith(VALID_TOKEN)
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
      expect(screen.getByTestId('authenticated')).toHaveTextContent('yes')
    })
  })

  it('isAdmin이 true인 경우 isAdmin 값이 yes로 표시된다', async () => {
    const { tokenStorage } = await import('@/lib/tokenStorage')
    const { authService } = await import('@/services/authService')
    vi.mocked(tokenStorage.getAccessToken).mockReturnValue(VALID_TOKEN)
    vi.mocked(authService.getMe).mockResolvedValue({ ...mockMeResponse, isAdmin: true })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('admin')).toHaveTextContent('yes')
    })
  })

  it('logout 호출 시 토큰을 제거하고 user를 null로 초기화한다', async () => {
    const { tokenStorage } = await import('@/lib/tokenStorage')
    const { authService } = await import('@/services/authService')
    vi.mocked(tokenStorage.getAccessToken).mockReturnValue(VALID_TOKEN)
    vi.mocked(authService.getMe).mockResolvedValue(mockMeResponse)

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    })

    fireEvent.click(screen.getByText('logout'))

    expect(tokenStorage.clearTokens).toHaveBeenCalled()
    expect(screen.getByTestId('user')).toHaveTextContent('none')
  })
})

describe('useAuth', () => {
  it('AuthProvider 밖에서 사용하면 에러를 throw한다', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<TestConsumer />)).toThrow(
      'useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.',
    )
    consoleSpy.mockRestore()
  })
})
