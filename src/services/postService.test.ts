import { beforeEach, describe, expect, it, vi } from 'vitest'
import { postService } from './postService'

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

const mockPost = {
  id: 1,
  title: '테스트 제목',
  content: '테스트 내용',
  authorId: 1,
  author: { id: 1, nickname: '테스터' },
  viewCount: 10,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

describe('postService.getPosts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('성공 시 PostListResponse를 반환한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { data: { items: [mockPost], nextCursor: null }, error: null, meta: null },
    })

    const result = await postService.getPosts()
    expect(result).toEqual({ data: [mockPost], nextCursor: null })
  })

  it('페이지네이션 파라미터와 함께 호출된다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { data: { items: [], nextCursor: null }, error: null, meta: null },
    })

    await postService.getPosts({ cursor: 5, limit: 10 })
    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/posts', {
      params: { cursor: 5, limit: 10 },
    })
  })

  it('500 에러 시 SERVER_ERROR AppError를 throw한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.get).mockRejectedValueOnce(createMockAxiosError(500))

    await expect(postService.getPosts()).rejects.toMatchObject({ code: 'SERVER_ERROR' })
  })
})

describe('postService.getPost', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('성공 시 Post를 반환한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { data: mockPost, error: null, meta: null },
    })

    const result = await postService.getPost(1)
    expect(result).toEqual(mockPost)
  })

  it('404 에러 시 NOT_FOUND AppError를 throw한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.get).mockRejectedValueOnce(createMockAxiosError(404))

    await expect(postService.getPost(999)).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })
})

describe('postService.createPost', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('성공 시 생성된 Post를 반환한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { data: mockPost, error: null, meta: null },
    })

    const result = await postService.createPost({ title: '제목', content: '내용' })
    expect(result).toEqual(mockPost)
  })

  it('401 에러 시 UNAUTHORIZED AppError를 throw한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.post).mockRejectedValueOnce(createMockAxiosError(401))

    await expect(postService.createPost({ title: '제목', content: '내용' })).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    })
  })
})

describe('postService.updatePost', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('성공 시 수정된 Post를 반환한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    const updatedPost = { ...mockPost, title: '수정된 제목' }
    vi.mocked(apiClient.patch).mockResolvedValueOnce({
      data: { data: updatedPost, error: null, meta: null },
    })

    const result = await postService.updatePost(1, { title: '수정된 제목' })
    expect(result).toEqual(updatedPost)
  })

  it('403 에러 시 FORBIDDEN AppError를 throw한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.patch).mockRejectedValueOnce(createMockAxiosError(403))

    await expect(postService.updatePost(1, { title: '제목' })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    })
  })
})

describe('postService.getPagedPosts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('page=1 파라미터로 API를 호출한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        data: { items: [mockPost], total: 1, page: 1, totalPages: 1, limit: 10 },
        error: null,
        meta: null,
      },
    })

    await postService.getPagedPosts({ page: 1 })
    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/posts', {
      params: { page: 1 },
    })
  })

  it('응답에서 total, totalPages, page, limit을 반환한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        data: { items: [mockPost], total: 100, page: 2, totalPages: 10, limit: 10 },
        error: null,
        meta: null,
      },
    })

    const result = await postService.getPagedPosts({ page: 2, limit: 10 })
    expect(result).toEqual({
      data: [mockPost],
      total: 100,
      page: 2,
      totalPages: 10,
      limit: 10,
    })
  })
})

describe('postService.deletePost', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('성공 시 void를 반환한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: {} })

    await expect(postService.deletePost(1)).resolves.toBeUndefined()
  })

  it('403 에러 시 FORBIDDEN AppError를 throw한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.delete).mockRejectedValueOnce(createMockAxiosError(403))

    await expect(postService.deletePost(1)).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })
})
