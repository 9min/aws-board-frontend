import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  useComments,
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useUpdateCommentMutation,
} from './useComments'

const mockInvalidateQueries = vi.fn()

vi.mock('@/services/commentService', () => ({
  commentService: {
    getComments: vi.fn(),
    createComment: vi.fn(),
    updateComment: vi.fn(),
    deleteComment: vi.fn(),
  },
}))

const mockComment = {
  id: 1,
  postId: 1,
  authorId: 2,
  authorNickname: '댓글작성자',
  content: '테스트 댓글',
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
  queryClient.invalidateQueries = mockInvalidateQueries
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useComments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('성공 시 Comment 배열을 반환한다', async () => {
    const { commentService } = await import('@/services/commentService')
    vi.mocked(commentService.getComments).mockResolvedValue([mockComment])

    const { result } = renderHook(() => useComments(1), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([mockComment])
  })

  it('실패 시 에러 상태가 된다', async () => {
    const { commentService } = await import('@/services/commentService')
    vi.mocked(commentService.getComments).mockRejectedValue({
      code: 'SERVER_ERROR',
      message: '오류',
    })

    const { result } = renderHook(() => useComments(1), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useCreateCommentMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('성공 시 invalidateQueries를 호출한다', async () => {
    const { commentService } = await import('@/services/commentService')
    vi.mocked(commentService.createComment).mockResolvedValue(mockComment)
    mockInvalidateQueries.mockResolvedValue(undefined)

    const { result } = renderHook(() => useCreateCommentMutation(1), { wrapper: createWrapper() })

    result.current.mutate({ content: '새 댓글' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['comments', 1] })
  })

  it('실패 시 에러 상태가 된다', async () => {
    const { commentService } = await import('@/services/commentService')
    vi.mocked(commentService.createComment).mockRejectedValue({
      code: 'UNAUTHORIZED',
      message: '인증 필요',
    })

    const { result } = renderHook(() => useCreateCommentMutation(1), { wrapper: createWrapper() })

    result.current.mutate({ content: '댓글' })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useUpdateCommentMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('성공 시 invalidateQueries를 호출한다', async () => {
    const { commentService } = await import('@/services/commentService')
    vi.mocked(commentService.updateComment).mockResolvedValue({ ...mockComment, content: '수정됨' })
    mockInvalidateQueries.mockResolvedValue(undefined)

    const { result } = renderHook(() => useUpdateCommentMutation(1), { wrapper: createWrapper() })

    result.current.mutate({ id: 1, body: { content: '수정됨' } })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['comments', 1] })
  })

  it('실패 시 에러 상태가 된다', async () => {
    const { commentService } = await import('@/services/commentService')
    vi.mocked(commentService.updateComment).mockRejectedValue({
      code: 'FORBIDDEN',
      message: '권한 없음',
    })

    const { result } = renderHook(() => useUpdateCommentMutation(1), { wrapper: createWrapper() })

    result.current.mutate({ id: 1, body: { content: '수정' } })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useDeleteCommentMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('성공 시 invalidateQueries를 호출한다', async () => {
    const { commentService } = await import('@/services/commentService')
    vi.mocked(commentService.deleteComment).mockResolvedValue(undefined)
    mockInvalidateQueries.mockResolvedValue(undefined)

    const { result } = renderHook(() => useDeleteCommentMutation(1), { wrapper: createWrapper() })

    result.current.mutate(1)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['comments', 1] })
  })

  it('실패 시 에러 상태가 된다', async () => {
    const { commentService } = await import('@/services/commentService')
    vi.mocked(commentService.deleteComment).mockRejectedValue({
      code: 'FORBIDDEN',
      message: '권한 없음',
    })

    const { result } = renderHook(() => useDeleteCommentMutation(1), { wrapper: createWrapper() })

    result.current.mutate(1)

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
