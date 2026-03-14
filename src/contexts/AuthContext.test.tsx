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

// 테스트용 JWT 토큰 생성 헬퍼
function makeJwtToken(payload: { sub: number; email: string; exp: number }): string {
  return `header.${btoa(JSON.stringify(payload))}.signature`
}

const VALID_TOKEN = makeJwtToken({ sub: 1, email: 'test@example.com', exp: 9999999999 })
const EXPIRED_TOKEN = makeJwtToken({ sub: 1, email: 'test@example.com', exp: 1 })

// 테스트용 컨슈머 컴포넌트
function TestConsumer() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth()
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'done'}</div>
      <div data-testid="user">{user?.email ?? 'none'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'yes' : 'no'}</div>
      <button type="button" onClick={() => login({ accessToken: VALID_TOKEN })}>
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

  it('유효한 토큰이 있으면 JWT를 디코드하여 user를 복원한다', async () => {
    const { tokenStorage } = await import('@/lib/tokenStorage')
    vi.mocked(tokenStorage.getAccessToken).mockReturnValue(VALID_TOKEN)

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    })
    expect(screen.getByTestId('authenticated')).toHaveTextContent('yes')
  })

  it('만료된 토큰이면 clearTokens를 호출하고 user를 null로 유지한다', async () => {
    const { tokenStorage } = await import('@/lib/tokenStorage')
    vi.mocked(tokenStorage.getAccessToken).mockReturnValue(EXPIRED_TOKEN)

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

  it('login 호출 시 토큰을 저장하고 user를 설정한다', async () => {
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

    fireEvent.click(screen.getByText('login'))

    expect(tokenStorage.setAccessToken).toHaveBeenCalledWith(VALID_TOKEN)
    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    expect(screen.getByTestId('authenticated')).toHaveTextContent('yes')
  })

  it('logout 호출 시 토큰을 제거하고 user를 null로 초기화한다', async () => {
    const { tokenStorage } = await import('@/lib/tokenStorage')
    vi.mocked(tokenStorage.getAccessToken).mockReturnValue(VALID_TOKEN)

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
    // 에러를 suppress하기 위해 콘솔 에러를 mock
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<TestConsumer />)).toThrow(
      'useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.',
    )
    consoleSpy.mockRestore()
  })
})
