import { describe, expect, it } from 'vitest'
import { decodeJwtPayload } from './jwtDecode'

describe('decodeJwtPayload', () => {
  it('유효한 JWT에서 payload를 디코드한다', () => {
    const payload = { sub: 1, email: 'test@example.com', exp: 9999999999 }
    const base64 = btoa(JSON.stringify(payload))
    const token = `header.${base64}.signature`

    expect(decodeJwtPayload(token)).toEqual(payload)
  })

  it('토큰이 3개 파트가 아니면 null을 반환한다', () => {
    expect(decodeJwtPayload('invalid')).toBeNull()
    expect(decodeJwtPayload('a.b')).toBeNull()
  })

  it('빈 문자열이면 null을 반환한다', () => {
    expect(decodeJwtPayload('')).toBeNull()
  })

  it('JSON 파싱 실패 시 null을 반환한다', () => {
    const token = `header.${btoa('not-json')}.signature`
    expect(decodeJwtPayload(token)).toBeNull()
  })

  it('URL-safe base64 토큰도 디코드한다', () => {
    const payload = { sub: 2, email: 'user@test.com', exp: 9999999999 }
    // URL-safe base64: +→-, /→_
    const base64 = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_')
    const token = `header.${base64}.signature`

    expect(decodeJwtPayload(token)).toEqual(payload)
  })
})
