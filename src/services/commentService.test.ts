import { beforeEach, describe, expect, it, vi } from 'vitest'
import { commentService } from './commentService'

vi.mock('@/lib/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

const createMockAxiosError = (status?: number, message?: string) => ({
  isAxiosError: true as const,
  response: status !== undefined ? { status, data: message ? { message } : {} } : undefined,
})

const mockComment = {
  id: 1,
  postId: 1,
  authorId: 2,
  authorNickname: '댓글작성자',
  content: '테스트 댓글',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

describe('commentService.getComments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('성공 시 Comment 배열을 반환한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { data: [mockComment], error: null, meta: null },
    })

    const result = await commentService.getComments(1)
    expect(result).toEqual([mockComment])
    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/posts/1/comments')
  })

  it('500 에러 시 SERVER_ERROR AppError를 throw한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.get).mockRejectedValueOnce(createMockAxiosError(500))

    await expect(commentService.getComments(1)).rejects.toMatchObject({ code: 'SERVER_ERROR' })
  })
})

describe('commentService.createComment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('성공 시 생성된 Comment를 반환한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { data: mockComment, error: null, meta: null },
    })

    const result = await commentService.createComment(1, { content: '테스트 댓글' })
    expect(result).toEqual(mockComment)
    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/posts/1/comments', {
      content: '테스트 댓글',
    })
  })

  it('401 에러 시 UNAUTHORIZED AppError를 throw한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.post).mockRejectedValueOnce(createMockAxiosError(401))

    await expect(commentService.createComment(1, { content: '댓글' })).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    })
  })
})

describe('commentService.updateComment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('성공 시 수정된 Comment를 반환한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    const updated = { ...mockComment, content: '수정된 댓글' }
    vi.mocked(apiClient.patch).mockResolvedValueOnce({
      data: { data: updated, error: null, meta: null },
    })

    const result = await commentService.updateComment(1, 1, { content: '수정된 댓글' })
    expect(result).toEqual(updated)
    expect(apiClient.patch).toHaveBeenCalledWith('/api/v1/posts/1/comments/1', {
      content: '수정된 댓글',
    })
  })

  it('403 에러 시 FORBIDDEN AppError를 throw한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.patch).mockRejectedValueOnce(createMockAxiosError(403))

    await expect(commentService.updateComment(1, 1, { content: '수정' })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    })
  })
})

describe('commentService.deleteComment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('성공 시 void를 반환한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: {} })

    await expect(commentService.deleteComment(1, 1)).resolves.toBeUndefined()
    expect(apiClient.delete).toHaveBeenCalledWith('/api/v1/posts/1/comments/1')
  })

  it('403 에러 시 FORBIDDEN AppError를 throw한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.delete).mockRejectedValueOnce(createMockAxiosError(403))

    await expect(commentService.deleteComment(1, 1)).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })
})
