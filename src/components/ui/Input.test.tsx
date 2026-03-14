import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Input } from './Input'

describe('Input', () => {
  it('label이 있으면 렌더링된다', () => {
    render(<Input label="이메일" />)
    expect(screen.getByLabelText('이메일')).toBeInTheDocument()
  })

  it('label 없이도 렌더링된다', () => {
    render(<Input placeholder="이메일 입력" />)
    expect(screen.getByPlaceholderText('이메일 입력')).toBeInTheDocument()
  })

  it('error가 있으면 에러 메시지를 표시한다', () => {
    render(<Input label="이메일" error="올바른 이메일을 입력하세요." />)
    expect(screen.getByRole('alert')).toHaveTextContent('올바른 이메일을 입력하세요.')
  })

  it('error가 있으면 aria-invalid="true"를 적용한다', () => {
    render(<Input label="이메일" error="에러" />)
    expect(screen.getByLabelText('이메일')).toHaveAttribute('aria-invalid', 'true')
  })

  it('error가 없으면 aria-invalid="false"를 적용한다', () => {
    render(<Input label="이메일" />)
    expect(screen.getByLabelText('이메일')).toHaveAttribute('aria-invalid', 'false')
  })

  it('error가 있으면 border-red-500 클래스를 적용한다', () => {
    render(<Input label="이메일" error="에러" />)
    expect(screen.getByLabelText('이메일')).toHaveClass('border-red-500')
  })

  it('error가 없으면 에러 메시지가 없다', () => {
    render(<Input label="이메일" />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
