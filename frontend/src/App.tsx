import { useState, useCallback, useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { ChatInterface } from './components/ChatInterface'
import { DocumentUpload } from './components/DocumentUpload'
import { LoginPage } from './components/LoginPage'
import { RegisterPage } from './components/RegisterPage'
import { TopBar } from './components/TopBar'
import { AnalyticsDashboard } from './components/AnalyticsDashboard'
import { ExportChat } from './components/ExportChat'
import { KBSearch } from './components/KBSearch'
import { BookmarksPanel } from './components/BookmarksPanel'
import { DocumentViewer } from './components/DocumentViewer'
import { DocumentComparison } from './components/DocumentComparison'
import { ChatHistoryPanel } from './components/ChatHistoryPanel'
import { KeyboardShortcuts } from './components/KeyboardShortcuts'
import { OnboardingTour, shouldShowOnboarding } from './components/OnboardingTour'
import { RiskAnalyzer } from './components/RiskAnalyzer'
import { BriefGenerator } from './components/BriefGenerator'
import { JurisdictionComparator } from './components/JurisdictionComparator'
import { DeadlineCalculator } from './components/DeadlineCalculator'
import { GlossaryLookup } from './components/GlossaryTooltip'
import { StickyNotes } from './components/StickyNotes'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { ToastProvider, useToast } from './context/ToastContext'
import { useChatHistory } from './hooks/useChatHistory'
import { useAnalytics } from './hooks/useAnalytics'
import { useBookmarks } from './hooks/useBookmarks'
import type { LegalDomain, Message } from './types'
import type { AuthView } from './types/auth'
import { Loader2 } from 'lucide-react'
import { clsx } from 'clsx'

function MainApp() {
  const { isDark } = useTheme()
  const toast = useToast()
  const { trackQuery, getAnalytics, clearAnalytics } = useAnalytics()
  const { bookmarks, bookmarkCount, isBookmarked, toggleBookmark, removeBookmark } = useBookmarks()
  const {
    sessions, activeSessionId,
    saveSession, loadSession, deleteSession, clearAllSessions, startNewSession,
  } = useChatHistory()

  const [selectedDomain, setSelectedDomain]   = useState<LegalDomain | null>(null)
  const [jurisdiction, setJurisdiction]       = useState('')
  const [showUpload, setShowUpload]           = useState(false)
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null)
  const [messageCount, setMessageCount]       = useState(0)
  const [clearSignal, setClearSignal]         = useState(0)
  const [kbRefreshTrigger, setKbRefreshTrigger] = useState(0)
  const [currentMessages, setCurrentMessages] = useState<Message[]>([])
  const [loadedMessages, setLoadedMessages]   = useState<Message[] | null>(null)

  // Core modals
  const [showAnalytics, setShowAnalytics]   = useState(false)
  const [showExport, setShowExport]         = useState(false)
  const [showSearch, setShowSearch]         = useState(false)
  const [showBookmarks, setShowBookmarks]   = useState(false)
  const [showShortcuts, setShowShortcuts]   = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(shouldShowOnboarding)
  const [viewingDocId, setViewingDocId]     = useState<string | null>(null)

  // Advanced tool modals
  const [showRisk, setShowRisk]             = useState(false)
  const [showBrief, setShowBrief]           = useState(false)
  const [showJurisdiction, setShowJurisdiction] = useState(false)
  const [showDeadline, setShowDeadline]     = useState(false)
  const [showGlossary, setShowGlossary]     = useState(false)
  const [showSticky, setShowSticky]         = useState(false)

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey
      if (ctrl && e.key === 'k') { e.preventDefault(); setShowSearch(true) }
      if (ctrl && e.key === '/') { e.preventDefault(); setShowShortcuts(true) }
      if (ctrl && e.key === 'e') { e.preventDefault(); if (messageCount > 0) setShowExport(true) }
      if (ctrl && e.key === 'b') { e.preventDefault(); setShowBookmarks(true) }
      if (ctrl && e.key === 'l') { e.preventDefault(); handleClearChat() }
      if (ctrl && e.key === 'g') { e.preventDefault(); setShowGlossary(true) }
      if (ctrl && e.key === 'r') { e.preventDefault(); setShowRisk(true) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [messageCount]) // eslint-disable-line

  // Auto-save chat history
  useEffect(() => {
    if (currentMessages.length > 0) saveSession(currentMessages, selectedDomain)
  }, [currentMessages]) // eslint-disable-line

  // Track analytics
  useEffect(() => {
    const last = currentMessages[currentMessages.length - 1]
    if (last && last.role === 'assistant' && !last.isLoading) trackQuery(currentMessages)
  }, [currentMessages]) // eslint-disable-line

  const handleSampleQuestion  = useCallback((q: string) => setPendingQuestion(q), [])
  const handlePendingConsumed = useCallback(() => setPendingQuestion(null), [])

  const handleClearChat = useCallback(() => {
    setClearSignal((n) => n + 1)
    setMessageCount(0)
    startNewSession()
    toast.info('Chat cleared', 'Started a new conversation')
  }, [startNewSession, toast])

  const handleLoadSession = useCallback((id: string) => {
    const msgs = loadSession(id)
    setLoadedMessages(msgs)
    setTimeout(() => setLoadedMessages(null), 100)
    toast.success('Conversation loaded')
  }, [loadSession, toast])

  const handleNewSession = useCallback(() => {
    startNewSession()
    setClearSignal((n) => n + 1)
    setMessageCount(0)
  }, [startNewSession])

  const handleToggleBookmark = useCallback((message: Message) => {
    const wasBookmarked = isBookmarked(message.id)
    toggleBookmark(message)
    toast.success(wasBookmarked ? 'Bookmark removed' : 'Bookmarked', wasBookmarked ? '' : 'Saved to your bookmarks')
  }, [toggleBookmark, isBookmarked, toast])

  return (
    <div className={clsx('flex h-screen overflow-hidden', isDark ? 'bg-gray-950' : 'bg-white')}>
      {/* Sidebar */}
      <aside className={clsx(
        'flex h-full w-72 flex-col border-r overflow-hidden shrink-0',
        isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
      )}>
        <Sidebar
          selectedDomain={selectedDomain}
          jurisdiction={jurisdiction}
          onDomainChange={setSelectedDomain}
          onJurisdictionChange={setJurisdiction}
          onClearChat={handleClearChat}
          onOpenUpload={() => setShowUpload(true)}
          onSampleQuestion={handleSampleQuestion}
          messageCount={messageCount}
          kbRefreshTrigger={kbRefreshTrigger}
          extraPanel={
            <ChatHistoryPanel
              sessions={sessions}
              activeSessionId={activeSessionId}
              onLoad={handleLoadSession}
              onDelete={deleteSession}
              onNew={handleNewSession}
              onClearAll={clearAllSessions}
            />
          }
        />
      </aside>

      {/* Main */}
      <main className="flex flex-1 flex-col overflow-hidden min-w-0">
        <TopBar
          onExport={() => setShowExport(true)}
          onAnalytics={() => setShowAnalytics(true)}
          onSearch={() => setShowSearch(true)}
          onBookmarks={() => setShowBookmarks(true)}
          onCompare={() => setShowComparison(true)}
          onShortcuts={() => setShowShortcuts(true)}
          onRiskAnalyzer={() => setShowRisk(true)}
          onBriefGenerator={() => setShowBrief(true)}
          onJurisdictionComparator={() => setShowJurisdiction(true)}
          onDeadlineCalculator={() => setShowDeadline(true)}
          onGlossary={() => setShowGlossary(true)}
          onStickyNotes={() => setShowSticky((v) => !v)}
          messageCount={messageCount}
          bookmarkCount={bookmarkCount}
        />

        <ChatInterface
          selectedDomain={selectedDomain}
          jurisdiction={jurisdiction}
          pendingQuestion={pendingQuestion}
          onPendingQuestionConsumed={handlePendingConsumed}
          clearSignal={clearSignal}
          onMessageCountChange={setMessageCount}
          onMessagesChange={setCurrentMessages}
          loadedMessages={loadedMessages}
          onToggleBookmark={handleToggleBookmark}
          isBookmarked={isBookmarked}
        />
      </main>

      {/* ── Core Modals ── */}
      {showUpload && (
        <DocumentUpload
          onClose={() => setShowUpload(false)}
          onSuccess={() => {
            setKbRefreshTrigger((n) => n + 1)
            toast.success('Document added', 'Indexed into knowledge base')
          }}
        />
      )}
      {showAnalytics && (
        <AnalyticsDashboard data={getAnalytics()} onClose={() => setShowAnalytics(false)} onClear={clearAnalytics} />
      )}
      {showExport && currentMessages.length > 0 && (
        <ExportChat messages={currentMessages} onClose={() => setShowExport(false)} />
      )}
      {showSearch && (
        <KBSearch onSelect={(id) => { setViewingDocId(id); setShowSearch(false) }} onClose={() => setShowSearch(false)} />
      )}
      {showBookmarks && (
        <BookmarksPanel bookmarks={bookmarks} onRemoveBookmark={removeBookmark} onClose={() => setShowBookmarks(false)} />
      )}
      {showComparison && <DocumentComparison onClose={() => setShowComparison(false)} />}
      {showShortcuts && <KeyboardShortcuts onClose={() => setShowShortcuts(false)} />}
      {viewingDocId && <DocumentViewer documentId={viewingDocId} onClose={() => setViewingDocId(null)} />}
      {showOnboarding && <OnboardingTour onDone={() => setShowOnboarding(false)} />}

      {/* ── Advanced Tool Modals ── */}
      {showRisk        && <RiskAnalyzer onClose={() => setShowRisk(false)} />}
      {showBrief       && <BriefGenerator onClose={() => setShowBrief(false)} />}
      {showJurisdiction && <JurisdictionComparator onClose={() => setShowJurisdiction(false)} />}
      {showDeadline    && <DeadlineCalculator onClose={() => setShowDeadline(false)} />}
      {showGlossary    && <GlossaryLookup onClose={() => setShowGlossary(false)} />}
      {showSticky      && <StickyNotes onClose={() => setShowSticky(false)} />}
    </div>
  )
}

// ── Auth gate ─────────────────────────────────────────────────────────────────
function AuthGate() {
  const { isAuthenticated, isLoading } = useAuth()
  const [view, setView] = useState<AuthView>('login')

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-legal-600" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return view === 'login'
      ? <LoginPage onViewChange={setView} />
      : <RegisterPage onViewChange={setView} />
  }

  return <MainApp />
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AuthGate />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
