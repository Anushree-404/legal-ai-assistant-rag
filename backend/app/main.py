"""Legal AI Assistant — FastAPI application entry point."""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import chat, documents, health

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize services on startup."""
    settings = get_settings()
    logger.info("Starting Legal AI Assistant")
    logger.info("LLM model: %s | Embedding: %s", settings.llm_model, settings.embedding_model)
    logger.info("Vector store: %s", settings.chroma_persist_dir)
    yield
    logger.info("Shutting down Legal AI Assistant")


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="Legal AI Assistant",
        description=(
            "A specialized Legal Research AI Assistant powered by RAG. "
            "Provides legal information, case law research, and document analysis. "
            "Not a substitute for professional legal advice."
        ),
        version="1.0.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers
    app.include_router(health.router)
    app.include_router(chat.router)
    app.include_router(documents.router)

    @app.get("/")
    async def root():
        return {
            "name": "Legal AI Assistant",
            "version": "1.0.0",
            "docs": "/docs",
            "disclaimer": (
                "This service provides general legal information only. "
                "It is not legal advice and does not create an attorney-client relationship."
            ),
        }

    return app


app = create_app()
