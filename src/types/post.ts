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
}

export interface PostListResponse {
  data: Post[]
  nextCursor: number | null
}
