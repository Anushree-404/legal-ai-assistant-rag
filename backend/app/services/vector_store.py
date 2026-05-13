"""ChromaDB vector store operations."""
import uuid
import logging
from typing import Optional

import chromadb
from chromadb.config import Settings as ChromaSettings
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain.schema import Document

from app.config import get_settings
from app.models.enums import LegalDomain, DocumentType

logger = logging.getLogger(__name__)


class VectorStoreService:
    """Manages the ChromaDB vector store for legal documents."""

    def __init__(self):
        self.settings = get_settings()
        self.embeddings = OpenAIEmbeddings(
            model=self.settings.embedding_model,
            openai_api_key=self.settings.openai_api_key,
        )
        self._store: Optional[Chroma] = None
        self._client: Optional[chromadb.PersistentClient] = None

    def _get_client(self) -> chromadb.PersistentClient:
        if self._client is None:
            self._client = chromadb.PersistentClient(
                path=self.settings.chroma_persist_dir,
                settings=ChromaSettings(anonymized_telemetry=False),
            )
        return self._client

    def get_store(self) -> Chroma:
        if self._store is None:
            self._store = Chroma(
                client=self._get_client(),
                collection_name=self.settings.collection_name,
                embedding_function=self.embeddings,
            )
        return self._store

    def add_documents(
        self,
        chunks: list[str],
        metadata_list: list[dict],
        document_id: str,
    ) -> int:
        """Add document chunks to the vector store."""
        store = self.get_store()
        docs = [
            Document(page_content=chunk, metadata={**meta, "document_id": document_id})
            for chunk, meta in zip(chunks, metadata_list)
        ]
        ids = [str(uuid.uuid4()) for _ in docs]
        store.add_documents(docs, ids=ids)
        logger.info("Added %d chunks for document %s", len(docs), document_id)
        return len(docs)

    def similarity_search(
        self,
        query: str,
        k: int = 5,
        domain_filter: Optional[LegalDomain] = None,
        jurisdiction_filter: Optional[str] = None,
    ) -> list[Document]:
        """Retrieve top-k relevant documents with optional filters."""
        store = self.get_store()

        where: dict = {}
        if domain_filter:
            where["domain"] = domain_filter.value
        if jurisdiction_filter:
            where["jurisdiction"] = jurisdiction_filter

        kwargs: dict = {"k": k}
        if where:
            kwargs["filter"] = where

        try:
            results = store.similarity_search_with_relevance_scores(query, **kwargs)
            # results: list of (Document, score)
            docs = []
            for doc, score in results:
                doc.metadata["relevance_score"] = round(score, 4)
                docs.append(doc)
            return docs
        except Exception as exc:
            logger.warning("Similarity search failed: %s. Retrying without filter.", exc)
            results = store.similarity_search_with_relevance_scores(query, k=k)
            docs = []
            for doc, score in results:
                doc.metadata["relevance_score"] = round(score, 4)
                docs.append(doc)
            return docs

    def get_document_count(self) -> int:
        """Return total number of chunks in the store."""
        try:
            client = self._get_client()
            collection = client.get_or_create_collection(self.settings.collection_name)
            return collection.count()
        except Exception:
            return 0

    def list_documents(self) -> list[dict]:
        """Return unique documents (by document_id) stored in the vector store."""
        try:
            client = self._get_client()
            collection = client.get_or_create_collection(self.settings.collection_name)
            results = collection.get(include=["metadatas"])
            seen: dict[str, dict] = {}
            for meta in results["metadatas"]:
                doc_id = meta.get("document_id", "unknown")
                if doc_id not in seen:
                    seen[doc_id] = meta
            return list(seen.values())
        except Exception as exc:
            logger.error("Failed to list documents: %s", exc)
            return []

    def delete_document(self, document_id: str) -> bool:
        """Delete all chunks belonging to a document."""
        try:
            client = self._get_client()
            collection = client.get_or_create_collection(self.settings.collection_name)
            results = collection.get(where={"document_id": document_id})
            if results["ids"]:
                collection.delete(ids=results["ids"])
                logger.info("Deleted %d chunks for document %s", len(results["ids"]), document_id)
                return True
            return False
        except Exception as exc:
            logger.error("Failed to delete document %s: %s", document_id, exc)
            return False


# Singleton
_vector_store_service: Optional[VectorStoreService] = None


def get_vector_store_service() -> VectorStoreService:
    global _vector_store_service
    if _vector_store_service is None:
        _vector_store_service = VectorStoreService()
    return _vector_store_service
