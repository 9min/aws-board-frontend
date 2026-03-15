import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/adminService'
import type {
  AdminComment,
  AdminDashboardStats,
  AdminPagedResponse,
  AdminPaginationParams,
  AdminPost,
  AdminUser,
} from '@/types/admin'
import type { AppError } from '@/types/common'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'

export function useAdminDashboard(): UseQueryResult<AdminDashboardStats, AppError> {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminService.getDashboard(),
  })
}

export function useAdminUsers(
  params: AdminPaginationParams,
): UseQueryResult<AdminPagedResponse<AdminUser>, AppError> {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminService.getUsers(params),
  })
}

export function useAdminUser(id: number): UseQueryResult<AdminUser, AppError> {
  return useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: () => adminService.getUser(id),
  })
}

export function useAdminPosts(
  params: AdminPaginationParams,
): UseQueryResult<AdminPagedResponse<AdminPost>, AppError> {
  return useQuery({
    queryKey: ['admin', 'posts', params],
    queryFn: () => adminService.getPosts(params),
  })
}

export function useAdminPost(id: number): UseQueryResult<AdminPost, AppError> {
  return useQuery({
    queryKey: ['admin', 'posts', id],
    queryFn: () => adminService.getPost(id),
  })
}

export function useAdminComments(
  params: AdminPaginationParams & { postId?: number },
): UseQueryResult<AdminPagedResponse<AdminComment>, AppError> {
  return useQuery({
    queryKey: ['admin', 'comments', params],
    queryFn: () => adminService.getComments(params),
  })
}

export function useDeleteAdminUserMutation(): UseMutationResult<void, AppError, number> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => adminService.deleteUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useDeleteAdminPostMutation(): UseMutationResult<void, AppError, number> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => adminService.deletePost(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] })
    },
  })
}

export function useDeleteAdminCommentMutation(): UseMutationResult<void, AppError, number> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => adminService.deleteComment(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'comments'] })
    },
  })
}
