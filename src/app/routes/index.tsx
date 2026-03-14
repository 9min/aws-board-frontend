import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { PenLine, Search } from 'lucide-react'
import { PostCard } from '@/components/feature/post/PostCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PostCardSkeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/contexts/AuthContext'
import { useInfinitePosts } from '@/hooks/usePosts'

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): { search?: string } => ({
    search: typeof search.search === 'string' ? search.search : undefined,
  }),
  component: HomePage,
})

function HomePage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { search } = Route.useSearch()

  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfinitePosts({ search })

  const posts = data?.pages.flatMap((page) => page.data) ?? []

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    void navigate({ to: '/', search: { search: e.target.value || undefined } })
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-3xl flex-col px-4">
      {/* 고정 영역: 제목 + 검색 */}
      <div className="flex-shrink-0 pb-4 pt-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">게시판</h1>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              자유롭게 소통하고 정보를 나눠보세요
            </p>
          </div>
          {isAuthenticated && (
            <Button
              onClick={() => void navigate({ to: '/posts/new' })}
              size="sm"
              className="flex items-center gap-1.5"
            >
              <PenLine className="h-3.5 w-3.5" />
              글쓰기
            </Button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
          <Input
            className="pl-9"
            placeholder="제목 또는 내용으로 검색"
            value={search ?? ''}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* 스크롤 영역: 게시글 목록 */}
      <div className="flex-1 overflow-y-auto pb-8 pt-4">
        {isLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: 스켈레톤 로딩용 인덱스 키
              <PostCardSkeleton key={i} />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
            게시글을 불러오지 못했습니다. 다시 시도해주세요.
          </div>
        )}

        {!isLoading && !isError && posts.length === 0 && (
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.4)] p-12 text-center">
            <p className="text-[hsl(var(--muted-foreground))]">게시글이 없습니다.</p>
            {isAuthenticated && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => void navigate({ to: '/posts/new' })}
              >
                첫 글을 작성해보세요
              </Button>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {hasNextPage && (
          <div className="mt-6 flex justify-center">
            <Button
              onClick={() => void fetchNextPage()}
              isLoading={isFetchingNextPage}
              variant="secondary"
              size="sm"
            >
              더 보기
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
