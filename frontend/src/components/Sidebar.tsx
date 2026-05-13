import { useState } from 'react'
import { Scale, BookOpen, Trash2, Plus, ChevronDown, ChevronUp, LogOut, UserCircle2 } from 'lucide-react'
import type { LegalDomain } from '../types'
import { useAuth } from '../context/AuthContext'
import { KnowledgeBasePanel } from './KnowledgeBasePanel'
import { clsx } from 'clsx'

const DOMAINS: { value: LegalDomain | ''; label: string }[] = [
  { value: '', label: 'Auto-detect' },
  { value: 'constitutional', label: 'Constitutional' },
  { value: 'criminal', label: 'Criminal' },
  { value: 'civil', label: 'Civil' },
  { value: 'contract', label: 'Contract' },
  { value: 'tort', label: 'Tort' },
  { value: 'property', label: 'Property' },
  { value: 'family', label: 'Family' },
  { value: 'employment', label: 'Employment' },
  { value: 'immigration', label: 'Immigration' },
  { value: 'intellectual_property', label: 'IP' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'tax', label: 'Tax' },
]

const SAMPLE_QUESTIONS = [
  'What are the elements of negligence?',
  'Explain Miranda rights and when they apply',
  'What is the difference between copyright and trademark?',
  'What are the requirements for a valid contract?',
  'How does Title VII protect employees from discrimination?',
  'What is qualified immunity for police officers?',
  'Explain the Fourth Amendment warrant requirement',
  'What are grounds for divorce and how is property divided?',
]

interface SidebarProps {
  selectedDomain: LegalDomain | null
  jurisdiction: string
  onDomainChange: (domain: LegalDomain | null) => void
  onJurisdictionChange: (j: string) => void
  onClearChat: () => void
  onOpenUpload: () => void
  onSampleQuestion: (q: string) => void
  messageCount: number
  kbRefreshTrigger: number
  extraPanel?: React.ReactNode
}

export function Sidebar({
  selectedDomain,
  jurisdiction,
  onDomainChange,
  onJurisdictionChange,
  onClearChat,
  onOpenUpload,
  onSampleQuestion,
  messageCount,
  kbRefreshTrigger,
  extraPanel,
}: SidebarProps) {
  const [samplesOpen, setSamplesOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <aside className="flex h-full w-72 flex-col border-r border-gray-200 bg-gray-50 overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-legal-700 text-white">
          <Scale className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-900">Legal AI</h1>
          <p className="text-xs text-gray-500">Research Assistant</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Domain filter */}
        <section>
          <label className="label mb-1.5" htmlFor="domain-select">Legal Domain</label>
          <select
            id="domain-select"
            value={selectedDomain ?? ''}
            onChange={(e) => onDomainChange((e.target.value as LegalDomain) || null)}
            className="input text-sm"
          >
            {DOMAINS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </section>

        {/* Jurisdiction */}
        <section>
          <label className="label mb-1.5" htmlFor="jurisdiction-input">Jurisdiction</label>
          <input
            id="jurisdiction-input"
            type="text"
            value={jurisdiction}
            onChange={(e) => onJurisdictionChange(e.target.value)}
            placeholder="e.g., federal, California"
            className="input text-sm"
          />
        </section>

        {/* Knowledge Base — documents list */}
        <KnowledgeBasePanel refreshTrigger={kbRefreshTrigger} />

        {/* Extra panel (e.g. Chat History) */}
        {extraPanel}

        {/* Sample questions */}
        <section>
          <button
            onClick={() => setSamplesOpen((v) => !v)}
            className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700"
            aria-expanded={samplesOpen}
          >
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              Sample Questions
            </span>
            {samplesOpen
              ? <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
              : <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />}
          </button>

          {samplesOpen && (
            <ul className="mt-2 space-y-1">
              {SAMPLE_QUESTIONS.map((q) => (
                <li key={q}>
                  <button
                    onClick={() => onSampleQuestion(q)}
                    className="w-full rounded-lg px-3 py-2 text-left text-xs text-gray-600 hover:bg-legal-100 hover:text-legal-800 transition-colors"
                  >
                    {q}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 px-4 py-4 space-y-2">
        <button
          onClick={onOpenUpload}
          className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Document
        </button>

        <button
          onClick={onClearChat}
          disabled={messageCount === 0}
          className={clsx(
            'btn-secondary w-full flex items-center justify-center gap-2 text-sm',
            messageCount === 0 && 'opacity-40 cursor-not-allowed'
          )}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Clear Chat
        </button>
      </div>

      {/* User profile + logout */}
      {user && (
        <div className="border-t border-gray-200 px-4 py-3 flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-legal-100 text-legal-700">
            <UserCircle2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      )}
    </aside>
  )
}
