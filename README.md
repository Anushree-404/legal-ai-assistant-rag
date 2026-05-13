# Legal AI Assistant

A specialized Legal Research AI Assistant powered by Retrieval-Augmented Generation (RAG).

## Features

- **Legal Research & Analysis** — Retrieve statutes, case law, and legal precedents
- **Document Analysis** — Review contracts and legal documents
- **Legal Concept Explanation** — Define terms, explain procedures with examples
- **Preliminary Assessment** — Analyze factual scenarios against applicable law
- **RAG Pipeline** — ChromaDB vector store + LangChain retrieval

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend API | FastAPI (Python) |
| RAG Framework | LangChain |
| Vector Store | ChromaDB |
| Embeddings | OpenAI `text-embedding-3-small` |
| LLM | OpenAI `gpt-4o` |
| Frontend | React + TypeScript + Tailwind CSS |

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Add your OPENAI_API_KEY
python -m app.data.seed_legal_data
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173
