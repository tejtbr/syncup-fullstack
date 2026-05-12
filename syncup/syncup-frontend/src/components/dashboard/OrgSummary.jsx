import { useState, useEffect } from 'react'
import { statusApi } from '../../api'

const STATS = [
  { key: 'inOffice', label: 'In Office', color: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-500' },
  { key: 'remote',   label: 'Remote',    color: 'text-blue-600',    bg: 'bg-blue-50',    bar: 'bg-blue-500'    },
  { key: 'onLeave',  label: 'On Leave',  color: 'text-amber-600',   bg: 'bg-amber-50',   bar: 'bg-amber-500'   },
  { key: 'undecided',label: 'Undecided', color: 'text-gray-500',    bg: 'bg-gray-50',    bar: 'bg-gray-300'    },
]

export default function OrgSummary() {
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    statusApi.getOrgSummary().then(setSummary).catch(() => {})
  }, [])

  if (!summary) return null

  const responded = summary.inOffice + summary.remote + summary.onLeave + summary.undecided
  const notSet = summary.totalEmployees - responded

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-800">Organisation today</h2>
        <span className="text-xs text-gray-400">{responded}/{summary.totalEmployees} responded</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATS.map(s => {
          const count = summary[s.key] || 0
          const pct = summary.totalEmployees > 0
            ? Math.round((count / summary.totalEmployees) * 100)
            : 0
          return (
            <div key={s.key} className={`${s.bg} rounded-xl p-3`}>
              <p className={`text-2xl font-bold ${s.color}`}>{count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              <div className="mt-2 h-1 bg-white rounded-full overflow-hidden">
                <div className={`h-full ${s.bar} rounded-full`} style={{ width: `${pct}%` }} />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">{pct}%</p>
            </div>
          )
        })}
      </div>

      {notSet > 0 && (
        <p className="text-xs text-gray-400 mt-3 text-center">
          {notSet} {notSet === 1 ? 'person has' : 'people have'} not set their status yet
        </p>
      )}
    </div>
  )
}
