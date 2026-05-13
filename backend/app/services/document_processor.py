"""Document ingestion and chunking service."""
import uuid
import logging
from typing import Optional

from langchain.text_splitter import RecursiveCharacterTextSplitter

from app.config import get_settings
from app.models.enums import LegalDomain, DocumentType
from app.services.vector_store import get_vector_store_service

logger = logging.getLogger(__name__)


class DocumentProcessor:
    """Handles text splitting and ingestion into the vector store."""

    def __init__(self):
        self.settings = get_settings()
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.settings.chunk_size,
            chunk_overlap=self.settings.chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""],
        )
        self.vector_store = get_vector_store_service()

    def ingest_text(
        self,
        content: str,
        title: str,
        document_type: DocumentType,
        domain: LegalDomain,
        citation: Optional[str] = None,
        jurisdiction: Optional[str] = None,
        url: Optional[str] = None,
    ) -> tuple[str, int]:
        """
        Split text into chunks and store in vector DB.
        Returns (document_id, chunk_count).
        """
        document_id = str(uuid.uuid4())
        chunks = self.splitter.split_text(content)

        base_metadata = {
            "title": title,
            "citation": citation or "",
            "document_type": document_type.value,
            "domain": domain.value,
            "jurisdiction": jurisdiction or "general",
            "url": url or "",
        }
        metadata_list = [base_metadata.copy() for _ in chunks]

        chunk_count = self.vector_store.add_documents(chunks, metadata_list, document_id)
        logger.info("Ingested document '%s' (%s chunks)", title, chunk_count)
        return document_id, chunk_count

    def ingest_pdf_bytes(
        self,
        pdf_bytes: bytes,
        title: str,
        document_type: DocumentType,
        domain: LegalDomain,
        citation: Optional[str] = None,
        jurisdiction: Optional[str] = None,
    ) -> tuple[str, int]:
        """Extract text from PDF bytes and ingest."""
        try:
            import io
            from pypdf import PdfReader

            reader = PdfReader(io.BytesIO(pdf_bytes))
            text = "\n\n".join(
                page.extract_text() or "" for page in reader.pages
            )
            return self.ingest_text(
                content=text,
                title=title,
                document_type=document_type,
                domain=domain,
                citation=citation,
                jurisdiction=jurisdiction,
            )
        except ImportError:
            raise RuntimeError("pypdf is required for PDF processing. Run: pip install pypdf")

    def ingest_docx_bytes(
        self,
        docx_bytes: bytes,
        title: str,
        document_type: DocumentType,
        domain: LegalDomain,
        citation: Optional[str] = None,
        jurisdiction: Optional[str] = None,
    ) -> tuple[str, int]:
        """Extract text from DOCX bytes and ingest."""
        try:
            import io
            from docx import Document as DocxDocument

            doc = DocxDocument(io.BytesIO(docx_bytes))
            text = "\n\n".join(para.text for para in doc.paragraphs if para.text.strip())
            return self.ingest_text(
                content=text,
                title=title,
                document_type=document_type,
                domain=domain,
                citation=citation,
                jurisdiction=jurisdiction,
            )
        except ImportError:
            raise RuntimeError("python-docx is required for DOCX processing.")


_processor: Optional[DocumentProcessor] = None


def get_document_processor() -> DocumentProcessor:
    global _processor
    if _processor is None:
        _processor = DocumentProcessor()
    return _processor
