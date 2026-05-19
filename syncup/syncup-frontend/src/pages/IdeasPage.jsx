import { useState, useEffect } from 'react'
import { ideasApi } from '../api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

// ── Constants ────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  OPEN:         { label:'Open',         color:'bg-blue-50 text-blue-600',       dot:'bg-blue-500'    },
  UNDER_REVIEW: { label:'Under Review', color:'bg-amber-50 text-amber-600',     dot:'bg-amber-500'   },
  IMPLEMENTED:  { label:'Implemented',  color:'bg-emerald-50 text-emerald-600', dot:'bg-emerald-500' },
  DECLINED:     { label:'Declined',     color:'bg-gray-100 text-gray-500',      dot:'bg-gray-400'    },
}
const CATEGORIES = ['Process', 'Culture', 'Tech', 'Perks', 'Other']
const AVATAR_COLORS = ['bg-blue-500','bg-violet-500','bg-emerald-500','bg-amber-500','bg-rose-500','bg-cyan-500','bg-indigo-500']
const avatarColor = name => AVATAR_COLORS[(name || 'U').charCodeAt(0) % AVATAR_COLORS.length]
const initials = name => (name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

// ── IdeaCard ─────────────────────────────────────────────────────────────────
function IdeaCard({ idea, onUpvote, onAdminRespond, onDelete, isAdmin }) {
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
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  return (
    <div className={`card p-5 transition-all ${idea.status === 'DECLINED' ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Upvote */}
        <button
          onClick={() => onUpvote(idea.id)}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl border-2 transition-all flex-shrink-0 min-w-[44px] ${
            idea.upvotedByMe
              ? 'border-brand-500 bg-brand-50 text-brand-600'
              : 'border-gray-100 bg-white text-gray-400 hover:border-brand-200 hover:bg-brand-50'
          }`}
        >
          <span className="text-sm leading-none">{idea.upvotedByMe ? '▲' : '△'}</span>
          <span className="text-xs font-bold">{idea.upvoteCount}</span>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <h3 className="font-semibold text-gray-800 text-sm">{idea.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.color}`}>
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${sc.dot} mr-1`} />
              {sc.label}
            </span>
            {idea.category && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{idea.category}</span>
            )}
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{idea.description}</p>
        </div>
      </div>

      {/* Submitter */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
        <div className={`w-6 h-6 rounded-full ${avatarColor(idea.submittedByName)} text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0`}>
          {initials(idea.submittedByName)}
        </div>
        <span className="text-xs text-gray-600 font-medium">{idea.submittedByName}</span>
        {idea.submittedByDept && <span className="text-xs text-gray-400">· {idea.submittedByDept}</span>}
        <span className="text-xs text-gray-300 ml-auto">
          {new Date(idea.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
        </span>
      </div>

      {/* Admin response */}
      {idea.adminResponse && (
        <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
          <p className="text-xs font-semibold text-emerald-700 mb-1">
            Admin Response{idea.respondedBy ? ` · ${idea.respondedBy}` : ''}
          </p>
          <p className="text-xs text-emerald-800">{idea.adminResponse}</p>
        </div>
      )}

      {/* Admin controls */}
      {isAdmin && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
          <button onClick={() => setShowRespond(r => !r)}
            className="text-xs px-3 py-1.5 rounded-lg bg-brand-50 text-brand-600 border border-brand-100 hover:bg-brand-100 transition-colors">
            {showRespond ? 'Cancel' : 'Respond / Update'}
          </button>
          <button onClick={() => onDelete(idea.id)}
            className="text-xs px-3 py-1.5 rounded-lg bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-100 transition-colors">
            Delete
          </button>
        </div>
      )}

      {isAdmin && showRespond && (
        <form onSubmit={handleRespond} className="mt-3 space-y-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <div>
            <label className="label text-xs">Update Status</label>
            <select className="input text-sm" value={respForm.status}
              onChange={e => setRespForm(f => ({ ...f, status: e.target.value }))}>
              {Object.entries(STATUS_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label text-xs">Response (visible to everyone)</label>
            <textarea className="input text-sm resize-none" rows={3}
              placeholder="Write a response…"
              value={respForm.adminResponse}
              onChange={e => setRespForm(f => ({ ...f, adminResponse: e.target.value }))} />
          </div>
          <button type="submit" className="btn-primary text-sm w-full" disabled={saving}>
            {saving ? 'Saving…' : 'Save Response'}
          </button>
        </form>
      )}
    </div>
  )
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
const RANK_CONFIG = {
  1: { bg:'bg-amber-50',  border:'border-amber-300', badge:'bg-amber-400',  text:'text-amber-700', medal:'🥇' },
  2: { bg:'bg-gray-50',   border:'border-gray-300',  badge:'bg-gray-400',   text:'text-gray-600',  medal:'🥈' },
  3: { bg:'bg-orange-50', border:'border-orange-200',badge:'bg-orange-400', text:'text-orange-700',medal:'🥉' },
}

function LeaderboardTab({ data, loading }) {
  if (loading) return (
    <div className="space-y-3 p-6">
      {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
    </div>
  )

  if (!data) return (
    <div className="p-10 text-center text-gray-400 text-sm">Could not load leaderboard.</div>
  )

  const { topContributors, mostUpvoted, recentlyImplemented, totalIdeas, totalImplemented, totalUpvotes } = data

  return (
    <div className="p-5 space-y-6 max-w-3xl mx-auto">

      {/* ── Org stats ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'Total Ideas',     value: totalIdeas,       color:'text-brand-600', bg:'bg-brand-50',    emoji:'💡' },
          { label:'Implemented',     value: totalImplemented, color:'text-emerald-600',bg:'bg-emerald-50', emoji:'✅' },
          { label:'Total Upvotes',   value: totalUpvotes,     color:'text-amber-600',  bg:'bg-amber-50',   emoji:'▲'  },
        ].map(st => (
          <div key={st.label} className={`card p-4 ${st.bg} border-0 text-center`}>
            <p className="text-2xl mb-0.5">{st.emoji}</p>
            <p className={`text-2xl font-bold ${st.color}`}>{st.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{st.label}</p>
          </div>
        ))}
      </div>

      {/* ── Top Contributors ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🏆</span>
          <h2 className="text-base font-bold text-gray-900">Top Idea Contributors</h2>
          <span className="text-xs text-gray-400 ml-1">ranked by implemented ideas</span>
        </div>

        {topContributors.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-2xl mb-2">🌱</p>
            <p className="text-gray-500 font-medium text-sm">No implemented ideas yet</p>
            <p className="text-gray-400 text-xs mt-1">Be the first to have your idea marked as Implemented!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {topContributors.map((c, idx) => {
              const rc = RANK_CONFIG[c.rank] || { bg:'bg-white', border:'border-gray-100', badge:'bg-gray-200', text:'text-gray-500', medal:'' }
              return (
                <div key={c.userId}
                  className={`card p-4 border-2 ${rc.border} ${rc.bg} flex items-center gap-4 transition-all hover:shadow-md`}>

                  {/* Rank badge */}
                  <div className={`w-10 h-10 rounded-full ${rc.badge} text-white font-bold text-sm flex items-center justify-center flex-shrink-0`}>
                    {c.rank <= 3 ? rc.medal : `#${c.rank}`}
                  </div>

                  {/* Avatar + name */}
                  <div className={`w-9 h-9 rounded-full ${avatarColor(c.fullName)} text-white text-xs font-bold flex items-center justify-center flex-shrink-0`}>
                    {initials(c.fullName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{c.fullName}</p>
                    <p className="text-xs text-gray-400">{c.department || '—'}</p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-center">
                      <p className={`text-xl font-bold ${rc.text}`}>{c.implementedCount}</p>
                      <p className="text-[10px] text-gray-400 leading-tight">implemented</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-brand-600">{c.totalUpvotesReceived}</p>
                      <p className="text-[10px] text-gray-400 leading-tight">upvotes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-500">{c.totalIdeasSubmitted}</p>
                      <p className="text-[10px] text-gray-400 leading-tight">submitted</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Two columns: Most Upvoted + Recently Implemented ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

        {/* Most Upvoted */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">🔥</span>
            <h2 className="text-sm font-bold text-gray-900">Most Upvoted</h2>
          </div>
          <div className="space-y-2">
            {mostUpvoted.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No ideas yet</p>
            ) : mostUpvoted.map((idea, i) => {
              const sc = STATUS_CONFIG[idea.status] || STATUS_CONFIG.OPEN
              return (
                <div key={idea.id} className="card p-3 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2">{idea.title}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${sc.color}`}>{sc.label}</span>
                      <span className="text-[10px] text-gray-400">{idea.submittedByName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 text-brand-600 flex-shrink-0">
                    <span className="text-xs font-bold">{idea.upvoteCount}</span>
                    <span className="text-[10px]">▲</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recently Implemented */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">✅</span>
            <h2 className="text-sm font-bold text-gray-900">Recently Implemented</h2>
          </div>
          <div className="space-y-2">
            {recentlyImplemented.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No implemented ideas yet</p>
            ) : recentlyImplemented.map(idea => (
              <div key={idea.id} className="card p-3 border-l-4 border-emerald-500">
                <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2">{idea.title}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className={`w-4 h-4 rounded-full ${avatarColor(idea.submittedByName)} text-white text-[8px] font-bold flex items-center justify-center`}>
                    {(idea.submittedByName || 'U')[0]}
                  </div>
                  <span className="text-[10px] text-gray-500">{idea.submittedByName}</span>
                  <span className="text-[10px] text-gray-300 ml-auto">
                    {new Date(idea.createdAt + 'T00:00:00').toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}

// ── Main IdeasPage ────────────────────────────────────────────────────────────
export default function IdeasPage() {
  const { user }                        = useAuth()
  const [ideas, setIdeas]               = useState([])
  const [leaderboard, setLeaderboard]   = useState(null)
  const [activeTab, setActiveTab]       = useState('board')
  const [loading, setLoading]           = useState(true)
  const [lbLoading, setLbLoading]       = useState(false)
  const [showForm, setShowForm]         = useState(false)
  const [submitting, setSubmitting]     = useState(false)
  const [filter, setFilter]             = useState('ALL')
  const [form, setForm]                 = useState({ title:'', description:'', category:'Other' })
  const isAdmin                         = user?.role === 'ADMIN'

  useEffect(() => {
    ideasApi.getAll()
      .then(data => setIdeas(data || []))
      .catch(() => toast.error('Failed to load ideas'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (activeTab === 'leaderboard' && !leaderboard) {
      setLbLoading(true)
      ideasApi.getLeaderboard()
        .then(setLeaderboard)
        .catch(() => toast.error('Failed to load leaderboard'))
        .finally(() => setLbLoading(false))
    }
  }, [activeTab])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) return
    setSubmitting(true)
    try {
      const idea = await ideasApi.submit(form)
      setIdeas(prev => [idea, ...prev])
      setLeaderboard(null) // invalidate leaderboard cache
      setForm({ title:'', description:'', category:'Other' })
      setShowForm(false)
      toast.success('Idea submitted! 💡')
    } catch { toast.error('Failed to submit') }
    finally { setSubmitting(false) }
  }

  async function handleUpvote(id) {
    try {
      const updated = await ideasApi.upvote(id)
      setIdeas(prev => prev.map(i => i.id === id ? updated : i)
        .sort((a,b) => b.upvoteCount - a.upvoteCount))
      setLeaderboard(null) // invalidate leaderboard cache
    } catch { toast.error('Failed to upvote') }
  }

  async function handleAdminRespond(id, data) {
    const updated = await ideasApi.adminRespond(id, data)
    setIdeas(prev => prev.map(i => i.id === id ? updated : i))
    setLeaderboard(null) // invalidate leaderboard cache
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this idea?')) return
    try {
      await ideasApi.delete(id)
      setIdeas(prev => prev.filter(i => i.id !== id))
      setLeaderboard(null)
      toast.success('Idea deleted')
    } catch { toast.error('Failed to delete') }
  }

  const counts = ideas.reduce((acc, i) => { acc[i.status] = (acc[i.status] || 0) + 1; return acc }, {})
  const filtered = filter === 'ALL' ? ideas : ideas.filter(i => i.status === filter)

  return (
    <div className="max-w-3xl mx-auto">

      {/* Page header */}
      <div className="flex items-center justify-between p-6 pb-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Ideas Board 💡</h1>
          <p className="text-sm text-gray-400 mt-0.5">Share ideas · upvote · see what gets built</p>
        </div>
        {activeTab === 'board' && (
          <button className="btn-primary" onClick={() => setShowForm(s => !s)}>
            {showForm ? 'Cancel' : '+ Share an Idea'}
          </button>
        )}
      </div>

      {/* Main tabs */}
      <div className="flex gap-0 px-6 pt-4 pb-0 border-b border-gray-100">
        {[
          { key:'board',       label:'💡 Ideas Board' },
          { key:'leaderboard', label:'🏆 Leaderboard' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${
              activeTab === tab.key
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── IDEAS BOARD TAB ── */}
      {activeTab === 'board' && (
        <div className="p-6 space-y-5">

          {/* Submit form */}
          {showForm && (
            <div className="card p-5">
              <h2 className="text-base font-semibold text-gray-800 mb-4">Your Idea</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="label">Title</label>
                  <input className="input" placeholder="Give your idea a clear, specific title"
                    value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
                    maxLength={150} required />
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea className="input resize-none" rows={4}
                    placeholder="Describe the problem and how your idea solves it…"
                    value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                    maxLength={2000} required />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select className="input" value={form.category}
                    onChange={e => setForm(f => ({...f, category: e.target.value}))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button type="submit" className="btn-primary w-full" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit Idea'}
                </button>
              </form>
            </div>
          )}

          {/* Filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {[
              ['ALL',          `All (${ideas.length})`],
              ['OPEN',         `Open (${counts.OPEN || 0})`],
              ['UNDER_REVIEW', `Under Review (${counts.UNDER_REVIEW || 0})`],
              ['IMPLEMENTED',  `Implemented (${counts.IMPLEMENTED || 0})`],
              ['DECLINED',     `Declined (${counts.DECLINED || 0})`],
            ].map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
                  filter === k
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
                }`}>
                {l}
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
              <p className="text-gray-500 font-medium">No ideas in this category yet</p>
              <p className="text-sm text-gray-400 mt-1">Be the first to share one with the team!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(idea => (
                <IdeaCard key={idea.id} idea={idea}
                  onUpvote={handleUpvote} onAdminRespond={handleAdminRespond}
                  onDelete={handleDelete} isAdmin={isAdmin} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── LEADERBOARD TAB ── */}
      {activeTab === 'leaderboard' && (
        <LeaderboardTab data={leaderboard} loading={lbLoading} />
      )}

    </div>
  )
}
