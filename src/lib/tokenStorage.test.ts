import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { tokenStorage } from './tokenStorage'

describe('tokenStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('getAccessToken', () => {
    it('저장된 토큰이 없으면 null을 반환한다', () => {
      expect(tokenStorage.getAccessToken()).toBeNull()
    })

    it('저장된 액세스 토큰을 반환한다', () => {
      localStorage.setItem('access_token', 'test-token')
      expect(tokenStorage.getAccessToken()).toBe('test-token')
    })
  })

  describe('setAccessToken', () => {
    it('액세스 토큰을 저장한다', () => {
      tokenStorage.setAccessToken('new-token')
      expect(localStorage.getItem('access_token')).toBe('new-token')
    })
  })

  describe('getRefreshToken', () => {
    it('저장된 리프레시 토큰이 없으면 null을 반환한다', () => {
      expect(tokenStorage.getRefreshToken()).toBeNull()
    })

    it('저장된 리프레시 토큰을 반환한다', () => {
      localStorage.setItem('refresh_token', 'refresh-token')
      expect(tokenStorage.getRefreshToken()).toBe('refresh-token')
    })
  })

  describe('setRefreshToken', () => {
    it('리프레시 토큰을 저장한다', () => {
      tokenStorage.setRefreshToken('new-refresh-token')
      expect(localStorage.getItem('refresh_token')).toBe('new-refresh-token')
    })
  })

  describe('clearTokens', () => {
    it('액세스 토큰과 리프레시 토큰을 모두 삭제한다', () => {
      tokenStorage.setAccessToken('access')
      tokenStorage.setRefreshToken('refresh')
      tokenStorage.clearTokens()
      expect(tokenStorage.getAccessToken()).toBeNull()
      expect(tokenStorage.getRefreshToken()).toBeNull()
    })
  })

  describe('hasAccessToken', () => {
    it('액세스 토큰이 없으면 false를 반환한다', () => {
      expect(tokenStorage.hasAccessToken()).toBe(false)
    })

    it('액세스 토큰이 있으면 true를 반환한다', () => {
      tokenStorage.setAccessToken('some-token')
      expect(tokenStorage.hasAccessToken()).toBe(true)
    })
  })
})
