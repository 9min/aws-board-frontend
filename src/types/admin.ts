export interface AdminDashboardStats {
  totalUsers: number
  totalPosts: number
  totalComments: number
}

export interface AdminUser {
  id: number
  email: string
  nickname: string
  isAdmin: boolean
  createdAt: string
  postCount: number
  commentCount: number
}

export interface AdminPost {
  id: number
  title: string
  content: string
  authorId: number
  author: { id: number; nickname: string }
  viewCount: number
  createdAt: string
  updatedAt: string
}

export interface AdminComment {
  id: number
  content: string
  authorId: number
  author: { id: number; nickname: string }
  postId: number
  post: { id: number; title: string }
  createdAt: string
}

export interface AdminPaginationParams {
  page: number
  limit?: number
  search?: string
}

export interface AdminPagedResponse<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
  limit: number
}
