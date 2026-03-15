import { createFileRoute } from '@tanstack/react-router'
import { MessageSquare, Newspaper, Users } from 'lucide-react'
import { DashboardStatsCard } from '@/components/feature/admin/DashboardStatsCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAdminDashboard } from '@/hooks/useAdmin'

export const Route = createFileRoute('/admin/dashboard')({
  component: AdminDashboardPage,
})

function AdminDashboardPage() {
  const { data, isLoading, isError } = useAdminDashboard()

  if (isError) {
    return (
      <div className="py-12 text-center text-red-500">대시보드 정보를 불러오지 못했습니다.</div>
    )
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-[hsl(var(--foreground))]">대시보드</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {isLoading ? (
          <>
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </>
        ) : (
          <>
            <DashboardStatsCard
              label="총 회원수"
              value={data?.totalUsers ?? 0}
              icon={<Users className="h-5 w-5" />}
            />
            <DashboardStatsCard
              label="총 게시글수"
              value={data?.totalPosts ?? 0}
              icon={<Newspaper className="h-5 w-5" />}
            />
            <DashboardStatsCard
              label="총 댓글수"
              value={data?.totalComments ?? 0}
              icon={<MessageSquare className="h-5 w-5" />}
            />
          </>
        )}
      </div>
    </div>
  )
}
