import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Textarea } from './Textarea'

describe('Textarea', () => {
  it('label이 있으면 렌더링된다', () => {
    render(<Textarea label="내용" />)
    expect(screen.getByLabelText('내용')).toBeInTheDocument()
  })

  it('label 없이도 렌더링된다', () => {
    render(<Textarea placeholder="내용 입력" />)
    expect(screen.getByPlaceholderText('내용 입력')).toBeInTheDocument()
  })

  it('error가 있으면 에러 메시지를 표시한다', () => {
    render(<Textarea label="내용" error="내용을 입력해주세요." />)
    expect(screen.getByRole('alert')).toHaveTextContent('내용을 입력해주세요.')
  })

  it('error가 있으면 aria-invalid="true"를 적용한다', () => {
    render(<Textarea label="내용" error="에러" />)
    expect(screen.getByLabelText('내용')).toHaveAttribute('aria-invalid', 'true')
  })

  it('error가 없으면 aria-invalid="false"를 적용한다', () => {
    render(<Textarea label="내용" />)
    expect(screen.getByLabelText('내용')).toHaveAttribute('aria-invalid', 'false')
  })

  it('error가 있으면 border-red-500 클래스를 적용한다', () => {
    render(<Textarea label="내용" error="에러" />)
    expect(screen.getByLabelText('내용')).toHaveClass('border-red-500')
  })

  it('error가 없으면 에러 메시지가 없다', () => {
    render(<Textarea label="내용" />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('rows prop이 전달된다', () => {
    render(<Textarea label="내용" rows={10} />)
    expect(screen.getByLabelText('내용')).toHaveAttribute('rows', '10')
  })
})
