import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { PostCard } from '@/components/feature/post/PostCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
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
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">게시판</h1>
        {isAuthenticated && (
          <Button onClick={() => void navigate({ to: '/posts/new' })} size="sm">
            글쓰기
          </Button>
        )}
      </div>

      <div className="mb-4">
        <Input
          placeholder="제목 또는 내용으로 검색"
          value={search ?? ''}
          onChange={handleSearchChange}
        />
      </div>

      {isLoading && <p className="text-center text-muted-foreground">불러오는 중...</p>}
      {isError && (
        <p className="text-center text-red-500">게시글을 불러오지 못했습니다. 다시 시도해주세요.</p>
      )}
      {!isLoading && !isError && posts.length === 0 && (
        <p className="text-center text-muted-foreground">게시글이 없습니다.</p>
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
          >
            더 보기
          </Button>
        </div>
      )}
    </div>
  )
}
