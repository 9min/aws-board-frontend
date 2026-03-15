import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface AdminDeleteButtonProps {
  onConfirm: () => void
  isLoading?: boolean
  label?: string
}

export function AdminDeleteButton({
  onConfirm,
  isLoading = false,
  label = '삭제',
}: AdminDeleteButtonProps) {
  const handleClick = () => {
    if (!confirm(`정말 ${label}하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return
    onConfirm()
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleClick}
      isLoading={isLoading}
      className="flex items-center gap-1.5"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {label}
    </Button>
  )
}
