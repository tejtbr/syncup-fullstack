import { useState, useEffect } from 'react'
import { vibeApiCalls } from '../api'
import toast from 'react-hot-toast'

const MOOD_META = {
  5: { label: 'Thriving',   emoji: '😄', color: 'text-emerald-600', bg: 'bg-emerald-50',  bar: 'bg-emerald-500' },
  4: { label: 'Good',       emoji: '🙂', color: 'text-blue-600',    bg: 'bg-blue-50',     bar: 'bg-blue-500'    },
  3: { label: 'Okay',       emoji: '😐', color: 'text-amber-600',   bg: 'bg-amber-50',    bar: 'bg-amber-400'   },
  2: { label: 'Low',        emoji: '😔', color: 'text-orange-600',  bg: 'bg-orange-50',   bar: 'bg-orange-500'  },
  1: { label: 'Struggling', emoji: '😞', color: 'text-rose-600',    bg: 'bg-rose-50',     bar: 'bg-rose-500'    },
}

function scoreToMeta(avg) {
  return MOOD_META[Math.round(avg)] || MOOD_META[3]
}

function MoodBar({ avg, maxVal }) {
  const pct = maxVal > 0 ? Math.round((avg / maxVal) * 100) : 0
  const meta = scoreToMeta(avg)
  return (
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full ${meta.bar} rounded-full`} style={{ width: `${pct}%` }} />
    </div>
  )
}

function TrendChart({ data }) {
  if (!data || data.length === 0) return (
    <p className="text-sm text-gray-400 text-center py-8">No data yet — check-ins will appear here.</p>
  )
  return (
    <div className="overflow-x-auto">
      <div className="flex items-end gap-2 min-w-max pb-2" style={{ height: '140px' }}>
        {data.map((d, i) => {
          const pct  = (d.avgMood / 5) * 100
          const meta = scoreToMeta(d.avgMood)
          const date = new Date(d.date)
          const label = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
          return (
            <div key={i} className="flex flex-col items-center gap-1" style={{ minWidth: '40px' }}>
              <span className="text-[9px] text-gray-400">{d.avgMood.toFixed(1)}</span>
              <div
                className={`w-7 ${meta.bar} rounded-t-sm`}
                style={{
                  height: `${Math.max((Number(d.avgMood) / 5) * 100, 10)}px`
                }}
                title={`${label}: ${d.avgMood} (${d.responseCount} responses)`}
              />
              <span className="text-[9px] text-gray-500 text-center">{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function VibeDashboardPage() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    vibeApiCalls.getDashboard()
      .then(setSummary)
      .catch(() => toast.error('Could not load VibeCheck dashboard. Is the service running on port 8082?'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}
    </div>
  )

  if (!summary) return (
    <div className="p-6 text-center text-gray-400 text-sm">
      Could not load dashboard. Make sure the VibeCheck service is running on port 8082.
    </div>
  )

  const todayMeta = scoreToMeta(summary.todayAvgMood || 3)

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">VibeCheck Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">Team mood and wellbeing overview</p>
      </div>

      {/* Today's score card */}
      <div className={`card p-5 ${todayMeta.bg} border-0`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Team mood today</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${todayMeta.color}`}>
                {summary.todayAvgMood > 0 ? summary.todayAvgMood.toFixed(1) : '—'}
              </span>
              <span className={`text-lg font-semibold ${todayMeta.color}`}>/ 5</span>
            </div>
            <p className={`text-sm font-semibold mt-1 ${todayMeta.color}`}>
              {todayMeta.emoji} {todayMeta.label}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-700">{summary.todayResponseCount}</p>
            <p className="text-xs text-gray-400">check-ins today</p>
          </div>
        </div>
        {/* Score scale */}
        <div className="mt-4 flex gap-1">
          {[1,2,3,4,5].map(s => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full ${
                s <= Math.round(summary.todayAvgMood) ? MOOD_META[s].bar : 'bg-white/60'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>Struggling</span><span>Thriving</span>
        </div>
      </div>

      {/* Dept breakdown */}
      {summary.departmentBreakdown?.length > 0 && (
        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Department Mood (last 7 days)</h2>
          <div className="space-y-3">
            {summary.departmentBreakdown.map(d => {
              const meta = scoreToMeta(d.avgMood)
              return (
                <div key={d.department}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">{d.department}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.bg} ${meta.color}`}>
                        {meta.emoji} {meta.label}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${meta.color}`}>{d.avgMood.toFixed(1)}</span>
                      <span className="text-xs text-gray-400 ml-1">({d.responseCount})</span>
                    </div>
                  </div>
                  <MoodBar avg={d.avgMood} maxVal={5} />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 30-day trend */}
      <div className="card p-5">
        <h2 className="text-base font-semibold text-gray-800 mb-4">30-Day Mood Trend</h2>
        <TrendChart data={summary.last30Days} />
        {
        console.log(summary)
}
      </div>

      {/* Anonymous comments */}
      {/* {summary.anonymousComments?.length > 0 && (
        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-3">
            Today's Anonymous Thoughts
            <span className="text-xs font-normal text-gray-400 ml-2">— names never shown</span>
          </h2>
          <div className="space-y-2">
            {summary.anonymousComments.map((comment, i) => (
              <div key={i} className="flex gap-2 p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-300 text-lg leading-tight">"</span>
                <p className="text-sm text-gray-600 italic flex-1">{comment}</p>
                <span className="text-gray-300 text-lg leading-tight self-end">"</span>
              </div>
            ))}
          </div>
        </div>
      )} */}

    </div>
  )
}
