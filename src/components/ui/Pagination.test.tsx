import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('현재 페이지 버튼이 active 스타일로 표시된다', () => {
    render(<Pagination currentPage={3} totalPages={10} onPageChange={vi.fn()} />)
    const activeBtn = screen.getByRole('button', { name: '3' })
    expect(activeBtn).toHaveAttribute('aria-current', 'page')
  })

  it('totalPages가 1이면 이전/다음 버튼이 disabled다', () => {
    render(<Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: '이전 페이지' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '다음 페이지' })).toBeDisabled()
  })

  it('1페이지에서 이전 버튼이 disabled다', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: '이전 페이지' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '다음 페이지' })).not.toBeDisabled()
  })

  it('마지막 페이지에서 다음 버튼이 disabled다', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: '다음 페이지' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '이전 페이지' })).not.toBeDisabled()
  })

  it('페이지 버튼 클릭 시 onPageChange(N)을 호출한다', () => {
    const onPageChange = vi.fn()
    render(<Pagination currentPage={3} totalPages={10} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByRole('button', { name: '4' }))
    expect(onPageChange).toHaveBeenCalledWith(4)
  })

  it('이전 버튼 클릭 시 onPageChange(currentPage - 1)을 호출한다', () => {
    const onPageChange = vi.fn()
    render(<Pagination currentPage={3} totalPages={10} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByRole('button', { name: '이전 페이지' }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('다음 버튼 클릭 시 onPageChange(currentPage + 1)을 호출한다', () => {
    const onPageChange = vi.fn()
    render(<Pagination currentPage={3} totalPages={10} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByRole('button', { name: '다음 페이지' }))
    expect(onPageChange).toHaveBeenCalledWith(4)
  })

  it('최대 5개 페이지 번호만 표시한다', () => {
    render(<Pagination currentPage={5} totalPages={10} onPageChange={vi.fn()} />)
    // 이전/다음 버튼 제외하고 숫자 버튼 5개만
    const pageButtons = screen.getAllByRole('button').filter((btn) => /^\d+$/.test(btn.textContent ?? ''))
    expect(pageButtons).toHaveLength(5)
  })

  it('현재 페이지 5, 전체 10 → 3 4 ●5 6 7 표시', () => {
    render(<Pagination currentPage={5} totalPages={10} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '6' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '7' })).toBeInTheDocument()
  })

  it('isLoading이 true이면 모든 버튼이 disabled다', () => {
    render(<Pagination currentPage={3} totalPages={10} onPageChange={vi.fn()} isLoading />)
    const allButtons = screen.getAllByRole('button')
    for (const btn of allButtons) {
      expect(btn).toBeDisabled()
    }
  })
})
