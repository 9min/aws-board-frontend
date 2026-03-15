import { beforeEach, describe, expect, it, vi } from 'vitest'
import { adminService } from './adminService'

vi.mock('@/lib/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    delete: vi.fn(),
  },
}))

const createMockAxiosError = (status?: number, message?: string) => ({
  isAxiosError: true as const,
  response: status !== undefined ? { status, data: message ? { message } : {} } : undefined,
})

const mockDashboard = { totalUsers: 10, totalPosts: 50, totalComments: 200 }

const mockUser = {
  id: 1,
  email: 'test@example.com',
  nickname: '테스터',
  isAdmin: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  postCount: 5,
  commentCount: 10,
}

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

const mockComment = {
  id: 1,
  content: '테스트 댓글',
  authorId: 1,
  author: { id: 1, nickname: '테스터' },
  postId: 1,
  post: { id: 1, title: '테스트 제목' },
  createdAt: '2024-01-01T00:00:00.000Z',
}

const mockPagedResponse = <T>(items: T[]) => ({
  data: { data: { items, total: items.length, page: 1, totalPages: 1, limit: 10 }, error: null, meta: null },
})

describe('adminService.getDashboard', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('성공 시 대시보드 통계를 반환한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { data: mockDashboard, error: null, meta: null },
    })

    const result = await adminService.getDashboard()
    expect(result).toEqual(mockDashboard)
  })

  it('403 에러 시 FORBIDDEN AppError를 throw한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.get).mockRejectedValueOnce(createMockAxiosError(403))

    await expect(adminService.getDashboard()).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })
})

describe('adminService.getUsers', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('성공 시 회원 목록을 반환한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.get).mockResolvedValueOnce(mockPagedResponse([mockUser]))

    const result = await adminService.getUsers({ page: 1 })
    expect(result.data).toEqual([mockUser])
    expect(result.total).toBe(1)
  })

  it('page, search 파라미터를 전달한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.get).mockResolvedValueOnce(mockPagedResponse([]))

    await adminService.getUsers({ page: 2, search: '검색어' })
    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/admin/users', {
      params: { page: 2, search: '검색어' },
    })
  })
})

describe('adminService.getUser', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('성공 시 회원 상세를 반환한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { data: mockUser, error: null, meta: null },
    })

    const result = await adminService.getUser(1)
    expect(result).toEqual(mockUser)
  })

  it('404 에러 시 NOT_FOUND AppError를 throw한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.get).mockRejectedValueOnce(createMockAxiosError(404))

    await expect(adminService.getUser(999)).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })
})

describe('adminService.deleteUser', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('성공 시 void를 반환한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: {} })

    await expect(adminService.deleteUser(1)).resolves.toBeUndefined()
  })

  it('404 에러 시 NOT_FOUND AppError를 throw한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.delete).mockRejectedValueOnce(createMockAxiosError(404))

    await expect(adminService.deleteUser(999)).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })
})

describe('adminService.getPosts', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('성공 시 게시글 목록을 반환한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.get).mockResolvedValueOnce(mockPagedResponse([mockPost]))

    const result = await adminService.getPosts({ page: 1 })
    expect(result.data).toEqual([mockPost])
  })

  it('search 파라미터를 전달한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.get).mockResolvedValueOnce(mockPagedResponse([]))

    await adminService.getPosts({ page: 1, search: '검색' })
    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/admin/posts', {
      params: { page: 1, search: '검색' },
    })
  })
})

describe('adminService.getPost', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('성공 시 게시글 상세를 반환한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { data: mockPost, error: null, meta: null },
    })

    const result = await adminService.getPost(1)
    expect(result).toEqual(mockPost)
  })
})

describe('adminService.deletePost', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('성공 시 void를 반환한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: {} })

    await expect(adminService.deletePost(1)).resolves.toBeUndefined()
  })

  it('404 에러 시 NOT_FOUND AppError를 throw한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.delete).mockRejectedValueOnce(createMockAxiosError(404))

    await expect(adminService.deletePost(999)).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })
})

describe('adminService.getComments', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('성공 시 댓글 목록을 반환한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.get).mockResolvedValueOnce(mockPagedResponse([mockComment]))

    const result = await adminService.getComments({ page: 1 })
    expect(result.data).toEqual([mockComment])
  })

  it('postId 필터 파라미터를 전달한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.get).mockResolvedValueOnce(mockPagedResponse([]))

    await adminService.getComments({ page: 1, postId: 5 })
    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/admin/comments', {
      params: { page: 1, postId: 5 },
    })
  })
})

describe('adminService.deleteComment', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('성공 시 void를 반환한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: {} })

    await expect(adminService.deleteComment(1)).resolves.toBeUndefined()
  })
})
