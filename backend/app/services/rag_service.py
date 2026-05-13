"""Main RAG orchestration service."""
import logging
from typing import Optional

from app.models.schemas import ChatRequest, ChatResponse, LegalSource
from app.models.enums import LegalDomain, DocumentType
from app.services.vector_store import get_vector_store_service
from app.services.llm_service import get_llm_service
from app.config import get_settings

logger = logging.getLogger(__name__)


class RAGService:
    """Orchestrates retrieval + generation for legal queries."""

    def __init__(self):
        self.settings = get_settings()
        self.vector_store = get_vector_store_service()
        self.llm_service = get_llm_service()

    def query(self, request: ChatRequest) -> ChatResponse:
        """
        Full RAG pipeline:
        1. Detect domain (if not provided)
        2. Retrieve relevant legal documents
        3. Generate grounded response
        4. Format sources
        """
        # Step 1: Domain detection
        domain = request.domain
        if domain is None:
            domain = self.llm_service.detect_domain(request.query)
            logger.info("Detected domain: %s", domain)

        # Step 2: Retrieve relevant documents
        retrieved_docs = self.vector_store.similarity_search(
            query=request.query,
            k=self.settings.max_retrieval_docs,
            domain_filter=domain if domain != LegalDomain.GENERAL else None,
            jurisdiction_filter=request.jurisdiction,
        )

        # If domain-filtered search returns too few results, retry without filter
        if len(retrieved_docs) < 2 and domain != LegalDomain.GENERAL:
            logger.info("Few results with domain filter, retrying without filter")
            retrieved_docs = self.vector_store.similarity_search(
                query=request.query,
                k=self.settings.max_retrieval_docs,
            )

        logger.info("Retrieved %d documents for query", len(retrieved_docs))

        # Step 3: Generate response
        answer = self.llm_service.generate_response(
            query=request.query,
            retrieved_docs=retrieved_docs,
            conversation_history=request.conversation_history,
            domain=domain,
            jurisdiction=request.jurisdiction,
        )

        # Step 4: Build source citations
        sources: list[LegalSource] = []
        if request.include_sources:
            for doc in retrieved_docs:
                meta = doc.metadata
                try:
                    doc_type = DocumentType(meta.get("document_type", "other"))
                except ValueError:
                    doc_type = DocumentType.OTHER
                try:
                    doc_domain = LegalDomain(meta.get("domain", "general"))
                except ValueError:
                    doc_domain = LegalDomain.GENERAL

                sources.append(
                    LegalSource(
                        title=meta.get("title", "Unknown Source"),
                        citation=meta.get("citation", ""),
                        content_snippet=doc.page_content[:300] + ("..." if len(doc.page_content) > 300 else ""),
                        document_type=doc_type,
                        domain=doc_domain,
                        jurisdiction=meta.get("jurisdiction") or None,
                        relevance_score=meta.get("relevance_score", 0.0),
                        url=meta.get("url") or None,
                    )
                )

        return ChatResponse(
            answer=answer,
            sources=sources,
            domain_detected=domain,
        )


_rag_service: Optional[RAGService] = None


def get_rag_service() -> RAGService:
    global _rag_service
    if _rag_service is None:
        _rag_service = RAGService()
    return _rag_service
