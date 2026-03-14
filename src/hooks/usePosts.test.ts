import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  useCreatePostMutation,
  useDeletePostMutation,
  useInfinitePosts,
  usePost,
  useUpdatePostMutation,
} from './usePosts'

const mockNavigate = vi.fn()
const mockInvalidateQueries = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('@/services/postService', () => ({
  postService: {
    getPosts: vi.fn(),
    getPost: vi.fn(),
    createPost: vi.fn(),
    updatePost: vi.fn(),
    deletePost: vi.fn(),
  },
}))

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

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: 0 },
      mutations: { retry: 0 },
    },
  })
  // invalidateQueries를 mock으로 대체
  queryClient.invalidateQueries = mockInvalidateQueries
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useInfinitePosts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('search 파라미터를 postService.getPosts에 전달한다', async () => {
    const { postService } = await import('@/services/postService')
    vi.mocked(postService.getPosts).mockResolvedValue({ data: [mockPost], nextCursor: null })

    const { result } = renderHook(() => useInfinitePosts({ search: '검색어' }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(postService.getPosts).toHaveBeenCalledWith(expect.objectContaining({ search: '검색어' }))
  })

  it('파라미터 없이 호출해도 정상 동작한다', async () => {
    const { postService } = await import('@/services/postService')
    vi.mocked(postService.getPosts).mockResolvedValue({ data: [mockPost], nextCursor: null })

    const { result } = renderHook(() => useInfinitePosts(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.pages[0].data).toEqual([mockPost])
  })
})

describe('usePost', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('성공 시 Post 데이터를 반환한다', async () => {
    const { postService } = await import('@/services/postService')
    vi.mocked(postService.getPost).mockResolvedValue(mockPost)

    const { result } = renderHook(() => usePost(1), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockPost)
  })

  it('실패 시 에러 상태가 된다', async () => {
    const { postService } = await import('@/services/postService')
    vi.mocked(postService.getPost).mockRejectedValue({ code: 'NOT_FOUND', message: '없음' })

    const { result } = renderHook(() => usePost(999), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useCreatePostMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('성공 시 invalidateQueries와 navigate를 호출한다', async () => {
    const { postService } = await import('@/services/postService')
    vi.mocked(postService.createPost).mockResolvedValue(mockPost)
    mockInvalidateQueries.mockResolvedValue(undefined)

    const { result } = renderHook(() => useCreatePostMutation(), { wrapper: createWrapper() })

    result.current.mutate({ title: '제목', content: '내용' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['posts'] })
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/posts/$postId',
      params: { postId: '1' },
    })
  })

  it('실패 시 에러 상태가 된다', async () => {
    const { postService } = await import('@/services/postService')
    vi.mocked(postService.createPost).mockRejectedValue({
      code: 'UNAUTHORIZED',
      message: '인증 필요',
    })

    const { result } = renderHook(() => useCreatePostMutation(), { wrapper: createWrapper() })

    result.current.mutate({ title: '제목', content: '내용' })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})

describe('useUpdatePostMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('성공 시 invalidateQueries와 navigate를 호출한다', async () => {
    const { postService } = await import('@/services/postService')
    vi.mocked(postService.updatePost).mockResolvedValue({ ...mockPost, title: '수정됨' })
    mockInvalidateQueries.mockResolvedValue(undefined)

    const { result } = renderHook(() => useUpdatePostMutation(1), { wrapper: createWrapper() })

    result.current.mutate({ title: '수정됨' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['posts', 1] })
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/posts/$postId',
      params: { postId: '1' },
    })
  })

  it('실패 시 에러 상태가 된다', async () => {
    const { postService } = await import('@/services/postService')
    vi.mocked(postService.updatePost).mockRejectedValue({ code: 'FORBIDDEN', message: '권한 없음' })

    const { result } = renderHook(() => useUpdatePostMutation(1), { wrapper: createWrapper() })

    result.current.mutate({ title: '수정됨' })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})

describe('useDeletePostMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('성공 시 invalidateQueries와 navigate("/")를 호출한다', async () => {
    const { postService } = await import('@/services/postService')
    vi.mocked(postService.deletePost).mockResolvedValue(undefined)
    mockInvalidateQueries.mockResolvedValue(undefined)

    const { result } = renderHook(() => useDeletePostMutation(), { wrapper: createWrapper() })

    result.current.mutate(1)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['posts'] })
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
  })

  it('실패 시 에러 상태가 된다', async () => {
    const { postService } = await import('@/services/postService')
    vi.mocked(postService.deletePost).mockRejectedValue({ code: 'FORBIDDEN', message: '권한 없음' })

    const { result } = renderHook(() => useDeletePostMutation(), { wrapper: createWrapper() })

    result.current.mutate(1)

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
