from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from .enums import LegalDomain, DocumentType, MessageRole


# ── Chat schemas ──────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: MessageRole
    content: str


class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=4000, description="Legal question or query")
    conversation_history: list[ChatMessage] = Field(default_factory=list)
    domain: Optional[LegalDomain] = Field(None, description="Specific legal domain to focus on")
    jurisdiction: Optional[str] = Field(None, description="Jurisdiction (e.g., 'federal', 'California', 'New York')")
    include_sources: bool = Field(True, description="Whether to include source citations")


class LegalSource(BaseModel):
    title: str
    citation: str
    content_snippet: str
    document_type: DocumentType
    domain: LegalDomain
    jurisdiction: Optional[str] = None
    relevance_score: float = Field(ge=0.0, le=1.0)
    url: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    sources: list[LegalSource] = Field(default_factory=list)
    domain_detected: Optional[LegalDomain] = None
    disclaimer: str = (
        "This is general legal information, not legal advice. "
        "Consult a licensed attorney for advice specific to your situation."
    )
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ── Document ingestion schemas ────────────────────────────────────────────────

class DocumentIngestRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    citation: Optional[str] = Field(None, description="Legal citation (e.g., '42 U.S.C. § 1983')")
    document_type: DocumentType = DocumentType.OTHER
    domain: LegalDomain = LegalDomain.GENERAL
    jurisdiction: Optional[str] = None
    content: str = Field(..., min_length=10, description="Full text content of the document")
    url: Optional[str] = None


class DocumentIngestResponse(BaseModel):
    document_id: str
    title: str
    chunks_created: int
    message: str


class DocumentListItem(BaseModel):
    document_id: str
    title: str
    citation: Optional[str]
    document_type: DocumentType
    domain: LegalDomain
    jurisdiction: Optional[str]
    chunk_count: int


class DocumentListResponse(BaseModel):
    documents: list[DocumentListItem]
    total: int


# ── Health schema ─────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    vector_store_docs: int
    llm_model: str
    embedding_model: str
