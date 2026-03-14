import { COMMENT_ENDPOINTS } from '@/constants/apiEndpoints'
import { apiClient } from '@/lib/apiClient'
import type { Comment, CreateCommentRequest, UpdateCommentRequest } from '@/types/comment'
import { handleApiError } from '@/utils/error'

interface ApiEnvelope<T> {
  data: T
  error: string | null
  meta: unknown
}

export const commentService = {
  async getComments(postId: number): Promise<Comment[]> {
    try {
      const response = await apiClient.get<ApiEnvelope<Comment[]>>(COMMENT_ENDPOINTS.LIST(postId))
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async createComment(postId: number, body: CreateCommentRequest): Promise<Comment> {
    try {
      const response = await apiClient.post<ApiEnvelope<Comment>>(
        COMMENT_ENDPOINTS.CREATE(postId),
        body,
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async updateComment(postId: number, id: number, body: UpdateCommentRequest): Promise<Comment> {
    try {
      const response = await apiClient.patch<ApiEnvelope<Comment>>(
        COMMENT_ENDPOINTS.UPDATE(postId, id),
        body,
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async deleteComment(postId: number, id: number): Promise<void> {
    try {
      await apiClient.delete(COMMENT_ENDPOINTS.DELETE(postId, id))
    } catch (error) {
      throw handleApiError(error)
    }
  },
}
