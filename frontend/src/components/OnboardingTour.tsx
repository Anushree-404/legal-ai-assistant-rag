import { useState, useEffect } from 'react'
import { Scale, BookOpen, Database, BarChart3, Bookmark, X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react'
import { clsx } from 'clsx'

const STEPS = [
  {
    icon: <Scale className="h-10 w-10 text-legal-600" />,
    title: 'Welcome to Legal AI Assistant',
    desc: 'Your AI-powered legal research tool. Ask questions about statutes, case law, contracts, and more — with cited, accurate answers.',
    highlight: null,
  },
  {
    icon: <Sparkles className="h-10 w-10 text-purple-500" />,
    title: 'Ask Legal Questions',
    desc: 'Type any legal question in the chat. The AI retrieves relevant laws and cases from the knowledge base and generates a cited response.',
    highlight: 'Try: "What are the elements of negligence?"',
  },
  {
    icon: <Database className="h-10 w-10 text-green-500" />,
    title: 'Knowledge Base',
    desc: 'The sidebar shows all indexed legal documents. Click any document to read it. Add your own documents using "Add Document".',
    highlight: '13 legal documents pre-loaded',
  },
  {
    icon: <BookOpen className="h-10 w-10 text-blue-500" />,
    title: 'Source Citations',
    desc: 'Every AI response includes source citations with relevance scores. Click "Sources Retrieved" under any answer to see them.',
    highlight: 'Full citations like "42 U.S.C. § 1983"',
  },
  {
    icon: <Bookmark className="h-10 w-10 text-yellow-500" />,
    title: 'Bookmarks & History',
    desc: 'Hover any AI response to bookmark it. All conversations are auto-saved in Chat History. Export chats as .txt or .json.',
    highlight: 'Bookmarks persist across sessions',
  },
  {
    icon: <BarChart3 className="h-10 w-10 text-red-500" />,
    title: 'Analytics & More',
    desc: 'Track your research in Analytics. Use Ctrl+K to search the knowledge base. Toggle dark mode with the moon icon.',
    highlight: 'Press Ctrl+/ for all keyboard shortcuts',
  },
]

const STORAGE_KEY = 'legal_ai_onboarding_done'

interface Props { onDone: () => void }

export function OnboardingTour({ onDone }: Props) {
  const [step, setStep] = useState(0)
  const [animating, setAnimating] = useState(false)

  const go = (next: number) => {
    setAnimating(true)
    setTimeout(() => { setStep(next); setAnimating(false) }, 200)
  }

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    onDone()
  }

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-legal-600 transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Skip */}
        <div className="flex justify-end px-6 pt-4">
          <button onClick={finish} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
            <X className="h-3.5 w-3.5" /> Skip tour
          </button>
        </div>

        {/* Content */}
        <div className={clsx(
          'px-8 py-6 text-center transition-all duration-200',
          animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
        )}>
          <div className="flex justify-center mb-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-50 shadow-inner">
              {current.icon}
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{current.title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{current.desc}</p>
          {current.highlight && (
            <div className="mt-4 rounded-xl bg-legal-50 border border-legal-100 px-4 py-2.5">
              <p className="text-xs font-semibold text-legal-700">{current.highlight}</p>
            </div>
          )}
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5 pb-4">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={clsx(
                'rounded-full transition-all',
                i === step ? 'w-6 h-2 bg-legal-600' : 'w-2 h-2 bg-gray-200 hover:bg-gray-300'
              )}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 px-8 pb-8">
          {step > 0 && (
            <button
              onClick={() => go(step - 1)}
              className="btn-secondary flex items-center gap-1.5 flex-1"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
          )}
          <button
            onClick={isLast ? finish : () => go(step + 1)}
            className="btn-primary flex items-center justify-center gap-1.5 flex-1"
          >
            {isLast ? 'Get Started' : <>Next <ChevronRight className="h-4 w-4" /></>}
          </button>
        </div>
      </div>
    </div>
  )
}

export function shouldShowOnboarding(): boolean {
  return !localStorage.getItem(STORAGE_KEY)
}
