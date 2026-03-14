import { describe, expect, it } from 'vitest'
import { createAppError, getErrorMessage, handleApiError, isAppError } from './error'

// axios.isAxiosError는 error.isAxiosError === true를 확인하므로 별도 mock 없이 사용 가능
const createMockAxiosError = (status?: number, message?: string) => ({
  isAxiosError: true as const,
  response: status !== undefined ? { status, data: message ? { message } : {} } : undefined,
})

describe('createAppError', () => {
  it('code와 message를 가진 AppError를 반환한다', () => {
    const error = createAppError('NOT_FOUND', '리소스를 찾을 수 없습니다.')
    expect(error).toEqual({ code: 'NOT_FOUND', message: '리소스를 찾을 수 없습니다.' })
  })

  it('details를 포함한 AppError를 반환한다', () => {
    const details = { email: ['이미 사용 중인 이메일입니다.'] }
    const error = createAppError('CONFLICT', '충돌', details)
    expect(error.details).toEqual(details)
  })
})

describe('isAppError', () => {
  it('AppError 객체에 대해 true를 반환한다', () => {
    expect(isAppError({ code: 'NOT_FOUND', message: '없음' })).toBe(true)
  })

  it('code가 없는 객체에 대해 false를 반환한다', () => {
    expect(isAppError({ message: '없음' })).toBe(false)
  })

  it('null에 대해 false를 반환한다', () => {
    expect(isAppError(null)).toBe(false)
  })

  it('문자열에 대해 false를 반환한다', () => {
    expect(isAppError('error')).toBe(false)
  })

  it('code가 문자열이 아닌 경우 false를 반환한다', () => {
    expect(isAppError({ code: 404, message: '없음' })).toBe(false)
  })
})

describe('getErrorMessage', () => {
  it('AppError의 message를 반환한다', () => {
    expect(getErrorMessage({ code: 'ERR', message: '앱 에러' })).toBe('앱 에러')
  })

  it('Error 인스턴스의 message를 반환한다', () => {
    expect(getErrorMessage(new Error('일반 에러'))).toBe('일반 에러')
  })

  it('알 수 없는 타입에 대해 기본 메시지를 반환한다', () => {
    expect(getErrorMessage('string error')).toBe('알 수 없는 오류가 발생했습니다.')
    expect(getErrorMessage(null)).toBe('알 수 없는 오류가 발생했습니다.')
  })
})

describe('handleApiError', () => {
  it('400 → BAD_REQUEST', () => {
    const error = handleApiError(createMockAxiosError(400))
    expect(error.code).toBe('BAD_REQUEST')
  })

  it('401 → UNAUTHORIZED', () => {
    const error = handleApiError(createMockAxiosError(401))
    expect(error.code).toBe('UNAUTHORIZED')
  })

  it('403 → FORBIDDEN', () => {
    const error = handleApiError(createMockAxiosError(403))
    expect(error.code).toBe('FORBIDDEN')
  })

  it('404 → NOT_FOUND', () => {
    const error = handleApiError(createMockAxiosError(404))
    expect(error.code).toBe('NOT_FOUND')
  })

  it('409 → CONFLICT', () => {
    const error = handleApiError(createMockAxiosError(409))
    expect(error.code).toBe('CONFLICT')
  })

  it('422 → VALIDATION_ERROR', () => {
    const error = handleApiError(createMockAxiosError(422))
    expect(error.code).toBe('VALIDATION_ERROR')
  })

  it('429 → TOO_MANY_REQUESTS', () => {
    const error = handleApiError(createMockAxiosError(429))
    expect(error.code).toBe('TOO_MANY_REQUESTS')
  })

  it('500 → SERVER_ERROR', () => {
    const error = handleApiError(createMockAxiosError(500))
    expect(error.code).toBe('SERVER_ERROR')
  })

  it('status 없음 → NETWORK_ERROR', () => {
    const error = handleApiError(createMockAxiosError())
    expect(error.code).toBe('NETWORK_ERROR')
  })

  it('서버 응답의 message 필드를 우선 사용한다', () => {
    const error = handleApiError(createMockAxiosError(400, '서버에서 보내는 메시지'))
    expect(error.message).toBe('서버에서 보내는 메시지')
  })

  it('서버 message 없으면 기본 메시지를 사용한다', () => {
    const error = handleApiError(createMockAxiosError(404))
    expect(error.message).toBe('요청한 리소스를 찾을 수 없습니다.')
  })

  it('이미 AppError인 경우 그대로 반환한다', () => {
    const appError = { code: 'CUSTOM', message: '커스텀 에러' }
    expect(handleApiError(appError)).toEqual(appError)
  })

  it('알 수 없는 에러는 UNKNOWN_ERROR로 반환한다', () => {
    expect(handleApiError(new Error('일반 에러')).code).toBe('UNKNOWN_ERROR')
  })
})
