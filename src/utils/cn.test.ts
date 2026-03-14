import { describe, expect, it } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('단일 클래스를 그대로 반환한다', () => {
    expect(cn('text-red-500')).toBe('text-red-500')
  })

  it('여러 클래스를 병합한다', () => {
    expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500')
  })

  it('중복된 Tailwind 클래스를 마지막 값으로 병합한다', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('falsy 값을 무시한다', () => {
    expect(cn('text-red-500', undefined, null, false, '')).toBe('text-red-500')
  })

  it('조건부 클래스를 처리한다', () => {
    const isActive = true
    expect(cn('base', isActive && 'active')).toBe('base active')
  })

  it('비활성 조건부 클래스를 제외한다', () => {
    const isActive = false
    expect(cn('base', isActive && 'active')).toBe('base')
  })

  it('객체 형식의 조건부 클래스를 처리한다', () => {
    expect(cn({ 'text-red-500': true, 'text-blue-500': false })).toBe('text-red-500')
  })
})
