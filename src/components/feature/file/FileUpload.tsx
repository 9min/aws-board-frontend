import { useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useDeleteAttachment } from '@/hooks/useDeleteAttachment'
import { useFileUpload } from '@/hooks/useFileUpload'
import type { Attachment } from '@/types/file'
import type { Post } from '@/types/post'
import { formatDate } from '@/utils/formatDate'

interface FileUploadProps {
  postId: number
  existingAttachments: Attachment[]
  onUploadComplete: () => void
}

export function FileUpload({ postId, existingAttachments, onUploadComplete }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [attachments, setAttachments] = useState<Attachment[]>(existingAttachments)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const { isUploading, error, upload } = useFileUpload()
  const { deleteAttachment } = useDeleteAttachment()
  const queryClient = useQueryClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] ?? null)
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    const result = await upload(postId, selectedFile)
    if (result) {
      setAttachments((prev) => [...prev, result])
      setSelectedFile(null)
      if (inputRef.current) inputRef.current.value = ''
      onUploadComplete()
    }
  }

  const handleDelete = async (attachment: Attachment) => {
    if (!window.confirm('첨부파일을 삭제하시겠습니까?')) return
    setDeletingId(attachment.id)
    const ok = await deleteAttachment(postId, attachment.id)
    setDeletingId(null)
    if (ok) {
      setAttachments((prev) => prev.filter((a) => a.id !== attachment.id))
      queryClient.setQueryData<Post>(['posts', postId], (old) =>
        old
          ? { ...old, attachments: (old.attachments ?? []).filter((a) => a.id !== attachment.id) }
          : old,
      )
    }
  }

  return (
    <div className="mt-4">
      <h3 className="mb-2 text-base font-semibold">첨부파일</h3>

      {attachments.length > 0 && (
        <ul className="mb-3 space-y-1">
          {attachments.map((attachment) => (
            <li key={attachment.id} className="flex items-center gap-2 text-sm">
              <a
                href={attachment.url}
                download={attachment.key.split('/').pop()}
                className="text-blue-600 hover:underline"
              >
                {attachment.key.split('/').pop()}
              </a>
              <span className="text-muted-foreground">({formatDate(attachment.createdAt)})</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void handleDelete(attachment)}
                isLoading={deletingId === attachment.id}
              >
                삭제
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-lg border border-dashed border-border p-4">
        <input
          ref={inputRef}
          type="file"
          onChange={handleFileChange}
          aria-label="파일 선택"
          className="hidden"
        />
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            파일 선택
          </Button>
          <span className="text-sm text-muted-foreground">
            {selectedFile ? selectedFile.name : '선택된 파일 없음'}
          </span>
          <Button
            type="button"
            size="sm"
            onClick={() => void handleUpload()}
            isLoading={isUploading}
            disabled={!selectedFile}
            className="ml-auto"
          >
            업로드
          </Button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
