import { useEffect, useState } from 'react'
import { vibeApiCalls } from '../../api'
import toast from 'react-hot-toast'

const formatDate = (value) => value ? new Date(value).toLocaleString('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
}) : '-'

export default function MoodCommentsCard() {
  const today = new Date().toISOString().slice(0, 10)
  const weekAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const [fromDate, setFromDate] = useState(weekAgo)
  const [toDate, setToDate] = useState(today)
  const [department, setDepartment] = useState('')
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await vibeApiCalls.getMoodComments(fromDate, toDate, department || undefined)
        setComments(data || [])
      } catch (error) {
        console.error('Failed to load mood comments', error)
        toast.error('Unable to load mood entries from the database')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [fromDate, toDate, department])

  return (
    <div className="card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Employee Voice — Mood Entries</h2>
          <p className="text-xs text-gray-500 mt-1">Showing mood entries from <strong>mood_entries</strong>. Filter by date range and department.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 w-full sm:w-auto">
          <label className="block text-xs text-gray-500">
            From
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
            />
          </label>
          <label className="block text-xs text-gray-500">
            To
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
            />
          </label>
          <label className="block text-xs text-gray-500">
            Department
            <input
              type="text"
              placeholder="e.g. Engineering"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
            />
          </label>
        </div>
      </div>

      <div className="mt-5 text-sm text-gray-500">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 w-full rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
            No mood entries found for the selected range.
          </div>
        ) : (
          <div className="overflow-x-auto mt-2">
            <table className="min-w-full text-left text-sm text-gray-600">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                  <th className="px-3 py-3">Entry Date</th>
                  <th className="px-3 py-3">Department</th>
                  <th className="px-3 py-3">Name</th>
                  <th className="px-3 py-3">Mood</th>
                  <th className="px-3 py-3">Comment</th>
                  <th className="px-3 py-3">Created</th>
                  <th className="px-3 py-3">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {comments.map((entry) => (
                  <tr key={entry.id} className="bg-white">
                    <td className="px-3 py-3 font-medium text-gray-700">{entry.entryDate || '-'}</td>
                    <td className="px-3 py-3">{entry.department || '-'}</td>
                    <td className="px-3 py-3">{entry.fullName || '-'}</td>
                    <td className="px-3 py-3">{entry.moodScore || '-'}</td>
                    <td className="px-3 py-3 max-w-xs whitespace-normal break-words">{entry.comment || '—'}</td>
                    <td className="px-3 py-3">{formatDate(entry.createdAt)}</td>
                    <td className="px-3 py-3">{formatDate(entry.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
