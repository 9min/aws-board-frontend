import type { AdminPost } from '@/types/admin'
import { formatDate } from '@/utils/formatDate'
import { AdminDeleteButton } from './AdminDeleteButton'

interface AdminPostTableProps {
  posts: AdminPost[]
  onDelete: (id: number) => void
  isDeleting?: boolean
}

export function AdminPostTable({ posts, onDelete, isDeleting = false }: AdminPostTableProps) {
  if (posts.length === 0) {
    return (
      <div className="py-12 text-center text-[hsl(var(--muted-foreground))]">
        게시글이 없습니다.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[hsl(var(--border))]">
      <table className="w-full text-sm">
        <thead className="bg-[hsl(var(--muted))]">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">ID</th>
            <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">제목</th>
            <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">작성자</th>
            <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">조회수</th>
            <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">작성일</th>
            <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">작업</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[hsl(var(--border))] bg-[hsl(var(--card))]">
          {posts.map((post) => (
            <tr key={post.id} className="hover:bg-[hsl(var(--muted)/0.3)]">
              <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{post.id}</td>
              <td className="max-w-xs truncate px-4 py-3 font-medium text-[hsl(var(--foreground))]">
                {post.title}
              </td>
              <td className="px-4 py-3 text-[hsl(var(--foreground))]">{post.author.nickname}</td>
              <td className="px-4 py-3 text-[hsl(var(--foreground))]">{post.viewCount}</td>
              <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{formatDate(post.createdAt)}</td>
              <td className="px-4 py-3">
                <AdminDeleteButton
                  onConfirm={() => onDelete(post.id)}
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
