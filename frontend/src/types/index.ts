export type LegalDomain =
  | 'constitutional'
  | 'criminal'
  | 'civil'
  | 'contract'
  | 'tort'
  | 'property'
  | 'family'
  | 'employment'
  | 'immigration'
  | 'intellectual_property'
  | 'corporate'
  | 'tax'
  | 'environmental'
  | 'administrative'
  | 'general'

export type DocumentType =
  | 'statute'
  | 'case_law'
  | 'regulation'
  | 'contract'
  | 'legal_brief'
  | 'article'
  | 'other'

export type MessageRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  role: MessageRole
  content: string
}

export interface LegalSource {
  title: string
  citation: string
  content_snippet: string
  document_type: DocumentType
  domain: LegalDomain
  jurisdiction: string | null
  relevance_score: number
  url: string | null
}

export interface ChatRequest {
  query: string
  conversation_history: ChatMessage[]
  domain?: LegalDomain | null
  jurisdiction?: string | null
  include_sources: boolean
}

export interface ChatResponse {
  answer: string
  sources: LegalSource[]
  domain_detected: LegalDomain | null
  disclaimer: string
  timestamp: string
}

export interface Message {
  id: string
  role: MessageRole
  content: string
  sources?: LegalSource[]
  domain?: LegalDomain | null
  timestamp: Date
  isLoading?: boolean
  bookmarked?: boolean
}

// ── Chat History ──────────────────────────────────────────────────────────────
export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: string
  updatedAt: string
  domain?: LegalDomain | null
}

// ── Analytics ─────────────────────────────────────────────────────────────────
export interface AnalyticsData {
  totalQueries: number
  domainBreakdown: Record<string, number>
  topSources: { title: string; citation: string; count: number }[]
  queriesPerDay: { date: string; count: number }[]
  avgSourcesPerQuery: number
}

export interface DocumentIngestRequest {
  title: string
  citation?: string
  document_type: DocumentType
  domain: LegalDomain
  jurisdiction?: string
  content: string
  url?: string
}

export interface DocumentIngestResponse {
  document_id: string
  title: string
  chunks_created: number
  message: string
}

export interface HealthResponse {
  status: string
  vector_store_docs: number
  llm_model: string
  embedding_model: string
}
