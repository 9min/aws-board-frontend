import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CommentForm } from './CommentForm'

const mockUseAuth = vi.fn()

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

describe('CommentForm', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('미인증 상태', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false, user: null })
    })

    it('로그인 안내 메시지를 표시한다', () => {
      render(<CommentForm onSubmit={mockOnSubmit} isLoading={false} />)
      expect(screen.getByText('로그인 후 댓글을 작성할 수 있습니다.')).toBeInTheDocument()
    })

    it('폼을 렌더링하지 않는다', () => {
      render(<CommentForm onSubmit={mockOnSubmit} isLoading={false} />)
      expect(screen.queryByRole('form')).not.toBeInTheDocument()
    })
  })

  describe('인증 상태', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: 1, email: 'test@test.com' },
      })
    })

    it('댓글 내용 입력 필드를 렌더링한다', () => {
      render(<CommentForm onSubmit={mockOnSubmit} isLoading={false} />)
      expect(screen.getByRole('textbox', { name: '댓글 내용' })).toBeInTheDocument()
    })

    it('기본 제출 버튼 라벨은 "댓글 작성"이다', () => {
      render(<CommentForm onSubmit={mockOnSubmit} isLoading={false} />)
      expect(screen.getByRole('button', { name: '댓글 작성' })).toBeInTheDocument()
    })

    it('submitLabel prop으로 버튼 라벨을 변경한다', () => {
      render(<CommentForm onSubmit={mockOnSubmit} isLoading={false} submitLabel="댓글 수정" />)
      expect(screen.getByRole('button', { name: '댓글 수정' })).toBeInTheDocument()
    })

    it('defaultValue로 초기값을 설정한다', () => {
      render(<CommentForm onSubmit={mockOnSubmit} isLoading={false} defaultValue="기존 댓글" />)
      expect(screen.getByRole('textbox', { name: '댓글 내용' })).toHaveValue('기존 댓글')
    })

    it('onCancel이 있을 때 취소 버튼을 표시한다', () => {
      const mockCancel = vi.fn()
      render(<CommentForm onSubmit={mockOnSubmit} isLoading={false} onCancel={mockCancel} />)
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument()
    })

    it('onCancel이 없을 때 취소 버튼을 표시하지 않는다', () => {
      render(<CommentForm onSubmit={mockOnSubmit} isLoading={false} />)
      expect(screen.queryByRole('button', { name: '취소' })).not.toBeInTheDocument()
    })

    it('외부 error prop이 있으면 에러 메시지를 표시한다', () => {
      render(<CommentForm onSubmit={mockOnSubmit} isLoading={false} error="서버 오류입니다." />)
      expect(screen.getByRole('alert')).toHaveTextContent('서버 오류입니다.')
    })

    it('내용 없이 제출 시 유효성 에러를 표시한다', async () => {
      const user = userEvent.setup()
      render(<CommentForm onSubmit={mockOnSubmit} isLoading={false} />)

      await user.click(screen.getByRole('button', { name: '댓글 작성' }))

      await waitFor(() => {
        expect(screen.getByText('댓글 내용을 입력해주세요.')).toBeInTheDocument()
      })
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('500자를 초과하면 유효성 에러를 표시한다', async () => {
      const user = userEvent.setup()
      render(<CommentForm onSubmit={mockOnSubmit} isLoading={false} />)

      fireEvent.change(screen.getByRole('textbox', { name: '댓글 내용' }), {
        target: { value: 'a'.repeat(501) },
      })
      await user.click(screen.getByRole('button', { name: '댓글 작성' }))

      await waitFor(() => {
        expect(screen.getByText('댓글은 500자 이하로 입력해주세요.')).toBeInTheDocument()
      })
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('유효한 데이터 제출 시 onSubmit을 호출한다', async () => {
      const user = userEvent.setup()
      render(<CommentForm onSubmit={mockOnSubmit} isLoading={false} />)

      fireEvent.change(screen.getByRole('textbox', { name: '댓글 내용' }), {
        target: { value: '테스트 댓글' },
      })
      await user.click(screen.getByRole('button', { name: '댓글 작성' }))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({ content: '테스트 댓글' })
      })
    })

    it('isLoading이 true이면 버튼이 비활성화된다', () => {
      render(<CommentForm onSubmit={mockOnSubmit} isLoading={true} />)
      expect(screen.getByRole('button', { name: /댓글 작성/ })).toBeDisabled()
    })
  })
})
