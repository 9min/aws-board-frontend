import { useState } from 'react'
import { fileService } from '@/services/fileService'
import { getErrorMessage } from '@/utils/error'

interface UseDeleteAttachmentResult {
  isDeleting: boolean
  error: string | null
  deleteAttachment: (postId: number, attachmentId: number) => Promise<boolean>
}

export function useDeleteAttachment(): UseDeleteAttachmentResult {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteAttachment = async (postId: number, attachmentId: number): Promise<boolean> => {
    setIsDeleting(true)
    setError(null)

    try {
      await fileService.deleteAttachment(postId, attachmentId)
      return true
    } catch (err) {
      setError(getErrorMessage(err))
      return false
    } finally {
      setIsDeleting(false)
    }
  }

  return { isDeleting, error, deleteAttachment }
}
