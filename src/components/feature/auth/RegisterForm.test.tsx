import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RegisterForm } from './RegisterForm'

describe('RegisterForm', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    mockOnSubmit.mockReset()
  })

  it('이메일, 비밀번호, 비밀번호 확인, 닉네임 필드와 회원가입 버튼이 렌더링된다', () => {
    render(<RegisterForm onSubmit={mockOnSubmit} isLoading={false} />)
    expect(screen.getByLabelText('이메일')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호 확인')).toBeInTheDocument()
    expect(screen.getByLabelText('닉네임')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '회원가입' })).toBeInTheDocument()
  })

  it('유효한 데이터 제출 시 onSubmit을 호출하며 passwordConfirm은 포함하지 않는다', async () => {
    render(<RegisterForm onSubmit={mockOnSubmit} isLoading={false} />)

    fireEvent.change(screen.getByLabelText('이메일'), {
      target: { value: 'new@example.com' },
    })
    fireEvent.change(screen.getByLabelText('비밀번호'), {
      target: { value: 'password1' },
    })
    fireEvent.change(screen.getByLabelText('비밀번호 확인'), {
      target: { value: 'password1' },
    })
    fireEvent.change(screen.getByLabelText('닉네임'), {
      target: { value: '테스터' },
    })
    fireEvent.click(screen.getByRole('button', { name: '회원가입' }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password1',
        nickname: '테스터',
      })
    })
    expect(mockOnSubmit.mock.calls[0][0]).not.toHaveProperty('passwordConfirm')
  })

  it('8자 미만 비밀번호 제출 시 에러를 표시한다', async () => {
    render(<RegisterForm onSubmit={mockOnSubmit} isLoading={false} />)

    fireEvent.change(screen.getByLabelText('이메일'), {
      target: { value: 'new@example.com' },
    })
    fireEvent.change(screen.getByLabelText('비밀번호'), {
      target: { value: 'abc1' },
    })
    fireEvent.change(screen.getByLabelText('비밀번호 확인'), {
      target: { value: 'abc1' },
    })
    fireEvent.change(screen.getByLabelText('닉네임'), {
      target: { value: '테스터' },
    })
    fireEvent.click(screen.getByRole('button', { name: '회원가입' }))

    await waitFor(() => {
      expect(screen.getByText('비밀번호는 8자 이상이어야 합니다.')).toBeInTheDocument()
    })
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('영문자 없는 비밀번호 제출 시 에러를 표시한다', async () => {
    render(<RegisterForm onSubmit={mockOnSubmit} isLoading={false} />)

    fireEvent.change(screen.getByLabelText('이메일'), {
      target: { value: 'new@example.com' },
    })
    fireEvent.change(screen.getByLabelText('비밀번호'), {
      target: { value: '12345678' },
    })
    fireEvent.change(screen.getByLabelText('비밀번호 확인'), {
      target: { value: '12345678' },
    })
    fireEvent.change(screen.getByLabelText('닉네임'), {
      target: { value: '테스터' },
    })
    fireEvent.click(screen.getByRole('button', { name: '회원가입' }))

    await waitFor(() => {
      expect(screen.getByText('비밀번호에 영문자와 숫자가 포함되어야 합니다.')).toBeInTheDocument()
    })
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('닉네임이 2자 미만이면 에러를 표시한다', async () => {
    render(<RegisterForm onSubmit={mockOnSubmit} isLoading={false} />)

    fireEvent.change(screen.getByLabelText('이메일'), {
      target: { value: 'new@example.com' },
    })
    fireEvent.change(screen.getByLabelText('비밀번호'), {
      target: { value: 'password1' },
    })
    fireEvent.change(screen.getByLabelText('비밀번호 확인'), {
      target: { value: 'password1' },
    })
    fireEvent.change(screen.getByLabelText('닉네임'), {
      target: { value: '가' },
    })
    fireEvent.click(screen.getByRole('button', { name: '회원가입' }))

    await waitFor(() => {
      expect(screen.getByText('닉네임은 2자 이상이어야 합니다.')).toBeInTheDocument()
    })
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('비밀번호가 20자를 초과하면 에러를 표시한다', async () => {
    render(<RegisterForm onSubmit={mockOnSubmit} isLoading={false} />)

    fireEvent.change(screen.getByLabelText('이메일'), {
      target: { value: 'new@example.com' },
    })
    fireEvent.change(screen.getByLabelText('비밀번호'), {
      target: { value: 'abcdefghij12345678901' }, // 21자
    })
    fireEvent.change(screen.getByLabelText('비밀번호 확인'), {
      target: { value: 'abcdefghij12345678901' },
    })
    fireEvent.change(screen.getByLabelText('닉네임'), {
      target: { value: '테스터' },
    })
    fireEvent.click(screen.getByRole('button', { name: '회원가입' }))

    await waitFor(() => {
      expect(screen.getByText('비밀번호는 20자 이하여야 합니다.')).toBeInTheDocument()
    })
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('비밀번호 확인 미입력 시 에러를 표시한다', async () => {
    render(<RegisterForm onSubmit={mockOnSubmit} isLoading={false} />)

    fireEvent.change(screen.getByLabelText('이메일'), {
      target: { value: 'new@example.com' },
    })
    fireEvent.change(screen.getByLabelText('비밀번호'), {
      target: { value: 'password1' },
    })
    fireEvent.change(screen.getByLabelText('닉네임'), {
      target: { value: '테스터' },
    })
    fireEvent.click(screen.getByRole('button', { name: '회원가입' }))

    await waitFor(() => {
      expect(screen.getByText('비밀번호 확인을 입력해주세요.')).toBeInTheDocument()
    })
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('비밀번호와 비밀번호 확인이 불일치하면 에러를 표시한다', async () => {
    render(<RegisterForm onSubmit={mockOnSubmit} isLoading={false} />)

    fireEvent.change(screen.getByLabelText('이메일'), {
      target: { value: 'new@example.com' },
    })
    fireEvent.change(screen.getByLabelText('비밀번호'), {
      target: { value: 'password1' },
    })
    fireEvent.change(screen.getByLabelText('비밀번호 확인'), {
      target: { value: 'password2' },
    })
    fireEvent.change(screen.getByLabelText('닉네임'), {
      target: { value: '테스터' },
    })
    fireEvent.click(screen.getByRole('button', { name: '회원가입' }))

    await waitFor(() => {
      expect(screen.getByText('비밀번호가 일치하지 않습니다.')).toBeInTheDocument()
    })
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('error prop이 있으면 API 에러 메시지를 alert로 표시한다', () => {
    render(
      <RegisterForm
        onSubmit={mockOnSubmit}
        isLoading={false}
        error="이미 사용 중인 이메일입니다."
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('이미 사용 중인 이메일입니다.')
  })

  it('isLoading=true이면 제출 버튼이 비활성화된다', () => {
    render(<RegisterForm onSubmit={mockOnSubmit} isLoading />)
    expect(screen.getByRole('button', { name: '회원가입' })).toBeDisabled()
  })
})
