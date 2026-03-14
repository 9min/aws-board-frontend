export interface PostAuthor {
  id: number
  nickname: string
}

export interface Post {
  id: number
  title: string
  content: string
  authorId: number
  author: PostAuthor
  viewCount: number
  createdAt: string
  updatedAt: string
  attachments?: import('./file').Attachment[]
}

export interface CreatePostRequest {
  title: string
  content: string
}

export interface UpdatePostRequest {
  title?: string
  content?: string
}

export interface PostSearchParams {
  cursor?: number
  limit?: number
  search?: string
  page?: number
}

export interface PostListResponse {
  data: Post[]
  nextCursor: number | null
}

export interface PagedPostListResponse {
  data: Post[]
  total: number
  page: number
  totalPages: number
  limit: number
}
