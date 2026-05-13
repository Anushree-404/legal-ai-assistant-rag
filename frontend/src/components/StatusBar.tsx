import { useEffect, useState } from 'react'
import { Cpu, Database, Zap, Circle } from 'lucide-react'
import { clsx } from 'clsx'

interface HealthData {
  status: string
  vector_store_chunks: number
  llm_model: string
  embedding_model: string
  api_key_set: boolean
}

interface Props {
  responseTime?: number | null
  isDark: boolean
}

export function StatusBar({ responseTime, isDark }: Props) {
  const [health, setHealth] = useState<HealthData | null>(null)

  useEffect(() => {
    const fetchHealth = () => {
      fetch('/health')
        .then((r) => r.json())
        .then(setHealth)
        .catch(() => {})
    }
    fetchHealth()
    const interval = setInterval(fetchHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  const isOnline = health?.status === 'ok' && health?.api_key_set

  return (
    <div className={clsx(
      'flex items-center gap-4 border-t px-6 py-1.5 text-xs shrink-0',
      isDark ? 'bg-gray-900 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'
    )}>
      {/* Status indicator */}
      <div className="flex items-center gap-1.5">
        <Circle className={clsx(
          'h-2 w-2 fill-current',
          isOnline ? 'text-green-500' : 'text-red-400'
        )} />
        <span>{isOnline ? 'Online' : 'Offline'}</span>
      </div>

      <div className={clsx('h-3 w-px', isDark ? 'bg-gray-700' : 'bg-gray-300')} />

      {/* Model */}
      {health && (
        <div className="flex items-center gap-1.5">
          <Cpu className="h-3 w-3" />
          <span className="font-mono">{health.llm_model.replace('models/', '')}</span>
        </div>
      )}

      <div className={clsx('h-3 w-px', isDark ? 'bg-gray-700' : 'bg-gray-300')} />

      {/* Vector store */}
      {health && (
        <div className="flex items-center gap-1.5">
          <Database className="h-3 w-3" />
          <span>{health.vector_store_chunks} chunks indexed</span>
        </div>
      )}

      {/* Response time */}
      {responseTime != null && (
        <>
          <div className={clsx('h-3 w-px', isDark ? 'bg-gray-700' : 'bg-gray-300')} />
          <div className="flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-yellow-500" />
            <span>{(responseTime / 1000).toFixed(1)}s response</span>
          </div>
        </>
      )}

      {/* Right side */}
      <div className="ml-auto text-xs opacity-60">Legal AI v1.0</div>
    </div>
  )
}
