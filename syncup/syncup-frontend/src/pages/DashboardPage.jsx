import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import StatusPicker from '../components/status/StatusPicker'
import OrgSummary from '../components/dashboard/OrgSummary'
import { useStatusWebSocket } from '../hooks/useStatusWebSocket'
import StatusBadge from '../components/status/StatusBadge'

export default function DashboardPage() {
  const { user } = useAuth()
  const [liveUpdates, setLiveUpdates] = useState([])

  const onStatusUpdate = useCallback((update) => {
    // Skip own updates
    if (update.user?.id === user?.id) return
    setLiveUpdates(prev => {
      const filtered = prev.filter(u => u.user?.id !== update.user?.id)
      return [update, ...filtered].slice(0, 5)
    })
    // Auto-clear after 8 seconds
    setTimeout(() => {
      setLiveUpdates(prev => prev.filter(u => u.user?.id !== update.user?.id))
    }, 8000)
  }, [user])

  useStatusWebSocket(onStatusUpdate)

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Good {getGreeting()}, {user?.fullName?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Live update toasts (WebSocket) */}
      {liveUpdates.length > 0 && (
        <div className="space-y-2">
          {liveUpdates.map(update => (
            <div
              key={update.user?.id}
              className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-100 rounded-xl shadow-sm text-sm animate-pulse-once"
            >
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping inline-block" />
              <span className="text-gray-700 font-medium">{update.user?.fullName}</span>
              <span className="text-gray-400">just updated their status to</span>
              <StatusBadge status={update.status} />
            </div>
          ))}
        </div>
      )}

      {/* Status picker */}
      <StatusPicker />

      {/* Org summary */}
      <OrgSummary />

      {/* My teams shortcut */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-800">My Teams</h2>
          <Link to="/teams" className="text-sm text-brand-600 hover:underline">
            View all →
          </Link>
        </div>
        <p className="text-sm text-gray-400">
          Go to <Link to="/teams" className="text-brand-600 hover:underline font-medium">My Teams</Link> to see
          your teammates' status, create teams, and manage members.
        </p>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
