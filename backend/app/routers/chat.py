import logging
from fastapi import APIRouter, HTTPException

from app.models.schemas import ChatRequest, ChatResponse
from app.services.rag_service import get_rag_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Submit a legal query and receive a RAG-powered response with citations.
    """
    try:
        rag_service = get_rag_service()
        response = rag_service.query(request)
        return response
    except Exception as exc:
        logger.error("Chat error: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal error: {str(exc)}")
