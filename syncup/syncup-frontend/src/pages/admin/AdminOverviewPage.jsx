import { useState, useEffect } from 'react'
import { adminApi, analyticsApiCalls } from '../../api'
import toast from 'react-hot-toast'

function StatCard({ label, value, sub, color, bg, emoji }) {
  return (
    <div className={`card p-5 ${bg}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <span className="text-2xl">{emoji}</span>
      </div>
    </div>
  )
}

function DonutBar({ data, total }) {
  const segments = [
    { key: 'inOffice',    color: 'bg-emerald-500', label: 'In Office'  },
    { key: 'remote',      color: 'bg-blue-500',    label: 'Remote'     },
    { key: 'onLeave',     color: 'bg-amber-500',   label: 'On Leave'   },
    { key: 'undecided',   color: 'bg-gray-300',    label: 'Undecided'  },
    { key: 'notResponded',color: 'bg-gray-100',    label: 'No Response'},
  ]
  return (
    <div>
      <div className="flex h-4 rounded-full overflow-hidden w-full">
        {segments.map(s => {
          const val = data?.[s.key] || 0
          const pct = total > 0 ? (val / total) * 100 : 0
          return pct > 0 ? (
            <div key={s.key} className={`${s.color} h-full`} style={{ width: `${pct}%` }}
              title={`${s.label}: ${val}`} />
          ) : null
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
        {segments.map(s => (
          <div key={s.key} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
            <span className="text-xs text-gray-500">{s.label}: {data?.[s.key] || 0}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminOverviewPage() {
  const [overview, setOverview]   = useState(null)
  const [deptStats, setDeptStats] = useState([])
  const [date, setDate]           = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading]     = useState(true)

  useEffect(() => { load() }, [date])

  async function load() {
    setLoading(true)
    try {
      const [ov, dept] = await Promise.all([
        adminApi.getOverview(date),
        analyticsApiCalls.getDepartmentStats(date).catch(() => []),
      ])
      setOverview(ov)
      setDeptStats(dept || [])
    } catch {
      toast.error('Failed to load overview')
    } finally {
      setLoading(false)
    }
  }

  const total = overview?.totalEmployees || 1

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Admin Overview</h1>
          <p className="text-sm text-gray-400 mt-0.5">Organisation presence at a glance</p>
        </div>
        <input type="date" className="input text-sm w-44"
          value={date} onChange={e => setDate(e.target.value)} />
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard label="Total Employees"  value={overview?.totalEmployees}  color="text-gray-800"    bg="bg-white"       emoji="👥" />
          <StatCard label="In Office Today"  value={overview?.inOffice}        color="text-emerald-600" bg="bg-emerald-50"  emoji="🏢"
            sub={`${total > 0 ? Math.round((overview?.inOffice/total)*100) : 0}% of workforce`} />
          <StatCard label="Remote Today"     value={overview?.remote}          color="text-blue-600"    bg="bg-blue-50"     emoji="🏠" />
          <StatCard label="On Leave"         value={overview?.onLeave}         color="text-amber-600"   bg="bg-amber-50"    emoji="🌴" />
          <StatCard label="Undecided"        value={overview?.undecided}       color="text-gray-600"    bg="bg-gray-50"     emoji="🤔" />
          <StatCard label="No Response Yet"  value={overview?.notResponded}    color="text-rose-500"    bg="bg-rose-50"     emoji="❓"
            sub="Haven't set status today" />
        </div>
      )}

      {/* Response bar */}
      {!loading && overview && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Workforce Distribution — {date}</h2>
          <DonutBar data={overview} total={total} />
        </div>
      )}

      {/* Dept breakdown */}
      {deptStats.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Department Breakdown</h2>
          <div className="space-y-3">
            {deptStats.map(d => (
              <div key={d.department}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{d.department}</span>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="text-emerald-600 font-medium">{d.inOffice} in</span>
                    <span className="text-blue-600">{d.remote} remote</span>
                    <span className="text-gray-400">{d.total} total</span>
                  </div>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
                  {d.total > 0 && (
                    <>
                      <div className="bg-emerald-500 h-full" style={{ width: `${(d.inOffice/d.total)*100}%` }} />
                      <div className="bg-blue-400 h-full"    style={{ width: `${(d.remote/d.total)*100}%` }} />
                      <div className="bg-amber-400 h-full"   style={{ width: `${(d.onLeave/d.total)*100}%` }} />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
