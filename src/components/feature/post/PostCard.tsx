import { Link } from '@tanstack/react-router'
import { Eye, MessageSquare, User } from 'lucide-react'
import type { Post } from '@/types/post'
import { formatRelativeDate } from '@/utils/formatDate'

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link
      to="/posts/$postId"
      params={{ postId: String(post.id) }}
      className="group block rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[hsl(var(--accent)/0.3)] hover:shadow-md"
    >
      <h2 className="mb-2 line-clamp-1 text-base font-semibold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--accent))]">
        {post.title}
      </h2>
      <p className="mb-4 line-clamp-2 text-sm text-[hsl(var(--muted-foreground))]">
        {post.content}
      </p>
      <div className="flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))]">
        <span className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {post.author.nickname}
        </span>
        <span>{formatRelativeDate(post.createdAt)}</span>
        <span className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          조회 {post.viewCount}
        </span>
        {post.attachments && post.attachments.length > 0 && (
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {post.attachments.length}
          </span>
        )}
      </div>
    </Link>
  )
}
