import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from './Button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}

/** 현재 페이지 앞뒤 2개씩, 최대 5개 페이지 번호 계산 */
function getPageNumbers(currentPage: number, totalPages: number): number[] {
  const maxVisible = 5
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  let start = Math.max(1, currentPage - 2)
  const end = Math.min(totalPages, start + maxVisible - 1)

  // 끝에서 5개가 안 되면 시작을 당긴다
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

export function Pagination({ currentPage, totalPages, onPageChange, isLoading }: PaginationProps) {
  const pageNumbers = getPageNumbers(currentPage, totalPages)

  return (
    <nav className="flex items-center gap-1" aria-label="페이지 네비게이션">
      <Button
        variant="ghost"
        size="sm"
        aria-label="이전 페이지"
        disabled={isLoading || currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pageNumbers.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? 'primary' : 'ghost'}
          size="sm"
          aria-label={String(page)}
          aria-current={page === currentPage ? 'page' : undefined}
          disabled={isLoading}
          onClick={() => onPageChange(page)}
          className={cn('h-8 w-8 p-0', page === currentPage && 'font-bold')}
        >
          {page}
        </Button>
      ))}

      <Button
        variant="ghost"
        size="sm"
        aria-label="다음 페이지"
        disabled={isLoading || currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  )
}
