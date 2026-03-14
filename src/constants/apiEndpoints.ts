export const AUTH_ENDPOINTS = {
  REGISTER: '/api/v1/auth/register',
  LOGIN: '/api/v1/auth/login',
} as const

export const POST_ENDPOINTS = {
  BASE: '/api/v1/posts',
  DETAIL: (id: number) => `/api/v1/posts/${id}`,
} as const

export const COMMENT_ENDPOINTS = {
  LIST: (postId: number) => `/api/v1/posts/${postId}/comments`,
  CREATE: (postId: number) => `/api/v1/posts/${postId}/comments`,
  UPDATE: (postId: number, id: number) => `/api/v1/posts/${postId}/comments/${id}`,
  DELETE: (postId: number, id: number) => `/api/v1/posts/${postId}/comments/${id}`,
} as const

export const FILE_ENDPOINTS = {
  PRESIGNED_URL: '/api/v1/files/presigned-url',
  REGISTER: (postId: number) => `/api/v1/posts/${postId}/attachments`,
  DELETE: (postId: number, attachmentId: number) =>
    `/api/v1/posts/${postId}/attachments/${attachmentId}`,
} as const
