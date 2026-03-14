import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('children을 렌더링한다', () => {
    render(<Button>클릭</Button>)
    expect(screen.getByRole('button', { name: '클릭' })).toBeInTheDocument()
  })

  it('isLoading=true이면 로딩 스피너를 표시하고 비활성화된다', () => {
    render(<Button isLoading>로그인</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    // Loader2 아이콘이 렌더링되었는지 확인
    expect(button.querySelector('svg')).toBeInTheDocument()
  })

  it('disabled=true이면 비활성화된다', () => {
    render(<Button disabled>버튼</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('variant="destructive" 클래스가 적용된다', () => {
    render(<Button variant="destructive">삭제</Button>)
    const button = screen.getByRole('button')
    // destructive variant는 CSS 변수 기반 배경색 클래스를 사용한다
    expect(button.className).toMatch(/destructive/)
  })

  it('size="sm" 클래스가 적용된다', () => {
    render(<Button size="sm">소형</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-8')
  })

  it('isLoading=false이면 스피너가 없고 활성화된다', () => {
    render(<Button isLoading={false}>버튼</Button>)
    const button = screen.getByRole('button')
    expect(button).not.toBeDisabled()
    expect(button.querySelector('svg')).not.toBeInTheDocument()
  })
})
