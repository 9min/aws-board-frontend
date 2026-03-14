import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useFileUpload } from './useFileUpload'

vi.mock('@/services/fileService', () => ({
  fileService: {
    getPresignedUrl: vi.fn(),
    uploadToS3: vi.fn(),
    registerAttachment: vi.fn(),
  },
}))

const mockPresigned = {
  url: 'https://s3.example.com/upload',
  fields: { key: 'uploads/test.txt', policy: 'abc' },
}

const mockAttachment = {
  id: 1,
  postId: 1,
  key: 'uploads/1/test.txt',
  url: 'https://s3.example.com/uploads/test.txt',
  createdAt: '2024-01-01T00:00:00.000Z',
}

describe('useFileUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('초기 상태에서 isUploading은 false, error는 null이다', () => {
    const { result } = renderHook(() => useFileUpload())
    expect(result.current.isUploading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('업로드 성공 시 Attachment를 반환한다', async () => {
    const { fileService } = await import('@/services/fileService')
    vi.mocked(fileService.getPresignedUrl).mockResolvedValue(mockPresigned)
    vi.mocked(fileService.uploadToS3).mockResolvedValue(undefined)
    vi.mocked(fileService.registerAttachment).mockResolvedValue(mockAttachment)

    const { result } = renderHook(() => useFileUpload())
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })

    let attachment: typeof mockAttachment | null = null
    await act(async () => {
      attachment = await result.current.upload(1, file)
    })

    expect(attachment).toEqual(mockAttachment)
    expect(result.current.isUploading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('presigned URL 발급 실패 시 error를 설정하고 null을 반환한다', async () => {
    const { fileService } = await import('@/services/fileService')
    vi.mocked(fileService.getPresignedUrl).mockRejectedValue({
      code: 'UNAUTHORIZED',
      message: '인증이 필요합니다.',
    })

    const { result } = renderHook(() => useFileUpload())
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })

    let attachment: unknown
    await act(async () => {
      attachment = await result.current.upload(1, file)
    })

    expect(attachment).toBeNull()
    expect(result.current.error).toBe('인증이 필요합니다.')
    expect(result.current.isUploading).toBe(false)
  })

  it('S3 업로드 실패 시 error를 설정하고 null을 반환한다', async () => {
    const { fileService } = await import('@/services/fileService')
    vi.mocked(fileService.getPresignedUrl).mockResolvedValue(mockPresigned)
    vi.mocked(fileService.uploadToS3).mockRejectedValue({
      code: 'UPLOAD_FAILED',
      message: '파일 업로드에 실패했습니다.',
    })

    const { result } = renderHook(() => useFileUpload())
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })

    let attachment: unknown
    await act(async () => {
      attachment = await result.current.upload(1, file)
    })

    expect(attachment).toBeNull()
    expect(result.current.error).toBe('파일 업로드에 실패했습니다.')
  })
})
