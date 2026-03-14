import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FileUpload } from './FileUpload'

const mockUpload = vi.fn()
const mockDeleteAttachment = vi.fn()

vi.mock('@/hooks/useFileUpload', () => ({
  useFileUpload: () => ({
    isUploading: false,
    error: null,
    upload: mockUpload,
  }),
}))

vi.mock('@/hooks/useDeleteAttachment', () => ({
  useDeleteAttachment: () => ({
    isDeleting: false,
    error: null,
    deleteAttachment: mockDeleteAttachment,
  }),
}))

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>()
  return { ...actual, useQueryClient: () => ({ setQueryData: vi.fn() }) }
})

const mockAttachment = {
  id: 1,
  postId: 1,
  key: 'uploads/1/document.pdf',
  url: 'https://s3.example.com/uploads/document.pdf',
  createdAt: '2024-01-01T00:00:00.000Z',
}

describe('FileUpload', () => {
  const mockOnUploadComplete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('파일 선택 입력과 업로드 버튼을 렌더링한다', () => {
    render(
      <FileUpload postId={1} existingAttachments={[]} onUploadComplete={mockOnUploadComplete} />,
    )
    expect(screen.getByLabelText('파일 선택')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '업로드' })).toBeInTheDocument()
  })

  it('기존 첨부파일 목록을 표시한다', () => {
    render(
      <FileUpload
        postId={1}
        existingAttachments={[mockAttachment]}
        onUploadComplete={mockOnUploadComplete}
      />,
    )
    expect(screen.getByText('document.pdf')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'document.pdf' })).toHaveAttribute(
      'href',
      mockAttachment.url,
    )
  })

  it('첨부파일이 없으면 목록을 표시하지 않는다', () => {
    render(
      <FileUpload postId={1} existingAttachments={[]} onUploadComplete={mockOnUploadComplete} />,
    )
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('파일 선택 전에는 업로드 버튼이 비활성화된다', () => {
    render(
      <FileUpload postId={1} existingAttachments={[]} onUploadComplete={mockOnUploadComplete} />,
    )
    expect(screen.getByRole('button', { name: '업로드' })).toBeDisabled()
  })

  it('파일 선택 후 업로드 버튼이 활성화된다', async () => {
    const user = userEvent.setup()
    render(
      <FileUpload postId={1} existingAttachments={[]} onUploadComplete={mockOnUploadComplete} />,
    )

    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    await user.upload(screen.getByLabelText('파일 선택'), file)

    expect(screen.getByRole('button', { name: '업로드' })).not.toBeDisabled()
  })

  it('업로드 성공 시 onUploadComplete를 호출한다', async () => {
    const user = userEvent.setup()
    mockUpload.mockResolvedValueOnce(mockAttachment)
    render(
      <FileUpload postId={1} existingAttachments={[]} onUploadComplete={mockOnUploadComplete} />,
    )

    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    await user.upload(screen.getByLabelText('파일 선택'), file)
    await user.click(screen.getByRole('button', { name: '업로드' }))

    await waitFor(() => {
      expect(mockOnUploadComplete).toHaveBeenCalledTimes(1)
    })
  })

  it('업로드 성공 시 첨부파일 목록에 즉시 추가된다', async () => {
    const user = userEvent.setup()
    mockUpload.mockResolvedValueOnce(mockAttachment)
    render(
      <FileUpload postId={1} existingAttachments={[]} onUploadComplete={mockOnUploadComplete} />,
    )

    const file = new File(['content'], 'document.pdf', { type: 'application/pdf' })
    await user.upload(screen.getByLabelText('파일 선택'), file)
    await user.click(screen.getByRole('button', { name: '업로드' }))

    await waitFor(() => {
      expect(screen.getByText('document.pdf')).toBeInTheDocument()
    })
  })

  it('업로드 실패(null 반환) 시 onUploadComplete를 호출하지 않는다', async () => {
    const user = userEvent.setup()
    mockUpload.mockResolvedValueOnce(null)
    render(
      <FileUpload postId={1} existingAttachments={[]} onUploadComplete={mockOnUploadComplete} />,
    )

    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    await user.upload(screen.getByLabelText('파일 선택'), file)
    await user.click(screen.getByRole('button', { name: '업로드' }))

    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalled()
    })
    expect(mockOnUploadComplete).not.toHaveBeenCalled()
  })

  it('각 첨부파일 항목에 삭제 버튼이 렌더링된다', () => {
    render(
      <FileUpload
        postId={1}
        existingAttachments={[mockAttachment]}
        onUploadComplete={mockOnUploadComplete}
      />,
    )
    expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument()
  })

  it('삭제 버튼 클릭 후 confirm 취소 시 삭제를 호출하지 않는다', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValueOnce(false)
    render(
      <FileUpload
        postId={1}
        existingAttachments={[mockAttachment]}
        onUploadComplete={mockOnUploadComplete}
      />,
    )

    await user.click(screen.getByRole('button', { name: '삭제' }))

    expect(mockDeleteAttachment).not.toHaveBeenCalled()
    expect(screen.getByText('document.pdf')).toBeInTheDocument()
  })

  it('삭제 성공 시 목록에서 해당 항목이 제거된다', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValueOnce(true)
    mockDeleteAttachment.mockResolvedValueOnce(true)
    render(
      <FileUpload
        postId={1}
        existingAttachments={[mockAttachment]}
        onUploadComplete={mockOnUploadComplete}
      />,
    )

    await user.click(screen.getByRole('button', { name: '삭제' }))

    await waitFor(() => {
      expect(screen.queryByText('document.pdf')).not.toBeInTheDocument()
    })
    expect(mockDeleteAttachment).toHaveBeenCalledWith(1, mockAttachment.id)
  })

  it('삭제 실패 시 목록에서 항목이 제거되지 않는다', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValueOnce(true)
    mockDeleteAttachment.mockResolvedValueOnce(false)
    render(
      <FileUpload
        postId={1}
        existingAttachments={[mockAttachment]}
        onUploadComplete={mockOnUploadComplete}
      />,
    )

    await user.click(screen.getByRole('button', { name: '삭제' }))

    await waitFor(() => {
      expect(mockDeleteAttachment).toHaveBeenCalled()
    })
    expect(screen.getByText('document.pdf')).toBeInTheDocument()
  })
})
