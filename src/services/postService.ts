import { POST_ENDPOINTS } from '@/constants/apiEndpoints'
import { apiClient } from '@/lib/apiClient'
import type {
  CreatePostRequest,
  PagedPostListResponse,
  Post,
  PostListResponse,
  PostSearchParams,
  UpdatePostRequest,
} from '@/types/post'
import { handleApiError } from '@/utils/error'

// 백엔드 공통 응답 래퍼
interface ApiEnvelope<T> {
  data: T
  error: string | null
  meta: unknown
}

// 목록 응답의 data 필드 구조
interface ListData<T> {
  items: T[]
  nextCursor: number | null
}

// 페이지 기반 목록 응답의 data 필드 구조
interface PagedListData<T> {
  items: T[]
  total: number
  page: number
  totalPages: number
  limit: number
}

export const postService = {
  async getPosts(params?: PostSearchParams): Promise<PostListResponse> {
    try {
      const response = await apiClient.get<ApiEnvelope<ListData<Post>>>(POST_ENDPOINTS.BASE, {
        params,
      })
      const { items, nextCursor } = response.data.data
      return { data: items, nextCursor }
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async getPagedPosts(params: {
    page: number
    limit?: number
    search?: string
  }): Promise<PagedPostListResponse> {
    try {
      const response = await apiClient.get<ApiEnvelope<PagedListData<Post>>>(POST_ENDPOINTS.BASE, {
        params,
      })
      const { items, total, page, totalPages, limit } = response.data.data
      return { data: items, total, page, totalPages, limit }
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async getPost(id: number): Promise<Post> {
    try {
      const response = await apiClient.get<ApiEnvelope<Post>>(POST_ENDPOINTS.DETAIL(id))
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async createPost(body: CreatePostRequest): Promise<Post> {
    try {
      const response = await apiClient.post<ApiEnvelope<Post>>(POST_ENDPOINTS.BASE, body)
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async updatePost(id: number, body: UpdatePostRequest): Promise<Post> {
    try {
      const response = await apiClient.patch<ApiEnvelope<Post>>(POST_ENDPOINTS.DETAIL(id), body)
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async deletePost(id: number): Promise<void> {
    try {
      await apiClient.delete(POST_ENDPOINTS.DETAIL(id))
    } catch (error) {
      throw handleApiError(error)
    }
  },
}
