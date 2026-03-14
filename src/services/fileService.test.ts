import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fileService } from './fileService'

vi.mock('@/lib/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
  },
}))

const createMockAxiosError = (status?: number, message?: string) => ({
  isAxiosError: true as const,
  response: status !== undefined ? { status, data: message ? { message } : {} } : undefined,
})

const mockPresigned = {
  url: 'https://s3.example.com/upload',
  fields: {
    key: 'uploads/test-file.txt',
    'Content-Type': 'text/plain',
    policy: 'base64encodedpolicy',
  },
}

const mockAttachment = {
  id: 1,
  postId: 1,
  fileName: 'test-file.txt',
  fileKey: 'uploads/test-file.txt',
  fileSize: 1024,
  mimeType: 'text/plain',
  url: 'https://s3.example.com/uploads/test-file.txt',
  createdAt: '2024-01-01T00:00:00.000Z',
}

describe('fileService.getPresignedUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('성공 시 PresignedPostResponse를 반환한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { data: mockPresigned, error: null, meta: null },
    })

    const result = await fileService.getPresignedUrl('test-file.txt', 'text/plain')
    expect(result).toEqual(mockPresigned)
    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/files/presigned-url', {
      fileName: 'test-file.txt',
      contentType: 'text/plain',
    })
  })

  it('401 에러 시 UNAUTHORIZED AppError를 throw한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.post).mockRejectedValueOnce(createMockAxiosError(401))

    await expect(fileService.getPresignedUrl('file.txt', 'text/plain')).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    })
  })
})

describe('fileService.uploadToS3', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('성공 시 void를 반환한다', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({ ok: true })
    vi.stubGlobal('fetch', mockFetch)
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })

    await expect(fileService.uploadToS3(mockPresigned, file)).resolves.toBeUndefined()
    expect(mockFetch).toHaveBeenCalledWith(
      mockPresigned.url,
      expect.objectContaining({ method: 'POST' }),
    )
    vi.unstubAllGlobals()
  })

  it('응답이 ok가 아닐 때 에러를 throw한다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ ok: false, status: 403 }))
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })

    await expect(fileService.uploadToS3(mockPresigned, file)).rejects.toMatchObject({
      code: 'UPLOAD_FAILED',
    })
    vi.unstubAllGlobals()
  })
})

describe('fileService.registerAttachment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('성공 시 Attachment를 반환한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { data: mockAttachment, error: null, meta: null },
    })

    const body = { key: 'uploads/test-file.txt' }
    const result = await fileService.registerAttachment(1, body)
    expect(result).toEqual(mockAttachment)
    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/posts/1/attachments', body)
  })

  it('500 에러 시 SERVER_ERROR AppError를 throw한다', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.post).mockRejectedValueOnce(createMockAxiosError(500))

    await expect(
      fileService.registerAttachment(1, {
        key: 'uploads/test-file.txt',
      }),
    ).rejects.toMatchObject({ code: 'SERVER_ERROR' })
  })
})
