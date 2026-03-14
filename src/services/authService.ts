import { AUTH_ENDPOINTS } from '@/constants/apiEndpoints'
import { apiClient } from '@/lib/apiClient'
import type { LoginRequest, LoginResponse, RegisterRequest } from '@/types/auth'
import { handleApiError } from '@/utils/error'

export const authService = {
  async register(body: RegisterRequest): Promise<void> {
    try {
      await apiClient.post(AUTH_ENDPOINTS.REGISTER, body)
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async login(body: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<{ data: LoginResponse; error: null; meta: null }>(
        AUTH_ENDPOINTS.LOGIN,
        body,
      )
      return response.data.data
    } catch (error) {
      const appError = handleApiError(error)
      // 로그인 실패(자격증명 오류)는 AUTH_FAILED로 변환
      if (appError.code === 'UNAUTHORIZED') {
        throw { ...appError, code: 'AUTH_FAILED' }
      }
      throw appError
    }
  },
}
