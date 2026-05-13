"""LLM interaction service with legal-specific prompting."""
import logging
from typing import Optional

from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage, AIMessage

from app.config import get_settings
from app.models.enums import LegalDomain
from app.models.schemas import ChatMessage

logger = logging.getLogger(__name__)

LEGAL_SYSTEM_PROMPT = """You are a specialized Legal Research AI Assistant powered by Retrieval-Augmented Generation (RAG).

Your role is to help users understand legal concepts, research case law, analyze statutes, and provide preliminary legal guidance.

## Core Responsibilities
- **Legal Research & Analysis**: Cite specific statutes, case law, and legal precedents from the provided context
- **Document Analysis**: Review and explain legal documents, identify key terms, risks, and obligations
- **Legal Concept Explanation**: Define legal terms, explain procedures, provide practical context
- **Preliminary Assessment**: Analyze factual scenarios against applicable law

## Response Format
Structure every response as follows:
1. **Legal Framework** — Explain the applicable law
2. **Relevant Sources** — Cite statutes/cases from the provided context (use full citations, e.g., "42 U.S.C. § 1983")
3. **Application** — Explain how the law applies to the question
4. **Limitations & Uncertainties** — Note jurisdictional variations, unsettled areas of law
5. **Next Steps** — Recommend professional consultation when appropriate

## Critical Rules
- ALWAYS cite sources from the provided context with full legal citations
- Distinguish between established law and uncertain/evolving areas
- Include jurisdictional disclaimers when relevant
- NEVER guarantee specific legal outcomes
- NEVER provide advice that replaces attorney judgment
- Flag time-sensitive matters (statutes of limitations, filing deadlines) prominently
- Do NOT assist with illegal activities, fraud, or unethical conduct

## Tone
- Professional, precise, and accessible
- Use plain language to explain complex legal concepts
- Be thorough but concise

Always end responses with:
> ⚠️ **Disclaimer**: This is general legal information, not legal advice. Consult a licensed attorney for advice specific to your situation."""


def _build_context_block(retrieved_docs: list) -> str:
    """Format retrieved documents into a context block for the prompt."""
    if not retrieved_docs:
        return "No specific legal documents were retrieved for this query."

    lines = ["## Retrieved Legal Sources\n"]
    for i, doc in enumerate(retrieved_docs, 1):
        meta = doc.metadata
        citation = meta.get("citation", "")
        title = meta.get("title", "Unknown Source")
        doc_type = meta.get("document_type", "document")
        jurisdiction = meta.get("jurisdiction", "")
        score = meta.get("relevance_score", 0)

        header = f"### Source {i}: {title}"
        if citation:
            header += f" ({citation})"
        lines.append(header)
        lines.append(f"*Type: {doc_type} | Jurisdiction: {jurisdiction} | Relevance: {score:.0%}*")
        lines.append("")
        lines.append(doc.page_content)
        lines.append("")

    return "\n".join(lines)


class LLMService:
    def __init__(self):
        self.settings = get_settings()
        self.llm = ChatOpenAI(
            model=self.settings.llm_model,
            temperature=self.settings.temperature,
            max_tokens=self.settings.max_tokens,
            openai_api_key=self.settings.openai_api_key,
        )

    def generate_response(
        self,
        query: str,
        retrieved_docs: list,
        conversation_history: list[ChatMessage],
        domain: Optional[LegalDomain] = None,
        jurisdiction: Optional[str] = None,
    ) -> str:
        """Generate a legal response using retrieved context."""
        context_block = _build_context_block(retrieved_docs)

        # Build domain/jurisdiction context
        focus_parts = []
        if domain:
            focus_parts.append(f"Legal Domain: {domain.value.replace('_', ' ').title()}")
        if jurisdiction:
            focus_parts.append(f"Jurisdiction: {jurisdiction}")
        focus_note = " | ".join(focus_parts)

        user_message_content = f"""## Legal Query
{query}

{f"**Focus**: {focus_note}" if focus_note else ""}

---

{context_block}

---

Please provide a comprehensive legal research response based on the sources above."""

        messages = [SystemMessage(content=LEGAL_SYSTEM_PROMPT)]

        # Add conversation history (last 6 turns to stay within context)
        for msg in conversation_history[-6:]:
            if msg.role.value == "user":
                messages.append(HumanMessage(content=msg.content))
            elif msg.role.value == "assistant":
                messages.append(AIMessage(content=msg.content))

        messages.append(HumanMessage(content=user_message_content))

        response = self.llm.invoke(messages)
        return response.content

    def detect_domain(self, query: str) -> Optional[LegalDomain]:
        """Use LLM to detect the legal domain of a query."""
        domain_values = [d.value for d in LegalDomain]
        prompt = f"""Classify this legal query into exactly one domain from this list:
{', '.join(domain_values)}

Query: {query}

Respond with ONLY the domain value (e.g., "criminal" or "contract"). No explanation."""

        try:
            response = self.llm.invoke([HumanMessage(content=prompt)])
            detected = response.content.strip().lower()
            for domain in LegalDomain:
                if domain.value == detected:
                    return domain
        except Exception as exc:
            logger.warning("Domain detection failed: %s", exc)
        return LegalDomain.GENERAL


_llm_service: Optional[LLMService] = None


def get_llm_service() -> LLMService:
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service
