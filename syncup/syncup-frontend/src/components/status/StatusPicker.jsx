import { useState, useEffect } from 'react'
import { statusApi } from '../../api'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = [
  {
    value: 'IN_OFFICE',
    label: 'In Office',
    sublabel: 'Working from office today',
    icon: '🏢',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    activeColor: 'bg-emerald-500 border-emerald-500 text-white',
    dot: 'bg-emerald-500',
  },
  {
    value: 'REMOTE',
    label: 'Remote',
    sublabel: 'Working from home',
    icon: '🏠',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    activeColor: 'bg-blue-500 border-blue-500 text-white',
    dot: 'bg-blue-500',
  },
  {
    value: 'ON_LEAVE',
    label: 'On Leave',
    sublabel: 'Out of office today',
    icon: '🌴',
    color: 'bg-amber-50 border-amber-200 text-amber-700',
    activeColor: 'bg-amber-500 border-amber-500 text-white',
    dot: 'bg-amber-500',
  },
  {
    value: 'UNDECIDED',
    label: 'Undecided',
    sublabel: "Haven't decided yet",
    icon: '🤔',
    color: 'bg-gray-50 border-gray-200 text-gray-600',
    activeColor: 'bg-gray-400 border-gray-400 text-white',
    dot: 'bg-gray-400',
  },
]

export default function StatusPicker({ onStatusSet }) {
  const [current, setCurrent]     = useState(null)
  const [locations, setLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState('')
  const [note, setNote]           = useState('')
  const [saving, setSaving]       = useState(false)

  useEffect(() => {
    // Load today's status and available locations
    Promise.all([
      statusApi.getMyStatus().catch(() => null),
      statusApi.getLocations().catch(() => []),
    ]).then(([status, locs]) => {
      if (status) {
        setCurrent(status.status)
        setNote(status.note || '')
        setSelectedLocation(status.officeLocation?.id || '')
      }
      setLocations(locs)
    })
  }, [])

  const handleSelect = async (value) => {
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

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-800">What's your plan today?</h2>
          <p className="text-xs text-gray-400 mt-0.5">{today}</p>
        </div>
        {saving && (
          <span className="text-xs text-brand-500 animate-pulse">Saving…</span>
        )}
      </div>

      {/* 4-button grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STATUS_OPTIONS.map(opt => {
          const isActive = current === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              disabled={saving}
              className={`
                flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-150
                ${isActive ? opt.activeColor : opt.color}
                ${saving ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.03] cursor-pointer'}
              `}
            >
              <span className="text-xl">{opt.icon}</span>
              <span className="text-sm font-semibold leading-tight">{opt.label}</span>
              <span className={`text-[10px] leading-tight text-center ${isActive ? 'opacity-80' : 'opacity-60'}`}>
                {opt.sublabel}
              </span>
            </button>
          )
        })}
      </div>

      {/* Office location picker (only when IN_OFFICE) */}
      {current === 'IN_OFFICE' && locations.length > 0 && (
        <div className="mt-4">
          <label className="label">Which office?</label>
          <select
            className="input"
            value={selectedLocation}
            onChange={e => {
              setSelectedLocation(e.target.value)
              handleSelect('IN_OFFICE')
            }}
          >
            <option value="">Select location</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Optional note */}
      <div className="mt-3">
        <input
          className="input text-sm"
          placeholder="Add a note… (optional)"
          value={note}
          onChange={e => setNote(e.target.value)}
          onBlur={() => current && handleSelect(current)}
          maxLength={200}
        />
      </div>
    </div>
  )
}
