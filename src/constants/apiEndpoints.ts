export const AUTH_ENDPOINTS = {
  REGISTER: '/api/v1/auth/register',
  LOGIN: '/api/v1/auth/login',
  ME: '/api/v1/auth/me',
} as const

export const ADMIN_ENDPOINTS = {
  DASHBOARD: '/api/v1/admin/dashboard',
  USERS: '/api/v1/admin/users',
  USER_DETAIL: (id: number) => `/api/v1/admin/users/${id}`,
  POSTS: '/api/v1/admin/posts',
  POST_DETAIL: (id: number) => `/api/v1/admin/posts/${id}`,
  COMMENTS: '/api/v1/admin/comments',
  COMMENT_DETAIL: (id: number) => `/api/v1/admin/comments/${id}`,
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
