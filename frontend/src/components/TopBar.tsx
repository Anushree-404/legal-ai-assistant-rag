import { Sun, Moon, Download, BarChart3, Search, Scale, Bookmark, GitCompare, Keyboard, ShieldAlert, FileText, Globe, Clock, BookOpen, StickyNote, ChevronDown } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { clsx } from 'clsx'
import { useState, useRef, useEffect } from 'react'

interface Props {
  onExport: () => void
  onAnalytics: () => void
  onSearch: () => void
  onBookmarks: () => void
  onCompare: () => void
  onShortcuts: () => void
  onRiskAnalyzer: () => void
  onBriefGenerator: () => void
  onJurisdictionComparator: () => void
  onDeadlineCalculator: () => void
  onGlossary: () => void
  onStickyNotes: () => void
  messageCount: number
  bookmarkCount: number
}

export function TopBar(props: Props) {
  const { isDark, toggleTheme } = useTheme()
  const [toolsOpen, setToolsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setToolsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const btnCls = clsx(
    'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
    isDark ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  )

  const TOOLS = [
    { icon: <ShieldAlert className="h-4 w-4 text-red-500" />, label: 'Risk Analyzer', desc: 'Analyze contract risks', onClick: props.onRiskAnalyzer },
    { icon: <FileText className="h-4 w-4 text-legal-600" />, label: 'Brief Generator', desc: 'Generate legal briefs', onClick: props.onBriefGenerator },
    { icon: <Globe className="h-4 w-4 text-blue-500" />, label: 'Jurisdiction Compare', desc: 'Compare laws across states', onClick: props.onJurisdictionComparator },
    { icon: <Clock className="h-4 w-4 text-orange-500" />, label: 'Deadline Calculator', desc: 'Calculate legal deadlines', onClick: props.onDeadlineCalculator },
    { icon: <BookOpen className="h-4 w-4 text-purple-500" />, label: 'Legal Glossary', desc: 'Look up legal terms', onClick: props.onGlossary },
    { icon: <GitCompare className="h-4 w-4 text-teal-500" />, label: 'Compare Docs', desc: 'Side-by-side comparison', onClick: props.onCompare },
    { icon: <StickyNote className="h-4 w-4 text-yellow-500" />, label: 'Sticky Notes', desc: 'Annotate your research', onClick: props.onStickyNotes },
  ]

  return (
    <header className={clsx(
      'flex items-center justify-between border-b px-4 py-2.5 shrink-0',
      isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
    )}>
      {/* Left */}
      <div className="flex items-center gap-2">
        <Scale className={clsx('h-5 w-5', isDark ? 'text-legal-400' : 'text-legal-700')} />
        <span className={clsx('text-sm font-bold', isDark ? 'text-white' : 'text-gray-900')}>Legal AI</span>
        <span className={clsx('hidden sm:inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
          isDark ? 'bg-legal-900 text-legal-300' : 'bg-legal-100 text-legal-700')}>
          RAG-powered
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-0.5">
        {/* Search */}
        <button onClick={props.onSearch} title="Search KB (Ctrl+K)" className={btnCls}>
          <Search className="h-4 w-4" /><span className="hidden lg:inline">Search</span>
        </button>

        {/* Bookmarks */}
        <button onClick={props.onBookmarks} title="Bookmarks (Ctrl+B)" className={clsx(btnCls, 'relative')}>
          <Bookmark className="h-4 w-4" /><span className="hidden lg:inline">Bookmarks</span>
          {props.bookmarkCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-legal-600 text-white text-xs font-bold">
              {props.bookmarkCount}
            </span>
          )}
        </button>

        {/* Export */}
        <button onClick={props.onExport} disabled={props.messageCount === 0} title="Export (Ctrl+E)"
          className={clsx(btnCls, props.messageCount === 0 && 'opacity-40 cursor-not-allowed')}>
          <Download className="h-4 w-4" /><span className="hidden lg:inline">Export</span>
        </button>

        {/* Analytics */}
        <button onClick={props.onAnalytics} title="Analytics" className={btnCls}>
          <BarChart3 className="h-4 w-4" /><span className="hidden lg:inline">Analytics</span>
        </button>

        <div className={clsx('mx-1 h-5 w-px', isDark ? 'bg-gray-700' : 'bg-gray-200')} />

        {/* AI Tools dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setToolsOpen((v) => !v)}
            className={clsx(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
              toolsOpen
                ? isDark ? 'bg-gray-800 text-white' : 'bg-legal-100 text-legal-800'
                : isDark ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            <span className="text-legal-500">⚡</span>
            AI Tools
            <ChevronDown className={clsx('h-3.5 w-3.5 transition-transform', toolsOpen && 'rotate-180')} />
          </button>

          {toolsOpen && (
            <div className={clsx(
              'absolute right-0 top-full mt-1.5 w-64 rounded-2xl border shadow-2xl z-50 overflow-hidden',
              isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
            )}>
              <div className={clsx('px-3 py-2 border-b', isDark ? 'border-gray-700' : 'border-gray-100')}>
                <p className={clsx('text-xs font-bold uppercase tracking-wider', isDark ? 'text-gray-500' : 'text-gray-400')}>Advanced Tools</p>
              </div>
              {TOOLS.map((tool) => (
                <button
                  key={tool.label}
                  onClick={() => { tool.onClick(); setToolsOpen(false) }}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                    isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                  )}
                >
                  <span className="shrink-0">{tool.icon}</span>
                  <div>
                    <p className={clsx('text-xs font-semibold', isDark ? 'text-gray-200' : 'text-gray-800')}>{tool.label}</p>
                    <p className={clsx('text-xs', isDark ? 'text-gray-500' : 'text-gray-400')}>{tool.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={clsx('mx-1 h-5 w-px', isDark ? 'bg-gray-700' : 'bg-gray-200')} />

        {/* Shortcuts */}
        <button onClick={props.onShortcuts} title="Shortcuts (Ctrl+/)" className={btnCls}>
          <Keyboard className="h-4 w-4" />
        </button>

        {/* Dark mode */}
        <button onClick={toggleTheme} title={isDark ? 'Light mode' : 'Dark mode'}
          className={clsx('rounded-lg p-2 transition-colors', isDark ? 'text-yellow-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100')}>
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  )
}
