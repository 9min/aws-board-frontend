export interface PresignedPostResponse {
  url: string
  fields: Record<string, string>
}

export interface RegisterAttachmentRequest {
  key: string
}

export interface Attachment {
  id: number
  postId: number
  key: string
  url: string
  createdAt: string
}
