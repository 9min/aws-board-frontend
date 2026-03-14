export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, string[]>
}

export interface CursorPaginatedResponse<T> {
  data: T[]
  nextCursor: string | null
}

export interface AppError {
  code: string
  message: string
  details?: Record<string, string[]>
}
