import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PostCard } from './PostCard'

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    params,
    className,
  }: {
    children: React.ReactNode
    to: string
    params?: Record<string, string>
    className?: string
  }) => (
    <a href={to.replace('$postId', params?.postId ?? '')} className={className}>
      {children}
    </a>
  ),
}))

vi.mock('@/utils/formatDate', () => ({
  formatRelativeDate: () => '3일 전',
}))

const mockPost = {
  id: 1,
  title: '테스트 게시글',
  content: '테스트 내용',
  authorId: 1,
  author: { id: 1, nickname: '테스터' },
  viewCount: 10,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

describe('PostCard', () => {
  it('제목을 렌더링한다', () => {
    render(<PostCard post={mockPost} />)
    expect(screen.getByText('테스트 게시글')).toBeInTheDocument()
  })

  it('작성자 닉네임을 렌더링한다', () => {
    render(<PostCard post={mockPost} />)
    expect(screen.getByText('테스터')).toBeInTheDocument()
  })

  it('조회수를 렌더링한다 (댓글수 없음)', () => {
    render(<PostCard post={mockPost} />)
    expect(screen.queryByText(/댓글/)).not.toBeInTheDocument()
  })

  it('상대적 날짜를 렌더링한다', () => {
    render(<PostCard post={mockPost} />)
    expect(screen.getByText('3일 전')).toBeInTheDocument()
  })

  it('조회수를 렌더링한다', () => {
    render(<PostCard post={mockPost} />)
    expect(screen.getByText('조회 10')).toBeInTheDocument()
  })

  it('게시글 상세 링크를 렌더링한다', () => {
    render(<PostCard post={mockPost} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/posts/1')
  })
})
