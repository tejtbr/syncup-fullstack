import { useState, useEffect } from 'react'
import { vibeApiCalls } from '../../api'
import toast from 'react-hot-toast'
import EmployeeVoiceCard from '../../components/admin/EmployeeVoiceCard'

const MOOD = {
  5: {
    label: 'Thriving',
    emoji: '😄',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    bar: 'bg-emerald-500',
  },
  4: {
    label: 'Good',
    emoji: '🙂',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    bar: 'bg-blue-500',
  },
  3: {
    label: 'Okay',
    emoji: '😐',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    bar: 'bg-amber-400',
  },
  2: {
    label: 'Low',
    emoji: '😔',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    bar: 'bg-orange-500',
  },
  1: {
    label: 'Struggling',
    emoji: '😞',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    bar: 'bg-rose-500',
  },
}

const meta = (avg) => MOOD[Math.round(avg)] || MOOD[3]

export default function AdminVibePage() {

  const today = new Date().toISOString().slice(0, 10)

  const weekAgo = new Date(
    Date.now() - 6 * 24 * 60 * 60 * 1000
  )
    .toISOString()
    .slice(0, 10)

  const [summary, setSummary] = useState(null)

  const [loading, setLoading] = useState(true)

  const [fromDate, setFromDate] = useState(weekAgo)

  const [toDate, setToDate] = useState(today)

  const [department, setDepartment] = useState('All')

  useEffect(() => {
    vibeApiCalls
      .getDashboard()
      .then(setSummary)
      .catch(() =>
        toast.error(
          'VibeCheck service not reachable on port 8082'
        )
      )
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">

        <div className="max-w-7xl mx-auto space-y-5">

          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 rounded-3xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">

        <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-10 text-center max-w-md w-full">

          <div className="text-5xl mb-4">
            ⚠️
          </div>

          <p className="text-gray-600 text-sm">
            VibeCheck service not running.
            Start it on port 8082.
          </p>
        </div>
      </div>
    )
  }

  const todayMeta = meta(summary.todayAvgMood || 3)

  return (

    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#dbeafe,_transparent_25%),radial-gradient(circle_at_bottom_left,_#dcfce7,_transparent_25%),linear-gradient(to_bottom_right,_#f8fafc,_#eef2ff)] p-4 sm:p-6 lg:p-8">

      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 text-white flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between shadow-xl">

          <div>

            <h1 className="text-4xl font-black tracking-tight text-white">
              VibeCheck Dashboard
            </h1>

            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">

              Real-time anonymous employee sentiment insights
              across departments and teams.

            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-blue-200/20 bg-white/10 backdrop-blur-xl px-4 py-3 shadow-sm max-w-xl">

            <div className="text-2xl">
              🔒
            </div>

            <p className="text-sm text-slate-200 leading-relaxed">

              All insights shown here are anonymous and
              aggregated. Individual employee identities
              are never visible.

            </p>
          </div>
        </div>

        {/* Team Mood Card */}

        <div className="grid grid-cols-1 gap-6">

          <div
            className={`rounded-3xl shadow-sm border border-white/40 p-6 lg:p-8 ${todayMeta.bg} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}
          >

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

              {/* Left */}

              <div>

                <div className="flex items-center gap-3 mb-4">

                  <div className="h-14 w-14 rounded-2xl bg-white/70 backdrop-blur-sm flex items-center justify-center text-3xl shadow-sm">

                    {todayMeta.emoji}

                  </div>

                  <div>

                    <p className="text-sm font-medium text-gray-500">

                      Team Mood Today

                    </p>

                    <h2
                      className={`text-2xl font-bold ${todayMeta.color}`}
                    >
                      {todayMeta.label}
                    </h2>
                  </div>
                </div>

                <div className="flex items-end gap-3">

                  <span
                    className={`text-7xl leading-none font-black ${todayMeta.color}`}
                  >

                    {summary.todayAvgMood > 0
                      ? summary.todayAvgMood.toFixed(1)
                      : '—'}

                  </span>

                  <span
                    className={`text-2xl font-bold mb-2 ${todayMeta.color}`}
                  >
                    / 5
                  </span>
                </div>

                <p className="text-sm text-gray-500 mt-4 max-w-lg">

                  Based on anonymous employee mood
                  check-ins submitted today.

                </p>
              </div>

              {/* Right Stats */}

              <div className="grid grid-cols-2 gap-4 min-w-[260px]">

                <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/30 p-5 shadow-sm">

                  <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">

                    Responses

                  </p>

                  <p className="text-4xl font-black text-gray-800 mt-2">

                    {summary.todayResponseCount}

                  </p>

                  <p className="text-xs text-gray-500 mt-1">

                    check-ins today

                  </p>
                </div>

                <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/30 p-5 shadow-sm">

                  <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">

                    Status

                  </p>

                  <p
                    className={`text-lg font-bold mt-3 ${todayMeta.color}`}
                  >

                    {todayMeta.label}

                  </p>

                  <p className="text-xs text-gray-500 mt-2">

                    team sentiment

                  </p>
                </div>
              </div>
            </div>

            {/* Mood Bar */}

            <div className="mt-8">

              <div className="flex gap-2">

                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    className={`h-3 flex-1 rounded-full transition-all duration-300 ${
                      s <= Math.round(summary.todayAvgMood)
                        ? MOOD[s].bar
                        : 'bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Department + Trend */}

        <div className="grid grid-cols-1 2xl:grid-cols-5 gap-6">

          {/* Department Breakdown */}

          {summary.departmentBreakdown?.length > 0 && (

            <div className="2xl:col-span-3 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-sm p-6">

              <div className="flex items-center justify-between mb-6">

                <div>

                  <h2 className="text-xl font-bold text-gray-900">

                    Department Mood

                  </h2>

                  <p className="text-sm text-gray-500 mt-1">

                    Last 7 days sentiment overview

                  </p>
                </div>
              </div>

              <div className="space-y-5">

                {summary.departmentBreakdown.map((d) => {

                  const m = meta(d.avgMood)

                  const riskFlag = d.avgMood <= 2.5

                  return (

                    <div
                      key={d.department}
                      className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 hover:border-blue-200 hover:bg-blue-50/40 transition-all duration-300"
                    >

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">

                        <div className="flex flex-wrap items-center gap-2">

                          <span className="font-semibold text-gray-800 text-sm">

                            {d.department}

                          </span>

                          <span
                            className={`text-xs px-3 py-1 rounded-full font-semibold ${m.bg} ${m.color}`}
                          >

                            {m.emoji} {m.label}

                          </span>

                          {riskFlag && (

                            <span className="text-xs px-3 py-1 rounded-full bg-rose-100 text-rose-600 font-semibold">

                              ⚠ Attention Needed

                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">

                          <span
                            className={`text-lg font-bold ${m.color}`}
                          >

                            {d.avgMood.toFixed(1)}

                          </span>

                          <span className="text-xs text-gray-400">

                            {d.responseCount} responses

                          </span>
                        </div>
                      </div>

                      <div className="h-3 rounded-full bg-gray-200 overflow-hidden">

                        <div
                          className={`h-full rounded-full ${m.bar}`}
                          style={{
                            width: `${(d.avgMood / 5) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
                    {/* Trend Chart */}

          {summary.last30Days?.length > 0 && (

            <div className="2xl:col-span-2 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-sm p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">

              <div className="mb-6">

                <h2 className="text-xl font-bold text-gray-900">
                  30-Day Trend
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Daily mood averages across the organization
                </p>
              </div>

              <div className="overflow-x-auto">

                <div
                  className="flex items-end gap-2 min-w-max pb-2"
                  style={{ height: '250px' }}
                >

                  {summary.last30Days.map((d, i) => {

                    const m = meta(d.avgMood)

                    const lbl = new Date(
                      d.date + 'T00:00:00'
                    ).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })

                    return (

                      <div
                        key={i}
                        className="flex flex-col items-center justify-end gap-2"
                        style={{ minWidth: '42px' }}
                      >

                        <span className="text-[10px] font-semibold text-gray-500">

                          {d.avgMood.toFixed(1)}

                        </span>

                        <div
                          title={`${lbl}: ${d.avgMood}`}
                          className={`w-7 rounded-t-xl transition-all duration-700 hover:scale-105 ${m.bar}`}
                          style={{
                            height: `${Math.max(
                              (Number(d.avgMood) / 5) * 180,
                              12
                            )}px`,
                          }}
                        />

                        <span className="text-[10px] text-gray-400 text-center leading-tight">

                          {lbl}

                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Employee Voice Filters */}

        <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-sm p-6 hover:shadow-lg transition-all duration-300">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <h2 className="text-xl font-bold text-gray-900">
                AI Analysis Filters
              </h2>

              <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-xl">

                Filter anonymous employee comments and
                AI-generated insights using department
                and date range.

              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto">

              <div>

                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">

                  From Date

                </label>

                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) =>
                    setFromDate(e.target.value)
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>

                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">

                  To Date

                </label>

                <input
                  type="date"
                  value={toDate}
                  onChange={(e) =>
                    setToDate(e.target.value)
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>

                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">

                  Department

                </label>

                <select
                  value={department}
                  onChange={(e) =>
                    setDepartment(e.target.value)
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                >

                  <option value="All">
                    All Departments
                  </option>

                  {summary.departmentBreakdown?.map(
                    (dept) => (
                      <option
                        key={dept.department}
                        value={dept.department}
                      >
                        {dept.department}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Voice Section */}

        <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300">

          <div className="border-b border-gray-100 px-6 py-5 bg-gray-50/70">

            <h2 className="text-xl font-bold text-gray-900">

              Employee Voice AI Analysis

            </h2>

            <p className="text-sm text-gray-500 mt-1">

              AI-generated insights from anonymous
              employee comments.

            </p>
          </div>

          <div className="p-6">

            <EmployeeVoiceCard
              dateFrom={fromDate}
              dateTo={toDate}
              department={
                department === 'All'
                  ? null
                  : department
              }
            />
          </div>
        </div>

        {/* Anonymous Comments */}

        {summary.anonymousComments?.length > 0 ? (

          <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-sm p-6 hover:shadow-lg transition-all duration-300">

            <div className="mb-6">

              <h2 className="text-xl font-bold text-gray-900">

                Anonymous Comments

              </h2>

              <p className="text-sm text-gray-500 mt-1">

                No names or identities are stored
                with comments.

              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {summary.anonymousComments.map((c, i) => (

                <div
                  key={i}
                  className="relative rounded-2xl border border-gray-100 bg-gray-50 p-5 hover:shadow-sm hover:border-blue-100 transition-all duration-300"
                >

                  <div className="absolute top-4 left-4 text-4xl text-gray-200 font-serif leading-none">

                    “

                  </div>

                  <p className="relative text-sm text-gray-700 italic leading-relaxed pl-5 pr-2">

                    {c}

                  </p>
                </div>
              ))}
            </div>
          </div>

        ) : (

          <div className="rounded-3xl border border-dashed border-gray-200 p-10 text-center bg-white/70 backdrop-blur-xl">

            <div className="text-5xl mb-4">
              💬
            </div>

            <p className="text-gray-500 text-sm">

              No anonymous comments submitted yet.

            </p>
          </div>
        )}
      </div>
    </div>
  )
}
