from fastapi import APIRouter
from app.models.schemas import HealthResponse
from app.services.vector_store import get_vector_store_service
from app.config import get_settings

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", response_model=HealthResponse)
async def health_check():
    settings = get_settings()
    vector_store = get_vector_store_service()
    return HealthResponse(
        status="ok",
        vector_store_docs=vector_store.get_document_count(),
        llm_model=settings.llm_model,
        embedding_model=settings.embedding_model,
    )
