import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  useAdminComments,
  useAdminDashboard,
  useAdminPost,
  useAdminPosts,
  useAdminUser,
  useAdminUsers,
  useDeleteAdminCommentMutation,
  useDeleteAdminPostMutation,
  useDeleteAdminUserMutation,
} from './useAdmin'

const mockNavigate = vi.fn()
const mockInvalidateQueries = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('@/services/adminService', () => ({
  adminService: {
    getDashboard: vi.fn(),
    getUsers: vi.fn(),
    getUser: vi.fn(),
    deleteUser: vi.fn(),
    getPosts: vi.fn(),
    getPost: vi.fn(),
    deletePost: vi.fn(),
    getComments: vi.fn(),
    deleteComment: vi.fn(),
  },
}))

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
const mockPagedResult = <T>(items: T[]) => ({
  data: items,
  total: items.length,
  page: 1,
  totalPages: 1,
  limit: 10,
})

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: 0 },
      mutations: { retry: 0 },
    },
  })
  queryClient.invalidateQueries = mockInvalidateQueries
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useAdminDashboard', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('성공 시 대시보드 통계를 반환한다', async () => {
    const { adminService } = await import('@/services/adminService')
    vi.mocked(adminService.getDashboard).mockResolvedValue(mockDashboard)

    const { result } = renderHook(() => useAdminDashboard(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockDashboard)
  })
})

describe('useAdminUsers', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('page와 search를 파라미터로 받아 회원 목록을 반환한다', async () => {
    const { adminService } = await import('@/services/adminService')
    vi.mocked(adminService.getUsers).mockResolvedValue(mockPagedResult([mockUser]))

    const { result } = renderHook(() => useAdminUsers({ page: 1 }), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toEqual([mockUser])
  })
})

describe('useAdminUser', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('성공 시 회원 상세를 반환한다', async () => {
    const { adminService } = await import('@/services/adminService')
    vi.mocked(adminService.getUser).mockResolvedValue(mockUser)

    const { result } = renderHook(() => useAdminUser(1), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockUser)
  })
})

describe('useAdminPosts', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('성공 시 게시글 목록을 반환한다', async () => {
    const { adminService } = await import('@/services/adminService')
    vi.mocked(adminService.getPosts).mockResolvedValue(mockPagedResult([mockPost]))

    const { result } = renderHook(() => useAdminPosts({ page: 1 }), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toEqual([mockPost])
  })
})

describe('useAdminPost', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('성공 시 게시글 상세를 반환한다', async () => {
    const { adminService } = await import('@/services/adminService')
    vi.mocked(adminService.getPost).mockResolvedValue(mockPost)

    const { result } = renderHook(() => useAdminPost(1), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockPost)
  })
})

describe('useAdminComments', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('성공 시 댓글 목록을 반환한다', async () => {
    const { adminService } = await import('@/services/adminService')
    vi.mocked(adminService.getComments).mockResolvedValue(mockPagedResult([mockComment]))

    const { result } = renderHook(() => useAdminComments({ page: 1 }), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toEqual([mockComment])
  })
})

describe('useDeleteAdminUserMutation', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('성공 시 users 쿼리를 invalidate한다', async () => {
    const { adminService } = await import('@/services/adminService')
    vi.mocked(adminService.deleteUser).mockResolvedValue(undefined)
    mockInvalidateQueries.mockResolvedValue(undefined)

    const { result } = renderHook(() => useDeleteAdminUserMutation(), { wrapper: createWrapper() })

    result.current.mutate(1)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['admin', 'users'] })
  })
})

describe('useDeleteAdminPostMutation', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('성공 시 posts 쿼리를 invalidate한다', async () => {
    const { adminService } = await import('@/services/adminService')
    vi.mocked(adminService.deletePost).mockResolvedValue(undefined)
    mockInvalidateQueries.mockResolvedValue(undefined)

    const { result } = renderHook(() => useDeleteAdminPostMutation(), { wrapper: createWrapper() })

    result.current.mutate(1)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['admin', 'posts'] })
  })
})

describe('useDeleteAdminCommentMutation', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('성공 시 comments 쿼리를 invalidate한다', async () => {
    const { adminService } = await import('@/services/adminService')
    vi.mocked(adminService.deleteComment).mockResolvedValue(undefined)
    mockInvalidateQueries.mockResolvedValue(undefined)

    const { result } = renderHook(() => useDeleteAdminCommentMutation(), { wrapper: createWrapper() })

    result.current.mutate(1)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['admin', 'comments'] })
  })
})
