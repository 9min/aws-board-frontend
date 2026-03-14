export const AUTH_ENDPOINTS = {
  REGISTER: '/api/v1/auth/register',
  LOGIN: '/api/v1/auth/login',
} as const

export const POST_ENDPOINTS = {
  BASE: '/api/v1/posts',
  DETAIL: (id: number) => `/api/v1/posts/${id}`,
} as const
