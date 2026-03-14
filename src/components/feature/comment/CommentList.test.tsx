import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CommentList } from './CommentList'

const mockUseAuth = vi.fn()
const mockCreateMutate = vi.fn()
const mockUpdateMutate = vi.fn()
const mockDeleteMutate = vi.fn()

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock('@/hooks/useComments', () => ({
  useCreateCommentMutation: () => ({
    mutate: mockCreateMutate,
    isPending: false,
    isError: false,
    error: null,
  }),
  useUpdateCommentMutation: () => ({
    mutate: mockUpdateMutate,
    isPending: false,
    isError: false,
    error: null,
  }),
  useDeleteCommentMutation: () => ({
    mutate: mockDeleteMutate,
    isPending: false,
    isError: false,
    variables: undefined,
  }),
}))

const mockComments = [
  {
    id: 1,
    postId: 1,
    authorId: 2,
    authorNickname: '다른사용자',
    content: '다른 사람의 댓글',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    postId: 1,
    authorId: 1,
    authorNickname: '내닉네임',
    content: '내 댓글',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
]

describe('CommentList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({ isAuthenticated: true, user: { id: 1, email: 'me@test.com' } })
  })

  it('댓글 없을 때 안내 메시지를 표시한다', () => {
    render(<CommentList postId={1} comments={[]} />)
    expect(screen.getByText('아직 댓글이 없습니다.')).toBeInTheDocument()
  })

  it('댓글 목록을 렌더링한다', () => {
    render(<CommentList postId={1} comments={mockComments} />)
    expect(screen.getByText('다른 사람의 댓글')).toBeInTheDocument()
    expect(screen.getByText('내 댓글')).toBeInTheDocument()
    expect(screen.getByText('다른사용자')).toBeInTheDocument()
    expect(screen.getByText('내닉네임')).toBeInTheDocument()
  })

  it('본인 댓글에만 수정/삭제 버튼을 표시한다', () => {
    render(<CommentList postId={1} comments={mockComments} />)
    // 내 댓글(id:2, authorId:1)에만 버튼이 있어야 함
    const editButtons = screen.getAllByRole('button', { name: '수정' })
    // 하단 CommentForm의 수정 버튼은 없으니, 내 댓글 1개에만 수정 버튼
    expect(editButtons).toHaveLength(1)
    const deleteButtons = screen.getAllByRole('button', { name: '삭제' })
    expect(deleteButtons).toHaveLength(1)
  })

  it('수정 버튼 클릭 시 인라인 편집 모드로 전환된다', async () => {
    const user = userEvent.setup()
    render(<CommentList postId={1} comments={mockComments} />)

    await user.click(screen.getByRole('button', { name: '수정' }))

    expect(screen.getAllByRole('textbox', { name: '댓글 내용' })[0]).toHaveValue('내 댓글')
    expect(screen.getByRole('button', { name: '댓글 수정' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument()
  })

  it('인라인 편집에서 취소 클릭 시 일반 보기로 돌아간다', async () => {
    const user = userEvent.setup()
    render(<CommentList postId={1} comments={mockComments} />)

    await user.click(screen.getByRole('button', { name: '수정' }))
    await user.click(screen.getByRole('button', { name: '취소' }))

    expect(screen.getByText('내 댓글')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '취소' })).not.toBeInTheDocument()
  })

  it('삭제 버튼 클릭 시 confirm 후 deleteMutation을 호출한다', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValueOnce(true)
    render(<CommentList postId={1} comments={mockComments} />)

    await user.click(screen.getByRole('button', { name: '삭제' }))

    expect(window.confirm).toHaveBeenCalledWith('정말 삭제하시겠습니까?')
    expect(mockDeleteMutate).toHaveBeenCalledWith(
      2,
      expect.objectContaining({ onError: expect.any(Function) }),
    )
  })

  it('삭제 confirm 취소 시 deleteMutation을 호출하지 않는다', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValueOnce(false)
    render(<CommentList postId={1} comments={mockComments} />)

    await user.click(screen.getByRole('button', { name: '삭제' }))

    expect(mockDeleteMutate).not.toHaveBeenCalled()
  })
})
