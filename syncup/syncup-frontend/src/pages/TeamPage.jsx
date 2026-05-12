import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { teamApi, statusApi, userApi } from '../api'
import StatusBadge from '../components/status/StatusBadge'
import { useStatusWebSocket } from '../hooks/useStatusWebSocket'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

function MemberRow({ member, liveStatus }) {
  const status = liveStatus || member.status
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 text-sm font-semibold flex items-center justify-center shrink-0">
        {member.user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
      </div>

      {/* Name + dept */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{member.user.fullName}</p>
        <p className="text-xs text-gray-400">{member.user.department || '—'}</p>
      </div>

      {/* Status */}
      <div className="flex flex-col items-end gap-1">
        <StatusBadge status={status} />
        {member.note && (
          <p className="text-[10px] text-gray-400 max-w-[140px] text-right truncate" title={member.note}>
            {member.note}
          </p>
        )}
        {member.officeLocation && (
          <p className="text-[10px] text-gray-400">📍 {member.officeLocation.name}</p>
        )}
      </div>
    </div>
  )
}

export default function TeamPage() {
  const { id }        = useParams()
  const { user }      = useAuth()
  const navigate      = useNavigate()
  const [team, setTeam]       = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [liveStatuses, setLiveStatuses] = useState({}) // userId -> status
  const [showAddMember, setShowAddMember] = useState(false)
  const [allUsers, setAllUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState('')

  useEffect(() => {
    Promise.all([
      teamApi.getTeam(id),
      statusApi.getTeamDashboard(id),
    ])
      .then(([t, m]) => { setTeam(t); setMembers(m) })
      .catch(() => toast.error('Failed to load team'))
      .finally(() => setLoading(false))
  }, [id])

  // Live WS updates
  const onStatusUpdate = useCallback((update) => {
    setLiveStatuses(prev => ({ ...prev, [update.user.id]: update.status }))
  }, [])
  useStatusWebSocket(onStatusUpdate)

  const handleAddMember = async () => {
    if (!selectedUser) return
    try {
      await teamApi.addMember(id, { userId: selectedUser })
      const refreshed = await statusApi.getTeamDashboard(id)
      setMembers(refreshed)
      setShowAddMember(false)
      setSelectedUser('')
      toast.success('Member added!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member')
    }
  }

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the team?')) return
    try {
      await teamApi.removeMember(id, userId)
      setMembers(prev => prev.filter(m => m.user.id !== userId))
      toast.success('Member removed')
    } catch {
      toast.error('Failed to remove member')
    }
  }

  const handleDeleteTeam = async () => {
    if (!window.confirm(`Delete team "${team?.name}"? This cannot be undone.`)) return
    try {
      await teamApi.deleteTeam(id)
      toast.success('Team deleted')
      navigate('/teams')
    } catch {
      toast.error('Failed to delete team')
    }
  }

  const loadAllUsers = async () => {
    if (allUsers.length === 0) {
      const users = await userApi.getAll()
      setAllUsers(users)
    }
    setShowAddMember(true)
  }

  // Summary counts using live data
  const summarize = () => {
    const counts = { IN_OFFICE: 0, REMOTE: 0, ON_LEAVE: 0, UNDECIDED: 0, null: 0 }
    members.forEach(m => {
      const s = liveStatuses[m.user.id] || m.status || null
      counts[s] = (counts[s] || 0) + 1
    })
    return counts
  }
  const counts = summarize()

  if (loading) return <div className="p-6 text-gray-400 text-sm">Loading team…</div>
  if (!team)   return <div className="p-6 text-gray-400 text-sm">Team not found.</div>

  const isCreator = team.createdBy?.id === user?.id

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Back */}
      <Link to="/teams" className="text-sm text-gray-400 hover:text-gray-600 mb-4 inline-block">
        ← Back to teams
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{team.name}</h1>
          {team.description && <p className="text-sm text-gray-400 mt-0.5">{team.description}</p>}
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-sm" onClick={loadAllUsers}>
            + Add Member
          </button>
          {isCreator && (
            <button
              className="text-sm px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 border border-red-100 transition-colors"
              onClick={handleDeleteTeam}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Today's summary pills */}
      <div className="flex gap-2 flex-wrap mb-5">
        {[
          { key: 'IN_OFFICE', label: '🏢 In Office', color: 'bg-emerald-50 text-emerald-700' },
          { key: 'REMOTE',    label: '🏠 Remote',    color: 'bg-blue-50 text-blue-700' },
          { key: 'ON_LEAVE',  label: '🌴 On Leave',  color: 'bg-amber-50 text-amber-700' },
          { key: null,        label: '❓ Not set',   color: 'bg-gray-50 text-gray-500' },
        ].map(s => (
          <span key={s.key} className={`px-3 py-1 rounded-full text-xs font-medium ${s.color}`}>
            {s.label} · {counts[s.key] || 0}
          </span>
        ))}
      </div>

      {/* Members list */}
      <div className="card p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">
          {members.length} {members.length === 1 ? 'Member' : 'Members'} — Today
        </h2>
        {members.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No members yet.</p>
        ) : (
          members.map(member => (
            <div key={member.user.id} className="group relative">
              <MemberRow
                member={member}
                liveStatus={liveStatuses[member.user.id]}
              />
              {isCreator && member.user.id !== user?.id && (
                <button
                  onClick={() => handleRemoveMember(member.user.id)}
                  className="absolute right-0 top-3 hidden group-hover:block text-xs text-red-400 hover:text-red-600 px-2 py-1"
                >
                  Remove
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add member modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Add a Member</h2>
            <select
              className="input mb-4"
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
            >
              <option value="">Select a person…</option>
              {allUsers
                .filter(u => !members.find(m => m.user.id === u.id))
                .map(u => (
                  <option key={u.id} value={u.id}>{u.fullName} — {u.department}</option>
                ))
              }
            </select>
            <div className="flex gap-2">
              <button className="btn-primary flex-1" onClick={handleAddMember} disabled={!selectedUser}>
                Add
              </button>
              <button className="btn-secondary flex-1" onClick={() => setShowAddMember(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
