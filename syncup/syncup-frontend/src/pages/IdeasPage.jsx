import { useState, useEffect } from 'react'
import { ideasApi } from '../api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  OPEN:         { label: 'Open',         color: 'bg-blue-50 text-blue-600',    dot: 'bg-blue-500'    },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-amber-50 text-amber-600',  dot: 'bg-amber-500'   },
  IMPLEMENTED:  { label: 'Implemented',  color: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500' },
  DECLINED:     { label: 'Declined',     color: 'bg-gray-100 text-gray-500',   dot: 'bg-gray-400'    },
}

function IdeaCard({ idea, onUpvote, onAdminRespond, onDelete, isAdmin, currentUserId }) {
  const [showRespond, setShowRespond] = useState(false)
  const [respForm, setRespForm]       = useState({ status: idea.status, adminResponse: idea.adminResponse || '' })
  const [saving, setSaving]           = useState(false)
  const sc = STATUS_CONFIG[idea.status] || STATUS_CONFIG.OPEN

  async function handleRespond(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await onAdminRespond(idea.id, respForm)
      setShowRespond(false)
      toast.success('Response saved')
    } catch {
      toast.error('Failed to save response')
    } finally {
      setSaving(false)
    }
  }

  const initials = idea.submittedByName.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()

  return (
    <div className={`card p-5 ${idea.status === 'DECLINED' ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-gray-800 text-sm">{idea.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.color}`}>
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${sc.dot} mr-1`} />
              {sc.label}
            </span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{idea.description}</p>
        </div>

        {/* Upvote */}
        <button
          onClick={() => onUpvote(idea.id)}
          className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border-2 transition-all flex-shrink-0 ${
            idea.upvotedByMe
              ? 'border-brand-500 bg-brand-50 text-brand-600'
              : 'border-gray-100 bg-white text-gray-400 hover:border-brand-200'
          }`}
        >
          <span className="text-base">{idea.upvotedByMe ? '▲' : '△'}</span>
          <span className="text-xs font-bold">{idea.upvoteCount}</span>
        </button>
      </div>

      {/* Submitter + meta */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
        <div className="w-6 h-6 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
          {initials}
        </div>
        <span className="text-xs text-gray-500">{idea.submittedByName}</span>
        {idea.submittedByDept && (
          <span className="text-xs text-gray-400">· {idea.submittedByDept}</span>
        )}
        <span className="text-xs text-gray-300 ml-auto">
          {new Date(idea.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
        </span>
      </div>

      {/* Admin response (if exists) */}
      {idea.adminResponse && (
        <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
          <p className="text-xs font-semibold text-emerald-700 mb-1">
            Admin Response {idea.respondedBy ? `· ${idea.respondedBy}` : ''}
          </p>
          <p className="text-xs text-emerald-700">{idea.adminResponse}</p>
        </div>
      )}

      {/* Admin controls */}
      {isAdmin && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
          <button
            onClick={() => setShowRespond(r => !r)}
            className="text-xs px-3 py-1.5 rounded-lg bg-brand-50 text-brand-600 border border-brand-100 hover:bg-brand-100 transition-colors"
          >
            {showRespond ? 'Cancel' : 'Respond'}
          </button>
          <button
            onClick={() => onDelete(idea.id)}
            className="text-xs px-3 py-1.5 rounded-lg bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-100 transition-colors"
          >
            Delete
          </button>
        </div>
      )}

      {/* Admin respond form */}
      {isAdmin && showRespond && (
        <form onSubmit={handleRespond} className="mt-3 space-y-3 p-3 bg-gray-50 rounded-xl">
          <div>
            <label className="label text-xs">Update Status</label>
            <select
              className="input text-sm"
              value={respForm.status}
              onChange={e => setRespForm(f => ({ ...f, status: e.target.value }))}
            >
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label text-xs">Response Message</label>
            <textarea
              className="input text-sm h-20 resize-none"
              placeholder="Write a response to the employee…"
              value={respForm.adminResponse}
              onChange={e => setRespForm(f => ({ ...f, adminResponse: e.target.value }))}
            />
          </div>
          <button type="submit" className="btn-primary text-sm w-full" disabled={saving}>
            {saving ? 'Saving…' : 'Save Response'}
          </button>
        </form>
      )}
    </div>
  )
}

export default function IdeasPage() {
  const { user } = useAuth()
  const [ideas, setIdeas]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ title: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter]     = useState('ALL')
  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => {
    ideasApi.getAll()
      .then(data => setIdeas(data || []))
      .catch(() => toast.error('Failed to load ideas'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) return
    setSubmitting(true)
    try {
      const idea = await ideasApi.submit(form)
      setIdeas(prev => [idea, ...prev])
      setForm({ title: '', description: '' })
      setShowForm(false)
      toast.success('Idea submitted! 💡')
    } catch {
      toast.error('Failed to submit idea')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpvote(id) {
    try {
      const updated = await ideasApi.upvote(id)
      setIdeas(prev => prev.map(i => i.id === id ? updated : i)
        .sort((a,b) => b.upvoteCount - a.upvoteCount))
    } catch {
      toast.error('Failed to upvote')
    }
  }

  async function handleAdminRespond(id, data) {
    const updated = await ideasApi.adminRespond(id, data)
    setIdeas(prev => prev.map(i => i.id === id ? updated : i))
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this idea?')) return
    try {
      await ideasApi.delete(id)
      setIdeas(prev => prev.filter(i => i.id !== id))
      toast.success('Idea deleted')
    } catch {
      toast.error('Failed to delete idea')
    }
  }

  const filtered = ideas.filter(i => filter === 'ALL' || i.status === filter)
  const counts = ideas.reduce((acc, i) => { acc[i.status] = (acc[i.status]||0)+1; return acc }, {})

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Ideas Board 💡</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Share ideas, upvote what matters, see what gets implemented
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? 'Cancel' : '+ Submit Idea'}
        </button>
      </div>

      {/* Submit form */}
      {showForm && (
        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Your Idea</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="label">Title</label>
              <input className="input" placeholder="Give your idea a clear title"
                value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
                maxLength={150} required />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input h-24 resize-none"
                placeholder="Describe your idea in detail — what is the problem and how does this solve it?"
                value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                maxLength={2000} required />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Idea'}
            </button>
          </form>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[['ALL','All'], ['OPEN','Open'], ['UNDER_REVIEW','Under Review'], ['IMPLEMENTED','Implemented'], ['DECLINED','Declined']].map(([k,l]) => (
          <button key={k}
            onClick={() => setFilter(k)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
              filter === k
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
            }`}
          >
            {l} {k !== 'ALL' && counts[k] ? `(${counts[k]})` : k === 'ALL' ? `(${ideas.length})` : ''}
          </button>
        ))}
      </div>

      {/* Ideas list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-3xl mb-3">💡</p>
          <p className="text-gray-500 font-medium">No ideas yet in this category</p>
          <p className="text-sm text-gray-400 mt-1">Be the first to share an idea with the team!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(idea => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onUpvote={handleUpvote}
              onAdminRespond={handleAdminRespond}
              onDelete={handleDelete}
              isAdmin={isAdmin}
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
