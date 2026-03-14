import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { postService } from '@/services/postService'
import type { CreatePostRequest, UpdatePostRequest } from '@/types/post'

/**
 * @deprecated useInfinitePosts 대신 usePaginatedPosts를 사용하세요.
 * 페이지 기반 pagination으로 전환되었습니다.
 */
export function useInfinitePosts(params?: { search?: string; limit?: number }) {
  return useInfiniteQuery({
    queryKey: ['posts', params],
    queryFn: ({ pageParam }) =>
      postService.getPosts({
        cursor: pageParam,
        limit: params?.limit,
        search: params?.search,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as number | undefined,
  })
}

export function usePaginatedPosts(params: { page: number; search?: string; limit?: number }) {
  return useQuery({
    queryKey: ['posts', 'paged', params],
    queryFn: () => postService.getPagedPosts(params),
  })
}

export function usePost(id: number) {
  return useQuery({
    queryKey: ['posts', id],
    queryFn: () => postService.getPost(id),
  })
}

export function useCreatePostMutation() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreatePostRequest) => postService.createPost(body),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['posts'] })
      void navigate({ to: '/posts/$postId', params: { postId: String(data.id) } })
    },
  })
}

export function useUpdatePostMutation(postId: number) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdatePostRequest) => postService.updatePost(postId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['posts', postId] })
      void navigate({ to: '/posts/$postId', params: { postId: String(postId) } })
    },
  })
}

export function useDeletePostMutation() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => postService.deletePost(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['posts'] })
      void navigate({ to: '/' })
    },
  })
}
