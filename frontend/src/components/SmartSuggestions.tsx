import { Sparkles } from 'lucide-react'
import { clsx } from 'clsx'

// Domain-specific follow-up suggestions
const DOMAIN_SUGGESTIONS: Record<string, string[]> = {
  criminal: [
    'What are the penalties for this offense?',
    'What defenses are available?',
    'How does bail work in this case?',
    'What is the statute of limitations?',
  ],
  contract: [
    'What remedies are available for breach?',
    'How can this contract be terminated?',
    'What clauses should I watch out for?',
    'Is this enforceable in my state?',
  ],
  employment: [
    'What is the EEOC complaint process?',
    'What damages can I recover?',
    'Does this apply to small businesses?',
    'What is the filing deadline?',
  ],
  constitutional: [
    'How has this been interpreted recently?',
    'What are the exceptions to this right?',
    'How does this apply to private actors?',
    'What is the standard of review?',
  ],
  tort: [
    'How is damages calculated?',
    'What is the statute of limitations?',
    'Does comparative negligence apply?',
    'What evidence is needed to prove this?',
  ],
  property: [
    'What are tenant rights in this situation?',
    'What is the eviction process?',
    'How does security deposit law work?',
    'What are landlord repair obligations?',
  ],
  family: [
    'How is child support calculated?',
    'What factors determine custody?',
    'How long does divorce take?',
    'What is the difference between legal and physical custody?',
  ],
  immigration: [
    'What is the green card process?',
    'How long does this visa take?',
    'What are grounds for deportation?',
    'Can I appeal an immigration decision?',
  ],
  intellectual_property: [
    'How do I register a copyright?',
    'What is fair use?',
    'How long does copyright protection last?',
    'What is the difference between copyright and trademark?',
  ],
  general: [
    'Can you explain this in simpler terms?',
    'What should I do next?',
    'Do I need a lawyer for this?',
    'How does this vary by state?',
  ],
}

function getSuggestions(domain: string | null | undefined): string[] {
  const key = domain ?? 'general'
  return (DOMAIN_SUGGESTIONS[key] ?? DOMAIN_SUGGESTIONS.general).slice(0, 3)
}

interface Props {
  domain: string | null | undefined
  onSelect: (suggestion: string) => void
  isDark?: boolean
}

export function SmartSuggestions({ domain, onSelect, isDark }: Props) {
  const suggestions = getSuggestions(domain)

  return (
    <div className="px-6 pb-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles className={clsx('h-3.5 w-3.5', isDark ? 'text-legal-400' : 'text-legal-500')} />
        <span className={clsx('text-xs font-medium', isDark ? 'text-gray-400' : 'text-gray-500')}>
          Follow-up suggestions
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onSelect(s)}
            className={clsx(
              'rounded-full border px-3 py-1.5 text-xs transition-all hover:scale-105 active:scale-95',
              isDark
                ? 'border-gray-700 bg-gray-800 text-gray-300 hover:border-legal-500 hover:text-legal-300'
                : 'border-legal-200 bg-legal-50 text-legal-700 hover:border-legal-400 hover:bg-legal-100'
            )}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
