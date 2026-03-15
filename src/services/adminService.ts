import { ADMIN_ENDPOINTS } from '@/constants/apiEndpoints'
import { apiClient } from '@/lib/apiClient'
import type {
  AdminComment,
  AdminDashboardStats,
  AdminPagedResponse,
  AdminPaginationParams,
  AdminPost,
  AdminUser,
} from '@/types/admin'
import { handleApiError } from '@/utils/error'

interface ApiEnvelope<T> {
  data: T
  error: string | null
  meta: unknown
}

interface PagedListData<T> {
  items: T[]
  total: number
  page: number
  totalPages: number
  limit: number
}

export const adminService = {
  async getDashboard(): Promise<AdminDashboardStats> {
    try {
      const response = await apiClient.get<ApiEnvelope<AdminDashboardStats>>(
        ADMIN_ENDPOINTS.DASHBOARD,
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async getUsers(params: AdminPaginationParams): Promise<AdminPagedResponse<AdminUser>> {
    try {
      const response = await apiClient.get<ApiEnvelope<PagedListData<AdminUser>>>(
        ADMIN_ENDPOINTS.USERS,
        { params },
      )
      const { items, total, page, totalPages, limit } = response.data.data
      return { data: items, total, page, totalPages, limit }
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async getUser(id: number): Promise<AdminUser> {
    try {
      const response = await apiClient.get<ApiEnvelope<AdminUser>>(ADMIN_ENDPOINTS.USER_DETAIL(id))
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async deleteUser(id: number): Promise<void> {
    try {
      await apiClient.delete(ADMIN_ENDPOINTS.USER_DETAIL(id))
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async getPosts(params: AdminPaginationParams): Promise<AdminPagedResponse<AdminPost>> {
    try {
      const response = await apiClient.get<ApiEnvelope<PagedListData<AdminPost>>>(
        ADMIN_ENDPOINTS.POSTS,
        { params },
      )
      const { items, total, page, totalPages, limit } = response.data.data
      return { data: items, total, page, totalPages, limit }
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async getPost(id: number): Promise<AdminPost> {
    try {
      const response = await apiClient.get<ApiEnvelope<AdminPost>>(ADMIN_ENDPOINTS.POST_DETAIL(id))
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async deletePost(id: number): Promise<void> {
    try {
      await apiClient.delete(ADMIN_ENDPOINTS.POST_DETAIL(id))
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async getComments(
    params: AdminPaginationParams & { postId?: number },
  ): Promise<AdminPagedResponse<AdminComment>> {
    try {
      const response = await apiClient.get<ApiEnvelope<PagedListData<AdminComment>>>(
        ADMIN_ENDPOINTS.COMMENTS,
        { params },
      )
      const { items, total, page, totalPages, limit } = response.data.data
      return { data: items, total, page, totalPages, limit }
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async deleteComment(id: number): Promise<void> {
    try {
      await apiClient.delete(ADMIN_ENDPOINTS.COMMENT_DETAIL(id))
    } catch (error) {
      throw handleApiError(error)
    }
  },
}
