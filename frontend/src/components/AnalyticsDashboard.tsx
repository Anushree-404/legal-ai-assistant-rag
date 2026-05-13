import { useMemo } from 'react'
import { X, BarChart3, TrendingUp, BookOpen, Target, Zap, Award } from 'lucide-react'
import type { AnalyticsData } from '../types'
import { clsx } from 'clsx'

const DOMAIN_COLORS: Record<string, string> = {
  constitutional: '#7c3aed', criminal: '#dc2626', civil: '#2563eb',
  contract: '#16a34a', tort: '#ea580c', property: '#ca8a04',
  family: '#db2777', employment: '#0d9488', immigration: '#4f46e5',
  intellectual_property: '#0891b2', corporate: '#475569', tax: '#65a30d',
  general: '#6b7280',
}

const BAR_COLORS = ['bg-legal-600', 'bg-legal-500', 'bg-legal-400', 'bg-legal-300', 'bg-legal-200']

interface Props {
  data: AnalyticsData
  onClose: () => void
  onClear: () => void
}

export function AnalyticsDashboard({ data, onClose, onClear }: Props) {
  const maxDay = useMemo(() => Math.max(...data.queriesPerDay.map((d) => d.count), 1), [data])
  const totalDomains = useMemo(() => Object.keys(data.domainBreakdown).length, [data])
  const topDomain = useMemo(() => {
    const entries = Object.entries(data.domainBreakdown)
    if (!entries.length) return '—'
    return entries.sort((a, b) => b[1] - a[1])[0][0].replace('_', ' ')
  }, [data])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-legal-600" />
            <h2 className="text-lg font-bold text-gray-900">Research Analytics</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClear} className="text-xs text-red-400 hover:text-red-600 underline">
              Clear data
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {data.totalQueries === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <BarChart3 className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">No data yet</p>
              <p className="text-xs mt-1">Start asking legal questions to see analytics</p>
            </div>
          ) : (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: <Zap className="h-4 w-4" />, label: 'Total Queries', value: data.totalQueries, color: 'text-legal-600 bg-legal-50' },
                  { icon: <Target className="h-4 w-4" />, label: 'Domains Used', value: totalDomains, color: 'text-blue-600 bg-blue-50' },
                  { icon: <BookOpen className="h-4 w-4" />, label: 'Avg Sources', value: data.avgSourcesPerQuery, color: 'text-green-600 bg-green-50' },
                  { icon: <Award className="h-4 w-4" />, label: 'Top Domain', value: topDomain, color: 'text-purple-600 bg-purple-50', small: true },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className={clsx('inline-flex rounded-lg p-2 mb-2', s.color)}>
                      {s.icon}
                    </div>
                    <p className={clsx('font-bold text-gray-900', s.small ? 'text-sm' : 'text-2xl')}>{s.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Queries per day bar chart */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-legal-600" />
                  <h3 className="text-sm font-semibold text-gray-700">Queries — Last 7 Days</h3>
                </div>
                <div className="flex items-end gap-2 h-24 bg-gray-50 rounded-xl px-4 py-3">
                  {data.queriesPerDay.map((d) => (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-gray-500">{d.count || ''}</span>
                      <div
                        className="w-full rounded-t-md bg-legal-500 transition-all"
                        style={{ height: `${Math.max((d.count / maxDay) * 56, d.count > 0 ? 4 : 0)}px` }}
                      />
                      <span className="text-xs text-gray-400">
                        {new Date(d.date).toLocaleDateString('en', { weekday: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Domain breakdown */}
              {Object.keys(data.domainBreakdown).length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-4 w-4 text-legal-600" />
                    <h3 className="text-sm font-semibold text-gray-700">Queries by Domain</h3>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(data.domainBreakdown)
                      .sort((a, b) => b[1] - a[1])
                      .map(([domain, count]) => {
                        const pct = Math.round((count / data.totalQueries) * 100)
                        return (
                          <div key={domain} className="flex items-center gap-3">
                            <span className="w-28 text-xs text-gray-600 capitalize shrink-0">
                              {domain.replace('_', ' ')}
                            </span>
                            <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: DOMAIN_COLORS[domain] ?? '#6b7280',
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}

              {/* Top sources */}
              {data.topSources.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="h-4 w-4 text-legal-600" />
                    <h3 className="text-sm font-semibold text-gray-700">Most Retrieved Sources</h3>
                  </div>
                  <div className="space-y-2">
                    {data.topSources.map((s, i) => (
                      <div key={s.citation || s.title} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                        <span className={clsx('flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white', BAR_COLORS[i])}>
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">{s.title}</p>
                          {s.citation && <p className="text-xs font-mono text-legal-600 truncate">{s.citation}</p>}
                        </div>
                        <span className="text-xs text-gray-500 shrink-0">{s.count}×</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
