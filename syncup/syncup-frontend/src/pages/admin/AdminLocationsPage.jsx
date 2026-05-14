import { useState, useEffect } from 'react'
import { adminApi } from '../../api'
import toast from 'react-hot-toast'

export default function AdminLocationsPage() {
  const [locations, setLocations]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [editing, setEditing]       = useState(null)
  const [form, setForm]             = useState({ name: '', city: '', country: '' })
  const [saving, setSaving]         = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const data = await adminApi.getLocations()
      setLocations(data || [])
    } catch {
      toast.error('Failed to load locations')
    } finally {
      setLoading(false)
    }
  }

  function openAdd() {
    setEditing(null)
    setForm({ name: '', city: '', country: '' })
    setShowForm(true)
  }

  function openEdit(loc) {
    setEditing(loc)
    setForm({ name: loc.name, city: loc.city || '', country: loc.country || '' })
    setShowForm(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        const updated = await adminApi.updateLocation(editing.id, form)
        setLocations(prev => prev.map(l => l.id === editing.id ? updated : l))
        toast.success('Location updated')
      } else {
        const created = await adminApi.addLocation(form)
        setLocations(prev => [...prev, created])
        toast.success('Location added')
      }
      setShowForm(false)
    } catch {
      toast.error('Failed to save location')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await adminApi.deleteLocation(id)
      setLocations(prev => prev.filter(l => l.id !== id))
      toast.success('Location deleted')
    } catch {
      toast.error('Failed to delete location')
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Office Locations</h1>
          <p className="text-sm text-gray-400 mt-0.5">Add and manage company office locations</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>+ Add Location</button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {editing ? 'Edit Location' : 'Add New Location'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label">Location Name *</label>
                <input className="input" placeholder="e.g. HQ - Bengaluru" required
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="label">City</label>
                <input className="input" placeholder="e.g. Bengaluru"
                  value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
              </div>
              <div>
                <label className="label">Country</label>
                <input className="input" placeholder="e.g. India"
                  value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="btn-primary flex-1" disabled={saving}>
                  {saving ? 'Saving…' : (editing ? 'Update' : 'Add Location')}
                </button>
                <button type="button" className="btn-secondary flex-1" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : locations.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-gray-400">No locations yet. Add your first office location.</p>
          <button className="btn-primary mt-4" onClick={openAdd}>Add Location</button>
        </div>
      ) : (
        <div className="space-y-3">
          {locations.map(loc => (
            <div key={loc.id} className="card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center text-xl flex-shrink-0">
                🏢
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{loc.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {[loc.city, loc.country].filter(Boolean).join(', ') || 'No location details'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(loc)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(loc.id, loc.name)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
