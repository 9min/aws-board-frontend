import type { AdminComment } from '@/types/admin'
import { formatDate } from '@/utils/formatDate'
import { AdminDeleteButton } from './AdminDeleteButton'

interface AdminCommentTableProps {
  comments: AdminComment[]
  onDelete: (id: number) => void
  isDeleting?: boolean
}

export function AdminCommentTable({ comments, onDelete, isDeleting = false }: AdminCommentTableProps) {
  if (comments.length === 0) {
    return (
      <div className="py-12 text-center text-[hsl(var(--muted-foreground))]">
        댓글이 없습니다.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[hsl(var(--border))]">
      <table className="w-full text-sm">
        <thead className="bg-[hsl(var(--muted))]">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">ID</th>
            <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">내용</th>
            <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">작성자</th>
            <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">게시글</th>
            <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">작성일</th>
            <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">작업</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[hsl(var(--border))] bg-[hsl(var(--card))]">
          {comments.map((comment) => (
            <tr key={comment.id} className="hover:bg-[hsl(var(--muted)/0.3)]">
              <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{comment.id}</td>
              <td className="max-w-xs truncate px-4 py-3 text-[hsl(var(--foreground))]">
                {comment.content}
              </td>
              <td className="px-4 py-3 text-[hsl(var(--foreground))]">{comment.author.nickname}</td>
              <td className="max-w-[160px] truncate px-4 py-3 text-[hsl(var(--muted-foreground))]">
                {comment.post.title}
              </td>
              <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{formatDate(comment.createdAt)}</td>
              <td className="px-4 py-3">
                <AdminDeleteButton
                  onConfirm={() => onDelete(comment.id)}
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
