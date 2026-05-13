import logging
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional

from app.models.schemas import (
    DocumentIngestRequest,
    DocumentIngestResponse,
    DocumentListResponse,
    DocumentListItem,
)
from app.models.enums import LegalDomain, DocumentType
from app.services.document_processor import get_document_processor
from app.services.vector_store import get_vector_store_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/ingest", response_model=DocumentIngestResponse)
async def ingest_document(request: DocumentIngestRequest):
    """Ingest a legal document (plain text) into the knowledge base."""
    try:
        processor = get_document_processor()
        document_id, chunk_count = processor.ingest_text(
            content=request.content,
            title=request.title,
            document_type=request.document_type,
            domain=request.domain,
            citation=request.citation,
            jurisdiction=request.jurisdiction,
            url=request.url,
        )
        return DocumentIngestResponse(
            document_id=document_id,
            title=request.title,
            chunks_created=chunk_count,
            message=f"Successfully ingested '{request.title}' into the knowledge base.",
        )
    except Exception as exc:
        logger.error("Ingest error: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/upload", response_model=DocumentIngestResponse)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    document_type: DocumentType = Form(DocumentType.OTHER),
    domain: LegalDomain = Form(LegalDomain.GENERAL),
    citation: Optional[str] = Form(None),
    jurisdiction: Optional[str] = Form(None),
):
    """Upload a PDF or DOCX legal document for ingestion."""
    processor = get_document_processor()
    content = await file.read()
    filename = file.filename or ""

    try:
        if filename.lower().endswith(".pdf"):
            document_id, chunk_count = processor.ingest_pdf_bytes(
                pdf_bytes=content,
                title=title,
                document_type=document_type,
                domain=domain,
                citation=citation,
                jurisdiction=jurisdiction,
            )
        elif filename.lower().endswith(".docx"):
            document_id, chunk_count = processor.ingest_docx_bytes(
                docx_bytes=content,
                title=title,
                document_type=document_type,
                domain=domain,
                citation=citation,
                jurisdiction=jurisdiction,
            )
        elif filename.lower().endswith(".txt"):
            document_id, chunk_count = processor.ingest_text(
                content=content.decode("utf-8", errors="replace"),
                title=title,
                document_type=document_type,
                domain=domain,
                citation=citation,
                jurisdiction=jurisdiction,
            )
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type. Use PDF, DOCX, or TXT.",
            )

        return DocumentIngestResponse(
            document_id=document_id,
            title=title,
            chunks_created=chunk_count,
            message=f"Successfully uploaded and ingested '{title}'.",
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Upload error: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("", response_model=DocumentListResponse)
async def list_documents():
    """List all documents in the knowledge base."""
    vector_store = get_vector_store_service()
    raw_docs = vector_store.list_documents()

    items = []
    seen_ids = set()
    for meta in raw_docs:
        doc_id = meta.get("document_id", "unknown")
        if doc_id in seen_ids:
            continue
        seen_ids.add(doc_id)
        try:
            doc_type = DocumentType(meta.get("document_type", "other"))
        except ValueError:
            doc_type = DocumentType.OTHER
        try:
            domain = LegalDomain(meta.get("domain", "general"))
        except ValueError:
            domain = LegalDomain.GENERAL

        items.append(
            DocumentListItem(
                document_id=doc_id,
                title=meta.get("title", "Unknown"),
                citation=meta.get("citation") or None,
                document_type=doc_type,
                domain=domain,
                jurisdiction=meta.get("jurisdiction") or None,
                chunk_count=1,  # Simplified; full count requires extra query
            )
        )

    return DocumentListResponse(documents=items, total=len(items))


@router.delete("/{document_id}")
async def delete_document(document_id: str):
    """Remove a document from the knowledge base."""
    vector_store = get_vector_store_service()
    success = vector_store.delete_document(document_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found.")
    return {"message": f"Document {document_id} deleted successfully."}
