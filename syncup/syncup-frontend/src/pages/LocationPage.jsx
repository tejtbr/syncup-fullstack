import { useState, useEffect } from 'react'
import { analyticsApiCalls } from '../api'
import toast from 'react-hot-toast'

function LocationCard({ loc, onExpand, expanded, people, loadingPeople }) {
  const pct = Math.min(Math.round((loc.inOfficeCount / 20) * 100), 100) // assume 20 capacity

  return (
    <div className="card p-5">
      {/* Location header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏢</span>
            <h3 className="font-semibold text-gray-800">{loc.locationName}</h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 ml-7">
            {loc.city}{loc.country ? `, ${loc.country}` : ''}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-600">{loc.inOfficeCount}</p>
          <p className="text-xs text-gray-400">in office</p>
        </div>
      </div>

      {/* Occupancy bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Occupancy</span>
          <span>{pct}% of est. capacity</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              pct >= 80 ? 'bg-rose-500' : pct >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Expand button */}
      <button
        onClick={() => onExpand(loc.locationId)}
        className="w-full text-xs text-brand-600 hover:underline text-left mt-1"
      >
        {expanded ? '▲ Hide people' : `▼ See who's here (${loc.inOfficeCount})`}
      </button>

      {/* People list */}
      {expanded && (
        <div className="mt-3 space-y-1.5 border-t border-gray-50 pt-3">
          {loadingPeople ? (
            <div className="space-y-1.5">
              {[1,2,3].map(i => (
                <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : people.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-2">Nobody listed yet.</p>
          ) : (
            people.map((p, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 px-2 bg-gray-50 rounded-lg">
                <div className="w-7 h-7 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {p.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700">{p.fullName}</p>
                  <p className="text-[10px] text-gray-400">{p.department || '—'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default function LocationPage() {
  const [locations, setLocations]   = useState([])
  const [date, setDate]             = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading]       = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [peopleMap, setPeopleMap]   = useState({})
  const [loadingPeople, setLoadingPeople] = useState(false)

  useEffect(() => {
    loadLocations()
    setExpandedId(null)
    setPeopleMap({})
  }, [date])

  async function loadLocations() {
    setLoading(true)
    try {
      const data = await analyticsApiCalls.getLocationStats(date)
      setLocations(data || [])
    } catch {
      toast.error('Could not load location data.')
    } finally {
      setLoading(false)
    }
  }

  async function handleExpand(locationId) {
    if (expandedId === locationId) {
      setExpandedId(null)
      return
    }
    setExpandedId(locationId)
    if (peopleMap[locationId]) return  // already loaded

    setLoadingPeople(true)
    try {
      const people = await analyticsApiCalls.getPeopleAtLocation(locationId, date)
      setPeopleMap(prev => ({ ...prev, [locationId]: people || [] }))
    } catch {
      toast.error('Could not load people list.')
    } finally {
      setLoadingPeople(false)
    }
  }

  const totalInOffice = locations.reduce((sum, l) => sum + l.inOfficeCount, 0)

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Office Locations</h1>
          <p className="text-sm text-gray-400 mt-0.5">Real-time branch occupancy</p>
        </div>
        <input
          type="date"
          className="input text-sm w-44"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>

      {/* Summary banner */}
      {!loading && locations.length > 0 && (
        <div className="card p-4 bg-emerald-50 border-emerald-100">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏢</span>
            <div>
              <p className="font-semibold text-emerald-800">
                {totalInOffice} {totalInOffice === 1 ? 'person is' : 'people are'} in office today
              </p>
              <p className="text-xs text-emerald-600 mt-0.5">
                across {locations.length} {locations.length === 1 ? 'location' : 'locations'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Location cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : locations.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-3xl mb-3">🏢</p>
          <p className="text-gray-500 font-medium">Nobody is in office on {date}</p>
          <p className="text-sm text-gray-400 mt-1">
            Data appears here as team members set their status to In Office.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {locations.map(loc => (
            <LocationCard
              key={loc.locationId}
              loc={loc}
              onExpand={handleExpand}
              expanded={expandedId === loc.locationId}
              people={peopleMap[loc.locationId] || []}
              loadingPeople={loadingPeople && expandedId === loc.locationId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
