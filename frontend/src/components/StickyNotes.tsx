import { useState, useEffect, useCallback } from 'react'
import { StickyNote, Plus, X, Trash2, GripVertical } from 'lucide-react'
import { clsx } from 'clsx'
import { useTheme } from '../context/ThemeContext'

interface Note {
  id: string
  content: string
  color: string
  x: number
  y: number
  createdAt: string
}

const COLORS = [
  { bg: 'bg-yellow-100 border-yellow-300', text: 'text-yellow-900', btn: 'hover:bg-yellow-200', value: 'yellow' },
  { bg: 'bg-blue-100 border-blue-300',   text: 'text-blue-900',   btn: 'hover:bg-blue-200',   value: 'blue' },
  { bg: 'bg-green-100 border-green-300', text: 'text-green-900',  btn: 'hover:bg-green-200',  value: 'green' },
  { bg: 'bg-pink-100 border-pink-300',   text: 'text-pink-900',   btn: 'hover:bg-pink-200',   value: 'pink' },
  { bg: 'bg-purple-100 border-purple-300', text: 'text-purple-900', btn: 'hover:bg-purple-200', value: 'purple' },
]

const STORAGE_KEY = 'legal_ai_sticky_notes'

function loadNotes(): Note[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

function saveNotes(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

interface Props { onClose: () => void }

export function StickyNotes({ onClose }: Props) {
  const { isDark } = useTheme()
  const [notes, setNotes]       = useState<Note[]>(loadNotes)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  useEffect(() => { saveNotes(notes) }, [notes])

  const addNote = () => {
    const color = COLORS[notes.length % COLORS.length].value
    const newNote: Note = {
      id: Math.random().toString(36).slice(2),
      content: '',
      color,
      x: 80 + (notes.length % 4) * 30,
      y: 80 + (notes.length % 3) * 30,
      createdAt: new Date().toISOString(),
    }
    setNotes((prev) => [...prev, newNote])
    setEditingId(newNote.id)
  }

  const updateNote = (id: string, content: string) => {
    setNotes((prev) => prev.map((n) => n.id === id ? { ...n, content } : n))
  }

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    if ((e.target as HTMLElement).tagName === 'TEXTAREA') return
    setDragging(id)
    const note = notes.find((n) => n.id === id)!
    setDragOffset({ x: e.clientX - note.x, y: e.clientY - note.y })
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging) return
    setNotes((prev) => prev.map((n) =>
      n.id === dragging ? { ...n, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y } : n
    ))
  }, [dragging, dragOffset])

  const handleMouseUp = useCallback(() => setDragging(null), [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp) }
  }, [handleMouseMove, handleMouseUp])

  return (
    <>
      {/* Overlay backdrop */}
      <div className="fixed inset-0 z-40 pointer-events-none" />

      {/* Control panel */}
      <div className={clsx(
        'fixed top-20 right-6 z-50 rounded-2xl shadow-2xl border p-4 w-56',
        isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      )}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-yellow-500" />
            <span className={clsx('text-sm font-bold', isDark ? 'text-white' : 'text-gray-900')}>Sticky Notes</span>
            <span className={clsx('rounded-full px-1.5 py-0.5 text-xs font-bold', isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600')}>
              {notes.length}
            </span>
          </div>
          <button onClick={onClose} className={clsx('rounded p-1', isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600')}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <button onClick={addNote} className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2">
          <Plus className="h-4 w-4" /> Add Note
        </button>

        {notes.length > 0 && (
          <button onClick={() => { if (confirm('Delete all notes?')) setNotes([]) }}
            className={clsx('mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs transition-colors',
              isDark ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500')}>
            <Trash2 className="h-3.5 w-3.5" /> Clear all
          </button>
        )}

        <p className={clsx('text-xs mt-3 text-center', isDark ? 'text-gray-600' : 'text-gray-400')}>
          Drag notes anywhere on screen
        </p>
      </div>

      {/* Floating notes */}
      {notes.map((note) => {
        const colorCfg = COLORS.find((c) => c.value === note.color) ?? COLORS[0]
        return (
          <div
            key={note.id}
            style={{ position: 'fixed', left: note.x, top: note.y, zIndex: 45, width: 200 }}
            className={clsx(
              'rounded-xl border-2 shadow-lg select-none',
              colorCfg.bg,
              dragging === note.id ? 'cursor-grabbing shadow-2xl scale-105' : 'cursor-grab'
            )}
            onMouseDown={(e) => handleMouseDown(e, note.id)}
          >
            {/* Note header */}
            <div className={clsx('flex items-center justify-between px-3 py-2 rounded-t-xl', colorCfg.btn)}>
              <GripVertical className={clsx('h-3.5 w-3.5', colorCfg.text, 'opacity-50')} />
              <div className="flex gap-1">
                {COLORS.map((c) => (
                  <button key={c.value} onClick={() => setNotes((prev) => prev.map((n) => n.id === note.id ? { ...n, color: c.value } : n))}
                    className={clsx('h-3 w-3 rounded-full border', c.bg, note.color === c.value ? 'ring-2 ring-offset-1 ring-gray-400' : '')} />
                ))}
              </div>
              <button onClick={() => deleteNote(note.id)} className={clsx('rounded p-0.5', colorCfg.btn, colorCfg.text, 'opacity-60 hover:opacity-100')}>
                <X className="h-3 w-3" />
              </button>
            </div>

            {/* Note content */}
            <textarea
              value={note.content}
              onChange={(e) => updateNote(note.id, e.target.value)}
              onFocus={() => setEditingId(note.id)}
              onBlur={() => setEditingId(null)}
              placeholder="Type your note…"
              className={clsx(
                'w-full resize-none bg-transparent px-3 py-2 text-xs focus:outline-none rounded-b-xl',
                colorCfg.text, 'placeholder-opacity-50'
              )}
              style={{ minHeight: 80, maxHeight: 200 }}
            />
          </div>
        )
      })}
    </>
  )
}
