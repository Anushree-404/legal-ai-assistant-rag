import { X, Keyboard } from 'lucide-react'
import { useEffect } from 'react'

const SHORTCUTS = [
  { category: 'Navigation', items: [
    { keys: ['Ctrl', 'K'], desc: 'Search knowledge base' },
    { keys: ['Ctrl', '/'], desc: 'Show keyboard shortcuts' },
    { keys: ['Esc'],       desc: 'Close any modal' },
  ]},
  { category: 'Chat', items: [
    { keys: ['Enter'],          desc: 'Send message' },
    { keys: ['Shift', 'Enter'], desc: 'New line in message' },
    { keys: ['Ctrl', 'L'],      desc: 'Clear chat' },
  ]},
  { category: 'Features', items: [
    { keys: ['Ctrl', 'E'], desc: 'Export conversation' },
    { keys: ['Ctrl', 'B'], desc: 'Open bookmarks' },
    { keys: ['Ctrl', 'D'], desc: 'Toggle dark mode' },
  ]},
  { category: 'AI Tools', items: [
    { keys: ['Ctrl', 'R'], desc: 'Risk Analyzer' },
    { keys: ['Ctrl', 'G'], desc: 'Legal Glossary lookup' },
  ]},
]

interface Props { onClose: () => void }

export function KeyboardShortcuts({ onClose }: Props) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-legal-600" />
            <h2 className="text-base font-bold text-gray-900">Keyboard Shortcuts</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {SHORTCUTS.map((group) => (
            <div key={group.category}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                {group.category}
              </h3>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <div key={item.desc} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{item.desc}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((k, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <kbd className="rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-700 shadow-sm">
                            {k}
                          </kbd>
                          {i < item.keys.length - 1 && (
                            <span className="text-xs text-gray-400">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t px-6 py-3 text-center">
          <p className="text-xs text-gray-400">Press <kbd className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-xs font-mono">Ctrl+/</kbd> anytime to show this</p>
        </div>
      </div>
    </div>
  )
}
