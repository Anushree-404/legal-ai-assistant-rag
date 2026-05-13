import { useState, useCallback } from 'react'
import { api } from '../services/api'
import type { DocumentIngestRequest, DocumentIngestResponse } from '../types'

export function useDocuments() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<DocumentIngestResponse | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const ingestText = useCallback(async (payload: DocumentIngestRequest) => {
    setIsUploading(true)
    setUploadError(null)
    setUploadResult(null)
    try {
      const result = await api.ingestDocument(payload)
      setUploadResult(result)
      return result
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      setUploadError(msg)
      throw err
    } finally {
      setIsUploading(false)
    }
  }, [])

  const uploadFile = useCallback(
    async (
      file: File,
      title: string,
      documentType: string,
      domain: string,
      citation?: string,
      jurisdiction?: string
    ) => {
      setIsUploading(true)
      setUploadError(null)
      setUploadResult(null)
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('title', title)
        formData.append('document_type', documentType)
        formData.append('domain', domain)
        if (citation) formData.append('citation', citation)
        if (jurisdiction) formData.append('jurisdiction', jurisdiction)

        const result = await api.uploadDocument(formData)
        setUploadResult(result)
        return result
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed'
        setUploadError(msg)
        throw err
      } finally {
        setIsUploading(false)
      }
    },
    []
  )

  const reset = useCallback(() => {
    setUploadResult(null)
    setUploadError(null)
  }, [])

  return { isUploading, uploadResult, uploadError, ingestText, uploadFile, reset }
}
