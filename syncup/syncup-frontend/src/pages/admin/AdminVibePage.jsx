import { useState, useEffect } from 'react'
import { vibeApiCalls } from '../../api'
import toast from 'react-hot-toast'
import EmployeeVoiceCard from '../../components/admin/EmployeeVoiceCard'

const MOOD = {
  5: { label:'Thriving',   emoji:'😄', color:'text-emerald-600', bg:'bg-emerald-50',  bar:'bg-emerald-500' },
  4: { label:'Good',       emoji:'🙂', color:'text-blue-600',    bg:'bg-blue-50',     bar:'bg-blue-500'    },
  3: { label:'Okay',       emoji:'😐', color:'text-amber-600',   bg:'bg-amber-50',    bar:'bg-amber-400'   },
  2: { label:'Low',        emoji:'😔', color:'text-orange-600',  bg:'bg-orange-50',   bar:'bg-orange-500'  },
  1: { label:'Struggling', emoji:'😞', color:'text-rose-600',    bg:'bg-rose-50',     bar:'bg-rose-500'    },
}
const meta = avg => MOOD[Math.round(avg)] || MOOD[3]

export default function AdminVibePage() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    vibeApiCalls.getDashboard()
      .then(setSummary)
      .catch(() => toast.error('VibeCheck service not reachable on port 8082'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}
    </div>
  )

  if (!summary) return (
    <div className="p-6 text-center text-gray-400 text-sm">
      VibeCheck service not running. Start it on port 8082.
    </div>
  )

  const todayMeta = meta(summary.todayAvgMood || 3)

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">VibeCheck — Admin View</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          All data is anonymous. No individual names are shown.
        </p>
      </div>

      {/* Privacy notice */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
        <span className="text-lg">🔒</span>
        <p>This view shows team-level and department-level averages only. Individual responses and identities are never visible to administrators.</p>
      </div>

      {/* Today score */}
      <div className={`card p-5 ${todayMeta.bg} border-0`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-1">Team Mood Today</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-bold ${todayMeta.color}`}>
                {summary.todayAvgMood > 0 ? summary.todayAvgMood.toFixed(1) : '—'}
              </span>
              <span className={`text-xl font-semibold ${todayMeta.color}`}>/ 5</span>
            </div>
            <p className={`text-base font-bold mt-1 ${todayMeta.color}`}>
              {todayMeta.emoji} {todayMeta.label}
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-gray-700">{summary.todayResponseCount}</p>
            <p className="text-sm text-gray-400">check-ins today</p>
          </div>
        </div>
        <div className="flex gap-1 mt-4">
          {[1,2,3,4,5].map(s => (
            <div key={s} className={`flex-1 h-2 rounded-full ${s <= Math.round(summary.todayAvgMood) ? MOOD[s].bar : 'bg-white/50'}`} />
          ))}
        </div>
      </div>

      {/* Dept breakdown */}
      {summary.departmentBreakdown?.length > 0 && (
        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Department Mood — Last 7 Days</h2>
          <div className="space-y-4">
            {summary.departmentBreakdown.map(d => {
              const m = meta(d.avgMood)
              const riskFlag = d.avgMood <= 2.5
              return (
                <div key={d.department}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">{d.department}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.bg} ${m.color}`}>
                        {m.emoji} {m.label}
                      </span>
                      {riskFlag && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 font-medium">
                          ⚠️ Attention needed
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${m.color}`}>{d.avgMood.toFixed(1)}</span>
                      <span className="text-xs text-gray-400">({d.responseCount} responses)</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${m.bar} rounded-full`} style={{ width: `${(d.avgMood/5)*100}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 30 day trend */}
      {summary.last30Days?.length > 0 && (
        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">30-Day Mood Trend</h2>
          <div className="overflow-x-auto">
            <div className="flex items-end gap-1.5 min-w-max pb-2" style={{ height:'130px' }}>
              {summary.last30Days.map((d, i) => {
                const pct = (Number(d.avgMood) / 5) * 100
                const m   = meta(d.avgMood)
                const lbl = new Date(d.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                return (
                  <div key={i} className="flex flex-col items-center gap-1" style={{ minWidth:'38px' }}>
                    <span className="text-[9px] text-gray-400">{d.avgMood.toFixed(1)}</span>
                    <div
                        className={`w-6 ${m.bar} rounded-t-sm`}
                        style={{
                          height: `${Math.max((Number(d.avgMood) / 5) * 90, 8)}px`
                        }}
                        title={`${lbl}: ${d.avgMood} avg`}
                      />
                    <span className="text-[9px] text-gray-500 text-center">{lbl}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Employee Voice — AI Comment Analysis */}
      <EmployeeVoiceCard comments={summary.anonymousComments} />
      {summary.anonymousComments?.length > 0 && (
        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-1">Anonymous Comments Today</h2>
          <p className="text-xs text-gray-400 mb-4">Submitted anonymously — no names are ever stored with comments</p>
          <div className="space-y-2">
            {summary.anonymousComments.map((c, i) => (
              <div key={i} className="flex gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-300 text-xl leading-tight">"</span>
                <p className="text-sm text-gray-600 italic flex-1">{c}</p>
                <span className="text-gray-300 text-xl leading-tight self-end">"</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
