import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Mail, MessageSquare, Newspaper, Shield, User } from 'lucide-react'
import { AdminDeleteButton } from '@/components/feature/admin/AdminDeleteButton'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAdminUser, useDeleteAdminUserMutation } from '@/hooks/useAdmin'
import { formatDate } from '@/utils/formatDate'

export const Route = createFileRoute('/admin/users/$userId')({
  component: AdminUserDetailPage,
})

function AdminUserDetailPage() {
  const { userId } = Route.useParams()
  const navigate = useNavigate()
  const { data: user, isLoading, isError } = useAdminUser(Number(userId))
  const deleteMutation = useDeleteAdminUserMutation()

  const handleDelete = () => {
    deleteMutation.mutate(Number(userId), {
      onSuccess: () => {
        void navigate({ to: '/admin/users' })
      },
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-lg space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  if (isError || !user) {
    return <div className="py-12 text-center text-red-500">회원 정보를 불러오지 못했습니다.</div>
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void navigate({ to: '/admin/users' })}
          className="flex items-center gap-1.5 text-[hsl(var(--muted-foreground))]"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Button>
        <AdminDeleteButton
          onConfirm={handleDelete}
          isLoading={deleteMutation.isPending}
          label="회원 삭제"
        />
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
        <h1 className="mb-6 text-xl font-bold text-[hsl(var(--foreground))]">회원 상세</h1>
        <dl className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            <dt className="w-20 text-sm text-[hsl(var(--muted-foreground))]">닉네임</dt>
            <dd className="text-sm font-medium text-[hsl(var(--foreground))]">{user.nickname}</dd>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            <dt className="w-20 text-sm text-[hsl(var(--muted-foreground))]">이메일</dt>
            <dd className="text-sm font-medium text-[hsl(var(--foreground))]">{user.email}</dd>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            <dt className="w-20 text-sm text-[hsl(var(--muted-foreground))]">역할</dt>
            <dd>
              {user.isAdmin ? (
                <span className="rounded-full bg-[hsl(var(--accent)/0.1)] px-2 py-0.5 text-xs font-medium text-[hsl(var(--accent))]">
                  관리자
                </span>
              ) : (
                <span className="rounded-full bg-[hsl(var(--muted))] px-2 py-0.5 text-xs font-medium text-[hsl(var(--muted-foreground))]">
                  일반
                </span>
              )}
            </dd>
          </div>
          <div className="flex items-center gap-3">
            <Newspaper className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            <dt className="w-20 text-sm text-[hsl(var(--muted-foreground))]">게시글</dt>
            <dd className="text-sm font-medium text-[hsl(var(--foreground))]">
              {user.postCount}개
            </dd>
          </div>
          <div className="flex items-center gap-3">
            <MessageSquare className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            <dt className="w-20 text-sm text-[hsl(var(--muted-foreground))]">댓글</dt>
            <dd className="text-sm font-medium text-[hsl(var(--foreground))]">
              {user.commentCount}개
            </dd>
          </div>
          <div className="flex items-center gap-3">
            <dt className="ml-7 w-20 text-sm text-[hsl(var(--muted-foreground))]">가입일</dt>
            <dd className="text-sm text-[hsl(var(--muted-foreground))]">
              {formatDate(user.createdAt)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
