import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fileService } from '@/services/fileService'
import { useDeleteAttachment } from './useDeleteAttachment'

vi.mock('@/services/fileService', () => ({
  fileService: {
    deleteAttachment: vi.fn(),
  },
}))

const mockDeleteAttachment = vi.mocked(fileService.deleteAttachment)

describe('useDeleteAttachment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('초기 상태는 isDeleting=false, error=null이다', () => {
    const { result } = renderHook(() => useDeleteAttachment())
    expect(result.current.isDeleting).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('삭제 성공 시 true를 반환하고 isDeleting이 false로 복귀한다', async () => {
    mockDeleteAttachment.mockResolvedValueOnce(undefined)
    const { result } = renderHook(() => useDeleteAttachment())

    let ok: boolean | undefined
    await act(async () => {
      ok = await result.current.deleteAttachment(1, 2)
    })

    expect(ok).toBe(true)
    expect(result.current.isDeleting).toBe(false)
    expect(result.current.error).toBeNull()
    expect(mockDeleteAttachment).toHaveBeenCalledWith(1, 2)
  })

  it('삭제 중에는 isDeleting이 true이다', async () => {
    let resolveDelete: () => void
    mockDeleteAttachment.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveDelete = resolve
      }),
    )
    const { result } = renderHook(() => useDeleteAttachment())

    act(() => {
      void result.current.deleteAttachment(1, 2)
    })

    expect(result.current.isDeleting).toBe(true)

    await act(async () => {
      resolveDelete()
    })

    expect(result.current.isDeleting).toBe(false)
  })

  it('삭제 실패 시 false를 반환하고 error를 설정한다', async () => {
    mockDeleteAttachment.mockRejectedValueOnce({ code: 'FORBIDDEN', message: '삭제 권한이 없습니다.' })
    const { result } = renderHook(() => useDeleteAttachment())

    let ok: boolean | undefined
    await act(async () => {
      ok = await result.current.deleteAttachment(1, 2)
    })

    expect(ok).toBe(false)
    expect(result.current.isDeleting).toBe(false)
    expect(result.current.error).toBe('삭제 권한이 없습니다.')
  })
})
