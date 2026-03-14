import axios from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { tokenStorage } from './tokenStorage'

// apiClient 모듈을 테스트하기 위한 모킹
vi.mock('./tokenStorage', () => ({
  tokenStorage: {
    getAccessToken: vi.fn(),
    clearTokens: vi.fn(),
  },
}))

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('axios 인스턴스를 생성한다', async () => {
    const { apiClient } = await import('./apiClient')
    expect(apiClient).toBeDefined()
    expect(axios.isAxiosError).toBeDefined()
  })

  it('액세스 토큰이 있으면 Authorization 헤더를 설정한다', async () => {
    vi.mocked(tokenStorage.getAccessToken).mockReturnValue('test-token')
    const { apiClient } = await import('./apiClient')

    // 인터셉터가 토큰을 헤더에 추가하는지 확인
    const config = { headers: {} as Record<string, string> }
    const requestInterceptor = (
      apiClient.interceptors.request as unknown as {
        handlers: Array<{ fulfilled: (config: unknown) => unknown }>
      }
    ).handlers[0]

    if (requestInterceptor?.fulfilled) {
      const result = (await requestInterceptor.fulfilled(config)) as typeof config
      expect(result.headers.Authorization).toBe('Bearer test-token')
    }
  })

  it('액세스 토큰이 없으면 Authorization 헤더를 설정하지 않는다', async () => {
    vi.mocked(tokenStorage.getAccessToken).mockReturnValue(null)
    const { apiClient } = await import('./apiClient')

    const config = { headers: {} as Record<string, string> }
    const requestInterceptor = (
      apiClient.interceptors.request as unknown as {
        handlers: Array<{ fulfilled: (config: unknown) => unknown }>
      }
    ).handlers[0]

    if (requestInterceptor?.fulfilled) {
      const result = (await requestInterceptor.fulfilled(config)) as typeof config
      expect(result.headers.Authorization).toBeUndefined()
    }
  })
})
