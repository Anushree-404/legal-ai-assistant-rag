import type {
  ChatRequest,
  ChatResponse,
  DocumentIngestRequest,
  DocumentIngestResponse,
  HealthResponse,
} from '../types'

const BASE_URL = ''

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(error.detail || `HTTP ${res.status}`)
  }

  return res.json()
}

export const api = {
  /** Send a legal query and get a RAG-powered response */
  chat: (payload: ChatRequest): Promise<ChatResponse> =>
    request<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  /** Ingest a plain-text legal document */
  ingestDocument: (payload: DocumentIngestRequest): Promise<DocumentIngestResponse> =>
    request<DocumentIngestResponse>('/documents/ingest', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  /** Upload a PDF/DOCX/TXT file */
  uploadDocument: (formData: FormData): Promise<DocumentIngestResponse> =>
    fetch(`${BASE_URL}/documents/upload`, {
      method: 'POST',
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: res.statusText }))
        throw new Error(error.detail || `HTTP ${res.status}`)
      }
      return res.json()
    }),

  /** Health check */
  health: (): Promise<HealthResponse> => request<HealthResponse>('/health'),
}
