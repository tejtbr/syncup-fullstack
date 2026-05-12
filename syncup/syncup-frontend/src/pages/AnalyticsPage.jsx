import { useState, useEffect } from 'react'
import { analyticsApiCalls } from '../api'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  inOffice:  { bg: 'bg-emerald-500', light: 'bg-emerald-50',  text: 'text-emerald-700', label: 'In Office'  },
  remote:    { bg: 'bg-blue-500',    light: 'bg-blue-50',     text: 'text-blue-700',    label: 'Remote'     },
  onLeave:   { bg: 'bg-amber-500',   light: 'bg-amber-50',    text: 'text-amber-700',   label: 'On Leave'   },
  undecided: { bg: 'bg-gray-300',    light: 'bg-gray-50',     text: 'text-gray-600',    label: 'Undecided'  },
}

function BarSegment({ value, total, colorClass, label }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  if (pct === 0) return null
  return (
    <div
      className={`${colorClass} h-full flex items-center justify-center text-white text-xs font-bold transition-all`}
      style={{ width: `${pct}%`, minWidth: value > 0 ? '24px' : '0' }}
      title={`${label}: ${value} (${pct}%)`}
    >
      {pct >= 10 ? `${pct}%` : ''}
    </div>
  )
}

function DepartmentCard({ stat }) {
  const total = stat.total || 1
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 text-sm">{stat.department}</h3>
        <span className="text-xs text-gray-400">{stat.total} people</span>
      </div>

      {/* Stacked bar */}
      <div className="h-7 rounded-lg overflow-hidden flex w-full mb-3">
        <BarSegment value={stat.inOffice}  total={total} colorClass="bg-emerald-500" label="In Office" />
        <BarSegment value={stat.remote}    total={total} colorClass="bg-blue-500"    label="Remote" />
        <BarSegment value={stat.onLeave}   total={total} colorClass="bg-amber-500"   label="On Leave" />
        <BarSegment value={stat.undecided} total={total} colorClass="bg-gray-300"    label="Undecided" />
      </div>

      {/* Legend counts */}
      <div className="grid grid-cols-2 gap-1.5">
        {[
          { key: 'inOffice',  val: stat.inOffice  },
          { key: 'remote',    val: stat.remote    },
          { key: 'onLeave',   val: stat.onLeave   },
          { key: 'undecided', val: stat.undecided },
        ].map(({ key, val }) => (
          <div key={key} className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${STATUS_COLORS[key].light}`}>
            <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[key].bg}`} />
            <span className={`text-xs font-medium ${STATUS_COLORS[key].text}`}>
              {STATUS_COLORS[key].label}: {val}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function WeeklyChart({ trends }) {
  if (!trends || trends.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">No trend data yet.</p>
  }
  const maxVal = Math.max(...trends.map(t => t.inOffice + t.remote + t.onLeave + t.undecided), 1)

  return (
    <div className="overflow-x-auto">
      <div className="flex items-end gap-1.5 min-w-max pb-2" style={{ height: '160px' }}>
        {trends.map((t, i) => {
          const total = t.inOffice + t.remote + t.onLeave + t.undecided
          const h = Math.round((total / maxVal) * 120)
          const d = new Date(t.date)
          const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })
          return (
            <div key={i} className="flex flex-col items-center gap-1" style={{ minWidth: '44px' }}>
              <span className="text-[9px] text-gray-400">{total}</span>
              <div className="w-8 rounded-t-sm overflow-hidden flex flex-col-reverse" style={{ height: `${h}px` }}>
                {[
                  { val: t.inOffice,  color: 'bg-emerald-500' },
                  { val: t.remote,    color: 'bg-blue-500'    },
                  { val: t.onLeave,   color: 'bg-amber-400'   },
                  { val: t.undecided, color: 'bg-gray-200'    },
                ].map(({ val, color }, ci) => val > 0 && (
                  <div key={ci} className={`${color} w-full`}
                    style={{ height: `${Math.round((val / maxVal) * 120)}px` }} />
                ))}
              </div>
              <span className="text-[9px] text-gray-500 text-center leading-tight">{label}</span>
            </div>
          )
        })}
      </div>
      {/* Legend */}
      <div className="flex gap-3 flex-wrap mt-3">
        {Object.entries(STATUS_COLORS).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1">
            <span className={`w-2.5 h-2.5 rounded-sm ${val.bg}`} />
            <span className="text-xs text-gray-500">{val.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [deptStats, setDeptStats]   = useState([])
  const [trends, setTrends]         = useState([])
  const [date, setDate]             = useState(new Date().toISOString().split('T')[0])
  const [weeks, setWeeks]           = useState(4)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    load()
  }, [date, weeks])

  async function load() {
    setLoading(true)
    try {
      const [dept, trend] = await Promise.all([
        analyticsApiCalls.getDepartmentStats(date),
        analyticsApiCalls.getWeeklyTrends(weeks),
      ])
      setDeptStats(dept || [])
      setTrends(trend || [])
    } catch {
      toast.error('Could not load analytics. Is the analytics service running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-400 mt-0.5">Department presence and weekly trends</p>
        </div>
        <input
          type="date"
          className="input text-sm w-44"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>

      {/* Department breakdown */}
      <div className="card p-5">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Department Breakdown — {date}</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : deptStats.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No data yet. Status updates will appear here as people check in.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {deptStats.map(stat => (
              <DepartmentCard key={stat.department} stat={stat} />
            ))}
          </div>
        )}
      </div>

      {/* Weekly trends */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Weekly Trends</h2>
          <select
            className="input text-sm w-36"
            value={weeks}
            onChange={e => setWeeks(Number(e.target.value))}
          >
            <option value={1}>Last 1 week</option>
            <option value={2}>Last 2 weeks</option>
            <option value={4}>Last 4 weeks</option>
            <option value={8}>Last 8 weeks</option>
          </select>
        </div>
        {loading ? (
          <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
        ) : (
          <WeeklyChart trends={trends} />
        )}
      </div>
    </div>
  )
}
