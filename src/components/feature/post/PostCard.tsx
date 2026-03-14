import { Link } from '@tanstack/react-router'
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
      className="block rounded-lg border border-border bg-background p-4 transition-colors hover:bg-muted"
    >
      <h2 className="mb-2 text-lg font-semibold">{post.title}</h2>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{post.author.nickname}</span>
        <span>{formatRelativeDate(post.createdAt)}</span>
        <span>조회 {post.viewCount}</span>
      </div>
    </Link>
  )
}
