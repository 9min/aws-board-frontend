export interface Comment {
  id: number
  postId: number
  authorId: number
  authorNickname: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface CreateCommentRequest {
  content: string
}

export interface UpdateCommentRequest {
  content: string
}
