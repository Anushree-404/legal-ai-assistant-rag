from enum import Enum


class LegalDomain(str, Enum):
    CONSTITUTIONAL = "constitutional"
    CRIMINAL = "criminal"
    CIVIL = "civil"
    CONTRACT = "contract"
    TORT = "tort"
    PROPERTY = "property"
    FAMILY = "family"
    EMPLOYMENT = "employment"
    IMMIGRATION = "immigration"
    INTELLECTUAL_PROPERTY = "intellectual_property"
    CORPORATE = "corporate"
    TAX = "tax"
    ENVIRONMENTAL = "environmental"
    ADMINISTRATIVE = "administrative"
    GENERAL = "general"


class DocumentType(str, Enum):
    STATUTE = "statute"
    CASE_LAW = "case_law"
    REGULATION = "regulation"
    CONTRACT = "contract"
    LEGAL_BRIEF = "legal_brief"
    ARTICLE = "article"
    OTHER = "other"


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"
