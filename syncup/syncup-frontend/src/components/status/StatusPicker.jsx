import { useState, useEffect } from 'react'
import { statusApi, vibeApiCalls } from '../../api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = [
  { value: 'IN_OFFICE', label: 'In Office',  sublabel: 'At the office',   icon: '🏢',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    activeColor: 'bg-emerald-500 border-emerald-500 text-white' },
  { value: 'REMOTE',    label: 'Remote',     sublabel: 'Working from home', icon: '🏠',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    activeColor: 'bg-blue-500 border-blue-500 text-white' },
  { value: 'ON_LEAVE',  label: 'On Leave',   sublabel: 'Out of office',    icon: '🌴',
    color: 'bg-amber-50 border-amber-200 text-amber-700',
    activeColor: 'bg-amber-500 border-amber-500 text-white' },
  { value: 'UNDECIDED', label: 'Undecided',  sublabel: "Haven't decided",  icon: '🤔',
    color: 'bg-gray-50 border-gray-200 text-gray-600',
    activeColor: 'bg-gray-400 border-gray-400 text-white' },
]

const MOOD_OPTIONS = [
  { score: 5, emoji: '😄', label: 'Thriving' },
  { score: 4, emoji: '🙂', label: 'Good'     },
  { score: 3, emoji: '😐', label: 'Okay'     },
  { score: 2, emoji: '😔', label: 'Low'      },
  { score: 1, emoji: '😞', label: 'Struggling'},
]

export default function StatusPicker({ onStatusSet }) {
  const { user } = useAuth()

  // Status state
  const [current, setCurrent]           = useState(null)
  const [locations, setLocations]       = useState([])
  const [selectedLocation, setSelectedLocation] = useState('')
  const [note, setNote]                 = useState('')
  const [saving, setSaving]             = useState(false)

  // Mood state
  const [selectedMood, setSelectedMood] = useState(null)
  const [moodComment, setMoodComment]   = useState('')
  const [moodSaved, setMoodSaved]       = useState(false)
  const [savingMood, setSavingMood]     = useState(false)

  useEffect(() => {
    Promise.all([
      statusApi.getMyStatus().catch(() => null),
      statusApi.getLocations().catch(() => []),
      user ? vibeApiCalls.getMyMoodToday(user.id).catch(() => null) : null,
    ]).then(([status, locs, mood]) => {
      if (status) {
        setCurrent(status.status)
        setNote(status.note || '')
        setSelectedLocation(status.officeLocation?.id || '')
      }
      setLocations(locs || [])
      if (mood) {
        setSelectedMood(mood.moodScore)
        setMoodComment(mood.comment || '')
        setMoodSaved(true)
      }
    })
  }, [user])

  // ── Status save ──────────────────────────────────────────────────────────
  const handleStatusSelect = async (value) => {
    setSaving(true)
    try {
      const payload = {
        status: value,
        note: note || null,
        officeLocationId: value === 'IN_OFFICE' && selectedLocation ? selectedLocation : null,
      }
      const updated = await statusApi.setStatus(payload)
      setCurrent(value)
      onStatusSet?.(updated)
      toast.success('Status updated!')
    } catch {
      toast.error('Failed to update status')
    } finally {
      setSaving(false)
    }
  }

  // ── Mood save ────────────────────────────────────────────────────────────
  const handleMoodSelect = async (score) => {
    setSelectedMood(score)
    if (!user) return
    setSavingMood(true)
    try {
      await vibeApiCalls.submitMood(user.id, {
        moodScore: score,
        comment: moodComment || null,
        fullName: user.fullName,
        department: user.department,
      })
      setMoodSaved(true)
      toast.success('Mood saved 👍')
    } catch {
      toast.error('Could not save mood')
    } finally {
      setSavingMood(false)
    }
  }

  const handleMoodCommentBlur = async () => {
    if (!selectedMood || !user) return
    try {
      await vibeApiCalls.submitMood(user.id, {
        moodScore: selectedMood,
        comment: moodComment || null,
        fullName: user.fullName,
        department: user.department,
      })
    } catch { /* silent */ }
  }

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  return (
    <div className="space-y-4">

      {/* ── Status Picker ── */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-800">What's your plan today?</h2>
            <p className="text-xs text-gray-400 mt-0.5">{today}</p>
          </div>
          {saving && <span className="text-xs text-brand-500 animate-pulse">Saving…</span>}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {STATUS_OPTIONS.map(opt => {
            const isActive = current === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => handleStatusSelect(opt.value)}
                disabled={saving}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-150
                  ${isActive ? opt.activeColor : opt.color}
                  ${saving ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.03] cursor-pointer'}`}
              >
                <span className="text-xl">{opt.icon}</span>
                <span className="text-sm font-semibold">{opt.label}</span>
                <span className={`text-[10px] ${isActive ? 'opacity-80' : 'opacity-60'}`}>{opt.sublabel}</span>
              </button>
            )
          })}
        </div>

        {/* Office location */}
        {current === 'IN_OFFICE' && locations.length > 0 && (
          <div className="mt-4">
            <label className="label">Which office?</label>
            <select
              className="input"
              value={selectedLocation}
              onChange={e => { setSelectedLocation(e.target.value); handleStatusSelect('IN_OFFICE') }}
            >
              <option value="">Select location</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Status note */}
        <div className="mt-3">
          <input
            className="input text-sm"
            placeholder="Add a work note… (optional)"
            value={note}
            onChange={e => setNote(e.target.value)}
            onBlur={() => current && handleStatusSelect(current)}
            maxLength={200}
          />
        </div>
      </div>

      {/* ── VibeCheck ── */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-gray-800">How are you feeling today?</h2>
            <p className="text-xs text-gray-400 mt-0.5">Anonymous — only you see your history</p>
          </div>
          {moodSaved && selectedMood && (
            <span className="text-xs text-emerald-600 font-medium">✓ Saved</span>
          )}
          {savingMood && (
            <span className="text-xs text-brand-500 animate-pulse">Saving…</span>
          )}
        </div>

        {/* 5 emoji mood buttons */}
        <div className="flex justify-between gap-1">
          {MOOD_OPTIONS.map(opt => (
            <button
              key={opt.score}
              onClick={() => handleMoodSelect(opt.score)}
              className={`flex flex-col items-center gap-1 flex-1 py-2.5 rounded-xl border-2 transition-all
                ${selectedMood === opt.score
                  ? 'border-brand-500 bg-brand-50 scale-105'
                  : 'border-gray-100 bg-white hover:border-brand-200 hover:bg-brand-50'
                }`}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="text-[10px] font-medium text-gray-600">{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Optional mood comment */}
        {selectedMood && (
          <div className="mt-3">
            <input
              className="input text-sm"
              placeholder="Anything on your mind? (optional, stays private)"
              value={moodComment}
              onChange={e => setMoodComment(e.target.value)}
              onBlur={handleMoodCommentBlur}
              maxLength={300}
            />
          </div>
        )}
      </div>

    </div>
  )
}
