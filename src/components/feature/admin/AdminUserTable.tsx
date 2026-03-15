import type { AdminUser } from '@/types/admin'
import { formatDate } from '@/utils/formatDate'
import { AdminDeleteButton } from './AdminDeleteButton'

interface AdminUserTableProps {
  users: AdminUser[]
  onDelete: (id: number) => void
  isDeleting?: boolean
}

export function AdminUserTable({ users, onDelete, isDeleting = false }: AdminUserTableProps) {
  if (users.length === 0) {
    return (
      <div className="py-12 text-center text-[hsl(var(--muted-foreground))]">회원이 없습니다.</div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[hsl(var(--border))]">
      <table className="w-full text-sm">
        <thead className="bg-[hsl(var(--muted))]">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">
              ID
            </th>
            <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">
              이메일
            </th>
            <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">
              닉네임
            </th>
            <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">
              역할
            </th>
            <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">
              게시글
            </th>
            <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">
              댓글
            </th>
            <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">
              가입일
            </th>
            <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">
              작업
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[hsl(var(--border))] bg-[hsl(var(--card))]">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-[hsl(var(--muted)/0.3)]">
              <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{user.id}</td>
              <td className="px-4 py-3 font-medium text-[hsl(var(--foreground))]">{user.email}</td>
              <td className="px-4 py-3 text-[hsl(var(--foreground))]">{user.nickname}</td>
              <td className="px-4 py-3">
                {user.isAdmin ? (
                  <span className="rounded-full bg-[hsl(var(--accent)/0.1)] px-2 py-0.5 text-xs font-medium text-[hsl(var(--accent))]">
                    관리자
                  </span>
                ) : (
                  <span className="rounded-full bg-[hsl(var(--muted))] px-2 py-0.5 text-xs font-medium text-[hsl(var(--muted-foreground))]">
                    일반
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-[hsl(var(--foreground))]">{user.postCount}</td>
              <td className="px-4 py-3 text-[hsl(var(--foreground))]">{user.commentCount}</td>
              <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                {formatDate(user.createdAt)}
              </td>
              <td className="px-4 py-3">
                <AdminDeleteButton
                  onConfirm={() => onDelete(user.id)}
                  isLoading={isDeleting}
                  label="삭제"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
