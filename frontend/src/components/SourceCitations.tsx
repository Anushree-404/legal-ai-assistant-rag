import { useState } from 'react'
import { BookOpen, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import type { LegalSource } from '../types'
import { clsx } from 'clsx'

const DOMAIN_COLORS: Record<string, string> = {
  constitutional: 'bg-purple-100 text-purple-700',
  criminal: 'bg-red-100 text-red-700',
  civil: 'bg-blue-100 text-blue-700',
  contract: 'bg-green-100 text-green-700',
  tort: 'bg-orange-100 text-orange-700',
  property: 'bg-yellow-100 text-yellow-700',
  family: 'bg-pink-100 text-pink-700',
  employment: 'bg-teal-100 text-teal-700',
  immigration: 'bg-indigo-100 text-indigo-700',
  intellectual_property: 'bg-cyan-100 text-cyan-700',
  corporate: 'bg-slate-100 text-slate-700',
  tax: 'bg-lime-100 text-lime-700',
  general: 'bg-gray-100 text-gray-700',
}

const DOC_TYPE_LABELS: Record<string, string> = {
  statute: 'Statute', case_law: 'Case Law', regulation: 'Regulation',
  contract: 'Contract', legal_brief: 'Brief', article: 'Article', other: 'Document',
}

function ConfidenceBar({ score, isDark }: { score: number; isDark?: boolean }) {
  const pct = Math.round(score * 100)
  const color = pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-400'
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className={clsx('flex-1 h-1.5 rounded-full overflow-hidden', isDark ? 'bg-gray-700' : 'bg-gray-200')}>
        <div
          className={clsx('h-full rounded-full transition-all duration-700', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={clsx('text-xs font-semibold tabular-nums', pct >= 75 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-500')}>
        {pct}%
      </span>
    </div>
  )
}

interface SourceCitationsProps {
  sources: LegalSource[]
  isDark?: boolean
}

export function SourceCitations({ sources, isDark }: SourceCitationsProps) {
  const [expanded, setExpanded]         = useState(false)
  const [expandedSource, setExpandedSource] = useState<number | null>(null)

  if (sources.length === 0) return null

  return (
    <div className={clsx(
      'mt-3 rounded-xl border overflow-hidden',
      isDark ? 'border-gray-700 bg-gray-900' : 'border-legal-200 bg-legal-50'
    )}>
      <button
        onClick={() => setExpanded((v) => !v)}
        className={clsx(
          'flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors',
          isDark
            ? 'text-legal-400 hover:bg-gray-800'
            : 'text-legal-700 hover:bg-legal-100'
        )}
        aria-expanded={expanded}
      >
        <span className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          {sources.length} Source{sources.length !== 1 ? 's' : ''} Retrieved
        </span>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {expanded && (
        <div className={clsx('divide-y', isDark ? 'divide-gray-800 border-t border-gray-700' : 'divide-legal-100 border-t border-legal-200')}>
          {sources.map((source, idx) => (
            <div key={idx} className="px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className={clsx(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      DOMAIN_COLORS[source.domain] ?? DOMAIN_COLORS.general
                    )}>
                      {source.domain.replace('_', ' ')}
                    </span>
                    <span className={clsx(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs',
                      isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                    )}>
                      {DOC_TYPE_LABELS[source.document_type] ?? 'Document'}
                    </span>
                    {source.jurisdiction && (
                      <span className={clsx('text-xs', isDark ? 'text-gray-500' : 'text-gray-500')}>
                        {source.jurisdiction}
                      </span>
                    )}
                  </div>

                  <p className={clsx('text-sm font-semibold truncate', isDark ? 'text-gray-200' : 'text-gray-800')}>
                    {source.title}
                  </p>
                  {source.citation && (
                    <p className={clsx('text-xs font-mono mt-0.5', isDark ? 'text-legal-400' : 'text-legal-600')}>
                      {source.citation}
                    </p>
                  )}

                  {/* Confidence bar */}
                  <ConfidenceBar score={source.relevance_score} isDark={isDark} />
                </div>

                {source.url && (
                  <a href={source.url} target="_blank" rel="noopener noreferrer"
                    className={clsx('shrink-0', isDark ? 'text-legal-400 hover:text-legal-300' : 'text-legal-500 hover:text-legal-700')}>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>

              <button
                onClick={() => setExpandedSource(expandedSource === idx ? null : idx)}
                className={clsx('mt-1.5 text-xs underline', isDark ? 'text-legal-400 hover:text-legal-300' : 'text-legal-500 hover:text-legal-700')}
              >
                {expandedSource === idx ? 'Hide excerpt' : 'Show excerpt'}
              </button>

              {expandedSource === idx && (
                <blockquote className={clsx(
                  'mt-2 border-l-2 pl-3 text-xs italic leading-relaxed',
                  isDark ? 'border-legal-700 text-gray-400' : 'border-legal-300 text-gray-600'
                )}>
                  {source.content_snippet}
                </blockquote>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
