import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { teamApi, userApi } from '../api'
import toast from 'react-hot-toast'

export default function TeamsListPage() {
  const [teams, setTeams]   = useState([])
  const [users, setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm]     = useState({ name: '', description: '', memberIds: [] })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([teamApi.getMyTeams(), userApi.getAll()])
      .then(([t, u]) => { setTeams(t); setUsers(u) })
      .catch(() => toast.error('Failed to load teams'))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      const team = await teamApi.createTeam(form)
      setTeams(prev => [team, ...prev])
      setShowCreate(false)
      setForm({ name: '', description: '', memberIds: [] })
      toast.success('Team created!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create team')
    } finally {
      setSaving(false)
    }
  }

  const toggleMember = (id) => {
    setForm(f => ({
      ...f,
      memberIds: f.memberIds.includes(id)
        ? f.memberIds.filter(m => m !== id)
        : [...f.memberIds, id]
    }))
  }

  if (loading) return <div className="p-6 text-gray-400 text-sm">Loading teams…</div>

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Teams</h1>
          <p className="text-sm text-gray-400 mt-0.5">See your collaborators' daily presence</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          + New Team
        </button>
      </div>

      {/* Create team modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Create a Team</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label">Team name</label>
                <input
                  className="input"
                  placeholder="e.g. Backend Squad"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="label">Description (optional)</label>
                <input
                  className="input"
                  placeholder="What does this team work on?"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Add members</label>
                <div className="max-h-40 overflow-y-auto space-y-1 border border-gray-100 rounded-lg p-2">
                  {users.map(u => (
                    <label key={u.id} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.memberIds.includes(u.id)}
                        onChange={() => toggleMember(u.id)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">{u.fullName}</span>
                      <span className="text-xs text-gray-400 ml-auto">{u.department}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="btn-primary flex-1" disabled={saving}>
                  {saving ? 'Creating…' : 'Create Team'}
                </button>
                <button
                  type="button"
                  className="btn-secondary flex-1"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teams grid */}
      {teams.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-gray-400 text-sm">No teams yet. Create one to track your teammates.</p>
          <button className="btn-primary mt-4" onClick={() => setShowCreate(true)}>
            Create your first team
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {teams.map(team => (
            <Link
              key={team.id}
              to={`/teams/${team.id}`}
              className="card p-4 hover:border-brand-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{team.name}</h3>
                  {team.description && (
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{team.description}</p>
                  )}
                </div>
                <span className="text-xs bg-brand-50 text-brand-600 px-2 py-1 rounded-full font-medium ml-2 shrink-0">
                  {team.memberCount} {team.memberCount === 1 ? 'member' : 'members'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-3">Created by {team.createdBy?.fullName}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
