import axios from 'axios'
import type { AppError } from '@/types/common'

export function createAppError(
  code: string,
  message: string,
  details?: Record<string, string[]>,
): AppError {
  return { code, message, details }
}

export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as AppError).code === 'string' &&
    typeof (error as AppError).message === 'string'
  )
}

export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return '알 수 없는 오류가 발생했습니다.'
}

export function handleApiError(error: unknown): AppError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const responseData = error.response?.data as
      | { message?: string; error?: { message?: string } }
      | undefined
    const serverMessage = responseData?.message ?? responseData?.error?.message

    if (!status) {
      return createAppError('NETWORK_ERROR', serverMessage ?? '네트워크 오류가 발생했습니다.')
    }

    const code = getErrorCode(status)
    const message = serverMessage ?? getDefaultMessage(status)
    return createAppError(code, message)
  }

  if (isAppError(error)) {
    return error
  }

  return createAppError('UNKNOWN_ERROR', '알 수 없는 오류가 발생했습니다.')
}

function getErrorCode(status: number): string {
  switch (status) {
    case 400:
      return 'BAD_REQUEST'
    case 401:
      return 'UNAUTHORIZED'
    case 403:
      return 'FORBIDDEN'
    case 404:
      return 'NOT_FOUND'
    case 409:
      return 'CONFLICT'
    case 422:
      return 'VALIDATION_ERROR'
    case 429:
      return 'TOO_MANY_REQUESTS'
    case 500:
      return 'SERVER_ERROR'
    default:
      return 'UNKNOWN_ERROR'
  }
}

function getDefaultMessage(status: number): string {
  switch (status) {
    case 400:
      return '잘못된 요청입니다.'
    case 401:
      return '인증이 필요합니다.'
    case 403:
      return '접근 권한이 없습니다.'
    case 404:
      return '요청한 리소스를 찾을 수 없습니다.'
    case 409:
      return '이미 존재하는 데이터입니다.'
    case 422:
      return '입력값이 올바르지 않습니다.'
    case 429:
      return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
    case 500:
      return '서버 오류가 발생했습니다.'
    default:
      return '오류가 발생했습니다.'
  }
}
