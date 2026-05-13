import { Download, FileText, Copy, Check, X } from 'lucide-react'
import { useState } from 'react'
import type { Message } from '../types'

interface Props {
  messages: Message[]
  onClose: () => void
}

export function ExportChat({ messages, onClose }: Props) {
  const [copied, setCopied] = useState(false)

  const buildText = () => {
    const lines: string[] = [
      '═══════════════════════════════════════════',
      '         LEGAL AI ASSISTANT — CHAT EXPORT',
      `         Exported: ${new Date().toLocaleString()}`,
      '═══════════════════════════════════════════',
      '',
    ]
    for (const m of messages.filter((m) => !m.isLoading)) {
      const role = m.role === 'user' ? '👤 YOU' : '⚖️  LEGAL AI'
      const time = m.timestamp instanceof Date
        ? m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : ''
      lines.push(`${role}  [${time}]`)
      lines.push('─'.repeat(45))
      lines.push(m.content)
      if (m.sources && m.sources.length > 0) {
        lines.push('')
        lines.push('📚 Sources:')
        m.sources.forEach((s, i) => {
          lines.push(`  ${i + 1}. ${s.title}${s.citation ? ` — ${s.citation}` : ''} (${Math.round(s.relevance_score * 100)}% match)`)
        })
      }
      lines.push('')
    }
    lines.push('─'.repeat(45))
    lines.push('⚠️  DISCLAIMER: General legal information only — not legal advice.')
    lines.push('    Consult a licensed attorney for advice specific to your situation.')
    return lines.join('\n')
  }

  const handleDownload = () => {
    const text = buildText()
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `legal-ai-chat-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(buildText())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      messages: messages.filter((m) => !m.isLoading).map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
        sources: m.sources ?? [],
        domain: m.domain,
        bookmarked: m.bookmarked ?? false,
      })),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `legal-ai-chat-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const msgCount = messages.filter((m) => !m.isLoading && m.role !== 'system').length

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-legal-600" />
            <h2 className="text-base font-bold text-gray-900">Export Conversation</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-500">
            Export <strong>{msgCount} messages</strong> from this conversation.
          </p>

          {/* Preview */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 max-h-40 overflow-y-auto">
            <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono leading-relaxed">
              {buildText().slice(0, 400)}…
            </pre>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={handleDownload}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Download as .txt
            </button>

            <button
              onClick={handleDownloadJSON}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download as .json
            </button>

            <button
              onClick={handleCopy}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              {copied
                ? <><Check className="h-4 w-4 text-green-500" /> Copied to clipboard!</>
                : <><Copy className="h-4 w-4" /> Copy to clipboard</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
