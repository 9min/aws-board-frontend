import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PostForm } from './PostForm'

describe('PostForm', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('제목과 내용 입력 필드를 렌더링한다', () => {
    render(<PostForm onSubmit={mockOnSubmit} isLoading={false} />)
    expect(screen.getByLabelText('제목')).toBeInTheDocument()
    expect(screen.getByLabelText('내용')).toBeInTheDocument()
  })

  it('기본 제출 버튼 라벨은 "저장"이다', () => {
    render(<PostForm onSubmit={mockOnSubmit} isLoading={false} />)
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument()
  })

  it('submitLabel prop으로 버튼 라벨을 변경한다', () => {
    render(<PostForm onSubmit={mockOnSubmit} isLoading={false} submitLabel="게시하기" />)
    expect(screen.getByRole('button', { name: '게시하기' })).toBeInTheDocument()
  })

  it('defaultValues로 초기값을 설정한다', () => {
    render(
      <PostForm
        onSubmit={mockOnSubmit}
        isLoading={false}
        defaultValues={{ title: '초기 제목', content: '초기 내용' }}
      />,
    )
    expect(screen.getByLabelText('제목')).toHaveValue('초기 제목')
    expect(screen.getByLabelText('내용')).toHaveValue('초기 내용')
  })

  it('외부 error prop이 있으면 에러 메시지를 표시한다', () => {
    render(<PostForm onSubmit={mockOnSubmit} isLoading={false} error="서버 오류가 발생했습니다." />)
    expect(screen.getByRole('alert')).toHaveTextContent('서버 오류가 발생했습니다.')
  })

  it('제목 없이 제출 시 유효성 에러를 표시한다', async () => {
    const user = userEvent.setup()
    render(<PostForm onSubmit={mockOnSubmit} isLoading={false} />)

    await user.type(screen.getByLabelText('내용'), '내용만 입력')
    await user.click(screen.getByRole('button', { name: '저장' }))

    await waitFor(() => {
      expect(screen.getByText('제목을 입력해주세요.')).toBeInTheDocument()
    })
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('내용 없이 제출 시 유효성 에러를 표시한다', async () => {
    const user = userEvent.setup()
    render(<PostForm onSubmit={mockOnSubmit} isLoading={false} />)

    await user.type(screen.getByLabelText('제목'), '제목만 입력')
    await user.click(screen.getByRole('button', { name: '저장' }))

    await waitFor(() => {
      expect(screen.getByText('내용을 입력해주세요.')).toBeInTheDocument()
    })
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('유효한 데이터 제출 시 onSubmit을 호출한다', async () => {
    const user = userEvent.setup()
    render(<PostForm onSubmit={mockOnSubmit} isLoading={false} />)

    await user.type(screen.getByLabelText('제목'), '테스트 제목')
    await user.type(screen.getByLabelText('내용'), '테스트 내용')
    await user.click(screen.getByRole('button', { name: '저장' }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: '테스트 제목',
        content: '테스트 내용',
      })
    })
  })

  it('제목이 100자를 초과하면 유효성 에러를 표시한다', async () => {
    const user = userEvent.setup()
    render(<PostForm onSubmit={mockOnSubmit} isLoading={false} />)

    await user.type(screen.getByLabelText('제목'), 'a'.repeat(101))
    await user.type(screen.getByLabelText('내용'), '내용')
    await user.click(screen.getByRole('button', { name: '저장' }))

    await waitFor(() => {
      expect(screen.getByText('제목은 100자 이하로 입력해주세요.')).toBeInTheDocument()
    })
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('isLoading이 true이면 버튼이 비활성화된다', () => {
    render(<PostForm onSubmit={mockOnSubmit} isLoading={true} />)
    expect(screen.getByRole('button', { name: /저장/ })).toBeDisabled()
  })
})
