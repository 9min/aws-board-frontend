import { useQueryClient } from '@tanstack/react-query'
import { Paperclip, Trash2, Upload } from 'lucide-react'
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
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
      <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-[hsl(var(--foreground))]">
        <Paperclip className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
        첨부파일
      </h3>

      {attachments.length > 0 && (
        <ul className="mb-3 space-y-1.5">
          {attachments.map((attachment) => (
            <li
              key={attachment.id}
              className="flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.4)] px-3 py-2 text-sm"
            >
              <Paperclip className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--muted-foreground))]" />
              <a
                href={attachment.url}
                download={attachment.key.split('/').pop()}
                className="flex-1 truncate text-[hsl(var(--accent))] hover:underline"
              >
                {attachment.key.split('/').pop()}
              </a>
              <span className="shrink-0 text-xs text-[hsl(var(--muted-foreground))]">
                {formatDate(attachment.createdAt)}
              </span>
              <button
                type="button"
                onClick={() => void handleDelete(attachment)}
                disabled={deletingId === attachment.id}
                className="shrink-0 cursor-pointer rounded p-0.5 text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--destructive))] disabled:opacity-50"
                aria-label="삭제"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-lg border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] p-3">
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
          <span className="flex-1 truncate text-sm text-[hsl(var(--muted-foreground))]">
            {selectedFile ? selectedFile.name : '선택된 파일 없음'}
          </span>
          <Button
            type="button"
            size="sm"
            onClick={() => void handleUpload()}
            isLoading={isUploading}
            disabled={!selectedFile}
            className="shrink-0 flex items-center gap-1.5"
          >
            <Upload className="h-3.5 w-3.5" />
            업로드
          </Button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-sm text-[hsl(var(--destructive))]">
          {error}
        </p>
      )}
    </div>
  )
}
