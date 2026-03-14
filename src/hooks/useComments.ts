import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { commentService } from '@/services/commentService'
import type { CreateCommentRequest, UpdateCommentRequest } from '@/types/comment'

export function useComments(postId: number) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: () => commentService.getComments(postId),
  })
}

export function useCreateCommentMutation(postId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateCommentRequest) => commentService.createComment(postId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comments', postId] })
    },
  })
}

export function useUpdateCommentMutation(postId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateCommentRequest }) =>
      commentService.updateComment(postId, id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comments', postId] })
    },
  })
}

export function useDeleteCommentMutation(postId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => commentService.deleteComment(postId, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comments', postId] })
    },
  })
}
