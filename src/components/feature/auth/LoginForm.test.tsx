import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    mockOnSubmit.mockReset()
  })

  it('이메일, 비밀번호 필드와 로그인 버튼이 렌더링된다', () => {
    render(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />)
    expect(screen.getByLabelText('이메일')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument()
  })

  it('유효한 데이터 제출 시 onSubmit을 호출한다', async () => {
    render(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />)

    fireEvent.change(screen.getByLabelText('이메일'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText('비밀번호'), {
      target: { value: 'password1' },
    })
    fireEvent.click(screen.getByRole('button', { name: '로그인' }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password1',
      })
    })
  })

  it('유효하지 않은 이메일로 제출 시 에러를 표시하고 onSubmit을 호출하지 않는다', async () => {
    render(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />)

    fireEvent.change(screen.getByLabelText('이메일'), {
      target: { value: 'invalid-email' },
    })
    fireEvent.change(screen.getByLabelText('비밀번호'), {
      target: { value: 'password1' },
    })
    fireEvent.click(screen.getByRole('button', { name: '로그인' }))

    await waitFor(() => {
      expect(screen.getByText('올바른 이메일 형식이 아닙니다.')).toBeInTheDocument()
    })
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('비밀번호가 비어있으면 에러를 표시한다', async () => {
    render(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />)

    fireEvent.change(screen.getByLabelText('이메일'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: '로그인' }))

    await waitFor(() => {
      expect(screen.getByText('비밀번호를 입력해주세요.')).toBeInTheDocument()
    })
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('error prop이 있으면 API 에러 메시지를 alert로 표시한다', () => {
    render(
      <LoginForm
        onSubmit={mockOnSubmit}
        isLoading={false}
        error="이메일 또는 비밀번호가 잘못됐습니다."
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('이메일 또는 비밀번호가 잘못됐습니다.')
  })

  it('isLoading=true이면 제출 버튼이 비활성화된다', () => {
    render(<LoginForm onSubmit={mockOnSubmit} isLoading />)
    expect(screen.getByRole('button', { name: '로그인' })).toBeDisabled()
  })
})
