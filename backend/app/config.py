from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    openai_api_key: str
    chroma_persist_dir: str = "./chroma_db"
    collection_name: str = "legal_knowledge"
    max_retrieval_docs: int = 5
    chunk_size: int = 1000
    chunk_overlap: int = 200
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # LLM settings
    llm_model: str = "gpt-4o"
    embedding_model: str = "text-embedding-3-small"
    temperature: float = 0.1
    max_tokens: int = 2048

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]


@lru_cache()
def get_settings() -> Settings:
    return Settings()
