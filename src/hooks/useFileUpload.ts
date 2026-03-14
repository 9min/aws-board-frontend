import { useState } from 'react'
import { fileService } from '@/services/fileService'
import type { Attachment } from '@/types/file'
import { getErrorMessage } from '@/utils/error'

interface UseFileUploadResult {
  isUploading: boolean
  error: string | null
  upload: (postId: number, file: File) => Promise<Attachment | null>
}

export function useFileUpload(): UseFileUploadResult {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = async (postId: number, file: File): Promise<Attachment | null> => {
    setIsUploading(true)
    setError(null)

    try {
      // 1. Presigned URL 발급
      const presigned = await fileService.getPresignedUrl(file.name, file.type)

      // 2. S3에 직접 업로드
      await fileService.uploadToS3(presigned, file)

      // 3. 첨부파일 메타데이터 등록
      const attachment = await fileService.registerAttachment(postId, {
        key: presigned.fields.key ?? file.name,
      })

      return attachment
    } catch (err) {
      setError(getErrorMessage(err))
      return null
    } finally {
      setIsUploading(false)
    }
  }

  return { isUploading, error, upload }
}
