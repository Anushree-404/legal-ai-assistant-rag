"""
Legal AI Assistant — Single-file server
FastAPI + Google Gemini (free tier, google-genai SDK) + numpy vector store
Get a FREE Gemini API key at: https://aistudio.google.com/app/apikey
"""
import os, json, uuid
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / "backend" / ".env")

import time
import numpy as np
from google import genai
from google.genai import types as gtypes
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

# ── Config ────────────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
LLM_MODEL      = os.getenv("LLM_MODEL", "gemini-1.5-flash")
EMBED_MODEL    = os.getenv("EMBED_MODEL", "text-embedding-004")
TOP_K          = int(os.getenv("MAX_RETRIEVAL_DOCS", "5"))
CHUNK_SIZE     = int(os.getenv("CHUNK_SIZE", "800"))
CHUNK_OVERLAP  = int(os.getenv("CHUNK_OVERLAP", "150"))
DB_PATH        = Path(__file__).parent / "backend" / "vector_db.json"

# Gemini client (initialised lazily so server starts even without key)
_gclient: Optional[genai.Client] = None

def get_client() -> genai.Client:
    global _gclient
    if _gclient is None:
        if not GEMINI_API_KEY or GEMINI_API_KEY.startswith("your-"):
            raise HTTPException(400,
                "Set GEMINI_API_KEY in backend/.env — "
                "get a FREE key at https://aistudio.google.com/app/apikey")
        _gclient = genai.Client(api_key=GEMINI_API_KEY)
    return _gclient

# ── Text splitter ─────────────────────────────────────────────────────────────
def _split_text(text: str, size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    words = text.split()
    if not words:
        return [text]
    chunks, i = [], 0
    while i < len(words):
        chunks.append(" ".join(words[i:i + size]))
        i += size - overlap
    return chunks

# ── In-memory vector store ────────────────────────────────────────────────────
class VectorStore:
    def __init__(self):
        self.chunks: list[dict] = []
        self._load()

    def _load(self):
        if DB_PATH.exists():
            try:
                self.chunks = json.loads(DB_PATH.read_text(encoding="utf-8"))
                print(f"[VectorStore] Loaded {len(self.chunks)} chunks from disk.")
            except Exception as e:
                print(f"[VectorStore] Load error: {e}")

    def _save(self):
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        DB_PATH.write_text(json.dumps(self.chunks), encoding="utf-8")

    def _embed(self, text: str, task: str = "RETRIEVAL_DOCUMENT") -> list[float]:
        c = get_client()
        for attempt in range(4):
            try:
                resp = c.models.embed_content(
                    model=EMBED_MODEL,
                    contents=text[:8000],
                    config=gtypes.EmbedContentConfig(task_type=task)
                )
                return resp.embeddings[0].values
            except Exception as e:
                if "RESOURCE_EXHAUSTED" in str(e) and attempt < 3:
                    wait = 30 * (attempt + 1)
                    print(f"[Rate limit] Waiting {wait}s before retry {attempt+1}/3...")
                    time.sleep(wait)
                else:
                    raise

    def _cosine(self, a: list[float], b: list[float]) -> float:
        va = np.array(a, dtype=np.float32)
        vb = np.array(b, dtype=np.float32)
        denom = np.linalg.norm(va) * np.linalg.norm(vb)
        return float(np.dot(va, vb) / denom) if denom > 0 else 0.0

    def add(self, text: str, meta: dict) -> tuple[str, int]:
        doc_id = meta.get("document_id", str(uuid.uuid4()))
        chunks = _split_text(text)
        for chunk in chunks:
            emb = self._embed(chunk, "RETRIEVAL_DOCUMENT")
            self.chunks.append({
                "id": str(uuid.uuid4()),
                "text": chunk,
                "embedding": emb,
                "meta": {**meta, "document_id": doc_id}
            })
        self._save()
        return doc_id, len(chunks)

    def search(self, query: str, k: int = TOP_K,
               domain: str = None, jurisdiction: str = None) -> list[dict]:
        if not self.chunks:
            return []
        q_emb = self._embed(query, "RETRIEVAL_QUERY")
        scored = []
        for c in self.chunks:
            if domain and c["meta"].get("domain") != domain:
                continue
            if jurisdiction and c["meta"].get("jurisdiction", "").lower() != jurisdiction.lower():
                continue
            scored.append((self._cosine(q_emb, c["embedding"]), c))
        if len(scored) < 2 and (domain or jurisdiction):
            scored = [(self._cosine(q_emb, c["embedding"]), c) for c in self.chunks]
        scored.sort(key=lambda x: x[0], reverse=True)
        return [{"score": s, **c} for s, c in scored[:k]]

    def count(self) -> int:
        return len(self.chunks)

    def list_docs(self) -> list[dict]:
        seen = {}
        for c in self.chunks:
            did = c["meta"].get("document_id", "?")
            if did not in seen:
                seen[did] = c["meta"]
        return list(seen.values())

    def delete(self, document_id: str) -> bool:
        before = len(self.chunks)
        self.chunks = [c for c in self.chunks if c["meta"].get("document_id") != document_id]
        if len(self.chunks) < before:
            self._save()
            return True
        return False

store = VectorStore()

# ── Legal system prompt ───────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are a specialized Legal Research AI Assistant powered by Retrieval-Augmented Generation (RAG).

Your role: help users understand legal concepts, research case law, analyze statutes, and provide preliminary legal guidance.

## Response Format (always follow this structure)
1. **Legal Framework** — Explain the applicable law
2. **Relevant Sources** — Cite statutes/cases from the provided context with full citations (e.g., "42 U.S.C. § 1983")
3. **Application** — How the law applies to the question
4. **Limitations** — Jurisdictional variations, unsettled areas, caveats
5. **Next Steps** — Recommend professional consultation when appropriate

## Rules
- ALWAYS cite sources from the retrieved context with full legal citations
- Distinguish established law from uncertain or evolving areas
- NEVER guarantee outcomes or replace attorney judgment
- Flag time-sensitive matters (statutes of limitations, deadlines) prominently
- Do NOT assist with illegal activities or fraud

End every response with:
> ⚠️ **Disclaimer**: This is general legal information, not legal advice. Consult a licensed attorney for advice specific to your situation."""

# ── Pydantic models ───────────────────────────────────────────────────────────
class ChatMsg(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    query: str
    conversation_history: list[ChatMsg] = []
    domain: Optional[str] = None
    jurisdiction: Optional[str] = None
    include_sources: bool = True

class LegalSource(BaseModel):
    title: str
    citation: str
    content_snippet: str
    document_type: str
    domain: str
    jurisdiction: Optional[str] = None
    relevance_score: float
    url: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
    sources: list[LegalSource] = []
    domain_detected: Optional[str] = None
    disclaimer: str = ("This is general legal information, not legal advice. "
                       "Consult a licensed attorney for advice specific to your situation.")

class IngestRequest(BaseModel):
    title: str
    citation: Optional[str] = None
    document_type: str = "other"
    domain: str = "general"
    jurisdiction: Optional[str] = None
    content: str
    url: Optional[str] = None

class IngestResponse(BaseModel):
    document_id: str
    title: str
    chunks_created: int
    message: str

# ── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(title="Legal AI Assistant", version="1.0.0")
app.add_middleware(CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ── Chat endpoint ─────────────────────────────────────────────────────────────
@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    c = get_client()

    results = store.search(req.query, k=TOP_K,
                           domain=req.domain, jurisdiction=req.jurisdiction)

    # Build context block
    if results:
        ctx_lines = ["## Retrieved Legal Sources\n"]
        for i, r in enumerate(results, 1):
            m = r["meta"]
            header = f"### Source {i}: {m.get('title', 'Unknown')}"
            if m.get("citation"):
                header += f" ({m['citation']})"
            ctx_lines.append(header)
            ctx_lines.append(
                f"*{m.get('document_type','doc')} | {m.get('domain','general')}"
                + (f" | {m.get('jurisdiction')}" if m.get("jurisdiction") else "") + "*\n"
            )
            ctx_lines.append(r["text"] + "\n")
        context = "\n".join(ctx_lines)
    else:
        context = "No specific documents retrieved. Answer from general legal knowledge."

    # Build Gemini history
    history = []
    for m in req.conversation_history[-6:]:
        role = "user" if m.role == "user" else "model"
        history.append(gtypes.Content(role=role, parts=[gtypes.Part(text=m.content)]))

    full_prompt = f"{SYSTEM_PROMPT}\n\n## Legal Query\n{req.query}\n\n---\n\n{context}"

    chat_session = c.chats.create(model=LLM_MODEL, history=history)
    for attempt in range(4):
        try:
            response = chat_session.send_message(full_prompt)
            break
        except Exception as e:
            if "RESOURCE_EXHAUSTED" in str(e) and attempt < 3:
                wait = 30 * (attempt + 1)
                print(f"[Rate limit] Chat waiting {wait}s...")
                time.sleep(wait)
            else:
                raise HTTPException(429, f"Gemini rate limit. Please wait 1 minute and try again.")
    answer = response.text

    # Build sources
    sources = []
    if req.include_sources:
        for r in results:
            m = r["meta"]
            sources.append(LegalSource(
                title=m.get("title", "Unknown"),
                citation=m.get("citation", ""),
                content_snippet=r["text"][:300] + ("..." if len(r["text"]) > 300 else ""),
                document_type=m.get("document_type", "other"),
                domain=m.get("domain", "general"),
                jurisdiction=m.get("jurisdiction") or None,
                relevance_score=round(r["score"], 4),
                url=m.get("url") or None,
            ))

    domain_detected = results[0]["meta"].get("domain") if results else req.domain
    return ChatResponse(answer=answer, sources=sources, domain_detected=domain_detected)

# ── Document endpoints ────────────────────────────────────────────────────────
@app.post("/documents/ingest", response_model=IngestResponse)
async def ingest(req: IngestRequest):
    doc_id = str(uuid.uuid4())
    meta = {
        "title": req.title, "citation": req.citation or "",
        "document_type": req.document_type, "domain": req.domain,
        "jurisdiction": req.jurisdiction or "general",
        "url": req.url or "", "document_id": doc_id
    }
    _, chunks = store.add(req.content, meta)
    return IngestResponse(document_id=doc_id, title=req.title,
                          chunks_created=chunks,
                          message=f"Successfully ingested '{req.title}'.")

@app.post("/documents/upload", response_model=IngestResponse)
async def upload(
    file: UploadFile = File(...), title: str = Form(...),
    document_type: str = Form("other"), domain: str = Form("general"),
    citation: Optional[str] = Form(None), jurisdiction: Optional[str] = Form(None)
):
    content_bytes = await file.read()
    fname = (file.filename or "").lower()
    if fname.endswith(".pdf"):
        try:
            import io
            from pypdf import PdfReader
            text = "\n\n".join(p.extract_text() or "" for p in PdfReader(io.BytesIO(content_bytes)).pages)
        except ImportError:
            raise HTTPException(400, "pypdf not installed.")
    elif fname.endswith(".docx"):
        try:
            import io
            from docx import Document as D
            text = "\n\n".join(p.text for p in D(io.BytesIO(content_bytes)).paragraphs if p.text.strip())
        except ImportError:
            raise HTTPException(400, "python-docx not installed.")
    elif fname.endswith(".txt"):
        text = content_bytes.decode("utf-8", errors="replace")
    else:
        raise HTTPException(400, "Unsupported file type. Use PDF, DOCX, or TXT.")

    doc_id = str(uuid.uuid4())
    meta = {
        "title": title, "citation": citation or "",
        "document_type": document_type, "domain": domain,
        "jurisdiction": jurisdiction or "general",
        "url": "", "document_id": doc_id
    }
    _, chunks = store.add(text, meta)
    return IngestResponse(document_id=doc_id, title=title, chunks_created=chunks,
                          message=f"Successfully uploaded '{title}'.")

@app.get("/documents")
async def list_docs():
    docs = store.list_docs()
    return {"documents": docs, "total": len(docs)}

@app.get("/documents/{document_id}")
async def get_document(document_id: str):
    """Return all chunks for a document with full text."""
    chunks = [c for c in store.chunks if c["meta"].get("document_id") == document_id]
    if not chunks:
        raise HTTPException(404, "Document not found.")
    meta = chunks[0]["meta"]
    full_text = "\n\n".join(c["text"] for c in chunks)
    return {
        "document_id": document_id,
        "title": meta.get("title", "Unknown"),
        "citation": meta.get("citation", ""),
        "document_type": meta.get("document_type", "other"),
        "domain": meta.get("domain", "general"),
        "jurisdiction": meta.get("jurisdiction", ""),
        "url": meta.get("url", ""),
        "chunk_count": len(chunks),
        "content": full_text,
    }

@app.delete("/documents/{document_id}")
async def delete_doc(document_id: str):
    if not store.delete(document_id):
        raise HTTPException(404, "Document not found.")
    return {"message": f"Deleted {document_id}"}

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "vector_store_chunks": store.count(),
        "llm_model": LLM_MODEL,
        "embedding_model": EMBED_MODEL,
        "api_key_set": bool(GEMINI_API_KEY and not GEMINI_API_KEY.startswith("your-"))
    }

def _gemini_generate(model: str, contents: str, max_retries: int = 3) -> str:
    """Call Gemini with exponential backoff on 503/429 errors."""
    import time
    c = get_client()
    for attempt in range(max_retries):
        try:
            resp = c.models.generate_content(model=model, contents=contents)
            return resp.text
        except Exception as e:
            err_str = str(e)
            if ("RESOURCE_EXHAUSTED" in err_str or "UNAVAILABLE" in err_str) and attempt < max_retries - 1:
                wait = 15 * (attempt + 1)
                print(f"[Gemini] Retry {attempt+1}/{max_retries-1} after {wait}s — {err_str[:60]}")
                time.sleep(wait)
            else:
                raise


# ── Risk Analyzer ─────────────────────────────────────────────────────────────
class RiskAnalyzeRequest(BaseModel):
    text: str
    document_type: str = "contract"

class RiskFlag(BaseModel):
    severity: str          # high | medium | low
    category: str
    phrase: str
    explanation: str
    suggestion: str

class RiskAnalyzeResponse(BaseModel):
    overall_score: int     # 0-100 (100 = highest risk)
    risk_level: str        # low | medium | high | critical
    flags: list[RiskFlag]
    summary: str

@app.post("/analyze/risk", response_model=RiskAnalyzeResponse)
async def analyze_risk(req: RiskAnalyzeRequest):
    c = get_client()
    prompt = f"""You are a legal risk analyst. Analyze this {req.document_type} text for legal risks.

TEXT:
{req.text[:4000]}

Respond ONLY with valid JSON in this exact format:
{{
  "overall_score": <0-100 integer, 100=highest risk>,
  "risk_level": "<low|medium|high|critical>",
  "summary": "<2-3 sentence overall risk summary>",
  "flags": [
    {{
      "severity": "<high|medium|low>",
      "category": "<e.g. Liability|Termination|IP Rights|Payment|Confidentiality|Jurisdiction>",
      "phrase": "<exact problematic phrase from text, max 80 chars>",
      "explanation": "<why this is risky>",
      "suggestion": "<how to fix or negotiate this clause>"
    }}
  ]
}}

Identify 3-7 specific risk flags. Be precise and actionable."""

    raw = _gemini_generate(LLM_MODEL, prompt).strip()
    import re
    import json as _json
    match = re.search(r'\{.*\}', raw, re.DOTALL)
    if not match:
        raise HTTPException(500, "Failed to parse risk analysis")
    data = _json.loads(match.group())
    return RiskAnalyzeResponse(**data)

# ── Legal Brief Generator ─────────────────────────────────────────────────────
class BriefRequest(BaseModel):
    topic: str
    jurisdiction: str = "federal"
    brief_type: str = "memorandum"   # memorandum | motion | demand_letter

class BriefResponse(BaseModel):
    title: str
    content: str
    word_count: int

@app.post("/generate/brief", response_model=BriefResponse)
async def generate_brief(req: BriefRequest):
    c = get_client()
    results = store.search(req.topic, k=5)
    context = "\n\n".join(f"Source: {r['meta'].get('title','')}\n{r['text']}" for r in results)

    type_instructions = {
        "memorandum": "a formal legal memorandum with sections: TO, FROM, DATE, RE, QUESTION PRESENTED, BRIEF ANSWER, STATEMENT OF FACTS, DISCUSSION, CONCLUSION",
        "motion": "a court motion with sections: CAPTION, INTRODUCTION, STATEMENT OF FACTS, LEGAL STANDARD, ARGUMENT, CONCLUSION, CERTIFICATE OF SERVICE",
        "demand_letter": "a professional demand letter with sections: Date, Recipient, RE line, Opening, Facts, Legal Basis, Demand, Deadline, Closing"
    }

    prompt = f"""Generate {type_instructions.get(req.brief_type, 'a legal document')} on the topic: "{req.topic}" for {req.jurisdiction} jurisdiction.

Use these retrieved legal sources:
{context}

Write a complete, professional legal document. Use proper legal formatting, cite the sources provided, and include all required sections. Make it realistic and substantive."""

    content = _gemini_generate(LLM_MODEL, prompt)
    title = f"{req.brief_type.replace('_',' ').title()}: {req.topic[:60]}"
    return BriefResponse(title=title, content=content, word_count=len(content.split()))

# ── Jurisdiction Comparator ───────────────────────────────────────────────────
class JurisdictionCompareRequest(BaseModel):
    topic: str
    jurisdictions: list[str]   # e.g. ["California", "New York", "Texas", "federal"]

class JurisdictionEntry(BaseModel):
    jurisdiction: str
    summary: str
    key_differences: list[str]
    notable_cases: list[str]

class JurisdictionCompareResponse(BaseModel):
    topic: str
    entries: list[JurisdictionEntry]
    overall_comparison: str

@app.post("/analyze/jurisdictions", response_model=JurisdictionCompareResponse)
async def compare_jurisdictions(req: JurisdictionCompareRequest):
    c = get_client()
    results = store.search(req.topic, k=5)
    context = "\n\n".join(f"{r['meta'].get('title','')}: {r['text'][:300]}" for r in results)

    jurisdictions_str = ", ".join(req.jurisdictions[:5])
    prompt = f"""Compare how "{req.topic}" is handled across these jurisdictions: {jurisdictions_str}.

Legal context from knowledge base:
{context}

Respond ONLY with valid JSON:
{{
  "topic": "{req.topic}",
  "overall_comparison": "<2-3 sentence overview of key differences>",
  "entries": [
    {{
      "jurisdiction": "<name>",
      "summary": "<2-3 sentence summary of how this jurisdiction handles the topic>",
      "key_differences": ["<difference 1>", "<difference 2>", "<difference 3>"],
      "notable_cases": ["<Case Name, Year>", "<Case Name, Year>"]
    }}
  ]
}}

Provide one entry per jurisdiction. Be specific and accurate."""

    raw = _gemini_generate(LLM_MODEL, prompt).strip()
    import re
    import json as _json
    match = re.search(r'\{.*\}', raw, re.DOTALL)
    if not match:
        raise HTTPException(500, "Failed to parse jurisdiction comparison")
    data = _json.loads(match.group())
    return JurisdictionCompareResponse(**data)

# ── Deadline Calculator ───────────────────────────────────────────────────────
class DeadlineRequest(BaseModel):
    event_type: str        # e.g. "personal injury", "contract breach", "employment discrimination"
    event_date: str        # ISO date string
    jurisdiction: str = "federal"

class DeadlineEntry(BaseModel):
    deadline_name: str
    deadline_date: str
    days_remaining: int
    urgency: str           # urgent | warning | ok | expired
    description: str
    citation: str

class DeadlineResponse(BaseModel):
    event_type: str
    event_date: str
    jurisdiction: str
    deadlines: list[DeadlineEntry]
    disclaimer: str

@app.post("/calculate/deadlines", response_model=DeadlineResponse)
async def calculate_deadlines(req: DeadlineRequest):
    from datetime import datetime, timedelta
    c = get_client()

    try:
        event_dt = datetime.fromisoformat(req.event_date)
    except ValueError:
        raise HTTPException(400, "Invalid date format. Use YYYY-MM-DD")

    today = datetime.now()
    prompt = f"""Calculate legal deadlines for a "{req.event_type}" case in {req.jurisdiction}.
Event date: {req.event_date}
Today's date: {today.strftime('%Y-%m-%d')}

Respond ONLY with valid JSON:
{{
  "deadlines": [
    {{
      "deadline_name": "<e.g. Statute of Limitations, EEOC Filing, Notice of Claim>",
      "days_from_event": <integer number of days from event date>,
      "description": "<what this deadline is for>",
      "citation": "<relevant statute or rule>"
    }}
  ]
}}

List 3-6 relevant deadlines. Use accurate legal timeframes."""

    raw = _gemini_generate(LLM_MODEL, prompt).strip()
    import re
    import json as _json
    match = re.search(r'\{.*\}', raw, re.DOTALL)
    if not match:
        raise HTTPException(500, "Failed to parse deadlines")
    data = _json.loads(match.group())

    entries = []
    for d in data.get("deadlines", []):
        days = int(d.get("days_from_event", 365))
        deadline_dt = event_dt + timedelta(days=days)
        days_remaining = (deadline_dt - today).days
        if days_remaining < 0:
            urgency = "expired"
        elif days_remaining <= 30:
            urgency = "urgent"
        elif days_remaining <= 90:
            urgency = "warning"
        else:
            urgency = "ok"
        entries.append(DeadlineEntry(
            deadline_name=d.get("deadline_name", "Deadline"),
            deadline_date=deadline_dt.strftime("%Y-%m-%d"),
            days_remaining=days_remaining,
            urgency=urgency,
            description=d.get("description", ""),
            citation=d.get("citation", "")
        ))

    entries.sort(key=lambda x: x.days_remaining)
    return DeadlineResponse(
        event_type=req.event_type,
        event_date=req.event_date,
        jurisdiction=req.jurisdiction,
        deadlines=entries,
        disclaimer="These deadlines are estimates only. Consult an attorney immediately for time-sensitive legal matters."
    )

# ── Legal Term Glossary ───────────────────────────────────────────────────────
class GlossaryRequest(BaseModel):
    term: str

class GlossaryResponse(BaseModel):
    term: str
    definition: str
    latin_origin: Optional[str]
    example: str
    related_terms: list[str]
    domain: str

@app.post("/glossary/define", response_model=GlossaryResponse)
async def define_term(req: GlossaryRequest):
    c = get_client()
    prompt = f"""Define the legal term "{req.term}" concisely and accurately.

Respond ONLY with valid JSON:
{{
  "term": "{req.term}",
  "definition": "<clear 2-3 sentence definition>",
  "latin_origin": "<Latin origin if applicable, else null>",
  "example": "<one practical example sentence>",
  "related_terms": ["<term1>", "<term2>", "<term3>"],
  "domain": "<primary legal domain: criminal|civil|contract|tort|property|constitutional|general>"
}}"""

    raw = _gemini_generate(LLM_MODEL, prompt).strip()
    import re
    import json as _json
    match = re.search(r'\{.*\}', raw, re.DOTALL)
    if not match:
        raise HTTPException(500, "Failed to parse glossary response")
    data = _json.loads(match.group())
    return GlossaryResponse(**data)

@app.get("/")
async def root():
    # Serve frontend if built, otherwise return API info
    index = DIST / "index.html"
    if index.exists():
        return FileResponse(str(index))
    return {"name": "Legal AI Assistant", "version": "1.0.0", "docs": "/docs"}

# ── Serve frontend static files ───────────────────────────────────────────────
DIST = Path(__file__).parent / "frontend" / "dist"
if DIST.exists():
    # Serve /assets/* statically
    app.mount("/assets", StaticFiles(directory=str(DIST / "assets")), name="assets")

    @app.get("/favicon.ico", include_in_schema=False)
    async def favicon():
        f = DIST / "favicon.ico"
        if f.exists():
            return FileResponse(str(f))
        raise HTTPException(404)

    @app.get("/{full_path:path}", include_in_schema=False)
    async def spa(full_path: str):
        # Don't intercept API routes
        api_routes = ("chat", "documents", "health", "docs", "redoc", "openapi", "assets")
        if any(full_path.startswith(s) for s in api_routes):
            raise HTTPException(404)
        # Serve exact file if it exists
        f = DIST / full_path
        if f.exists() and f.is_file():
            return FileResponse(str(f))
        # SPA fallback — always return index.html
        return FileResponse(str(DIST / "index.html"))

if __name__ == "__main__":
    import uvicorn
    print("\n🏛  Legal AI Assistant")
    print("   Frontend UI : http://localhost:8000")
    print("   API Docs    : http://localhost:8000/docs\n")
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
