import { FILE_ENDPOINTS } from '@/constants/apiEndpoints'
import { apiClient } from '@/lib/apiClient'
import type { Attachment, PresignedPostResponse, RegisterAttachmentRequest } from '@/types/file'
import { handleApiError } from '@/utils/error'

interface ApiEnvelope<T> {
  data: T
  error: string | null
  meta: unknown
}

export const fileService = {
  async getPresignedUrl(fileName: string, mimeType: string): Promise<PresignedPostResponse> {
    try {
      const response = await apiClient.post<ApiEnvelope<PresignedPostResponse>>(
        FILE_ENDPOINTS.PRESIGNED_URL,
        { fileName, contentType: mimeType },
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async uploadToS3(presigned: PresignedPostResponse, file: File): Promise<void> {
    const formData = new FormData()
    for (const [key, value] of Object.entries(presigned.fields)) {
      formData.append(key, value)
    }
    formData.append('file', file)

    const response = await fetch(presigned.url, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw { code: 'UPLOAD_FAILED', message: '파일 업로드에 실패했습니다.' }
    }
  },

  async registerAttachment(postId: number, body: RegisterAttachmentRequest): Promise<Attachment> {
    try {
      const response = await apiClient.post<ApiEnvelope<Attachment>>(
        FILE_ENDPOINTS.REGISTER(postId),
        body,
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async deleteAttachment(postId: number, attachmentId: number): Promise<void> {
    try {
      await apiClient.delete(FILE_ENDPOINTS.DELETE(postId, attachmentId))
    } catch (error) {
      throw handleApiError(error)
    }
  },
}
