import axios from 'axios'
import { tokenStorage } from './tokenStorage'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// 요청 인터셉터: 액세스 토큰 자동 첨부
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 응답 인터셉터: 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status

      if (status === 401) {
        // 인증 만료 시 토큰 제거 및 로그인 페이지로 이동
        tokenStorage.clearTokens()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default apiClient
