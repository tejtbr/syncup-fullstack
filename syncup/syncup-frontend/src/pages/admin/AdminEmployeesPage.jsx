import { useState, useEffect } from 'react'
import { adminApi } from '../../api'
import toast from 'react-hot-toast'

const DEPT_COLORS = {
  Engineering: 'bg-blue-100 text-blue-700',
  Product:     'bg-violet-100 text-violet-700',
  Design:      'bg-pink-100 text-pink-700',
  Finance:     'bg-amber-100 text-amber-700',
  HR:          'bg-emerald-100 text-emerald-700',
  Marketing:   'bg-orange-100 text-orange-700',
  Operations:  'bg-cyan-100 text-cyan-700',
  Sales:       'bg-indigo-100 text-indigo-700',
}

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [filterDept, setFilterDept] = useState('All')

  useEffect(() => {
    adminApi.getEmployees()
      .then(data => setEmployees(data || []))
      .catch(() => toast.error('Failed to load employees'))
      .finally(() => setLoading(false))
  }, [])

  const depts = ['All', ...new Set(employees.map(e => e.department).filter(Boolean))]

  const filtered = employees.filter(e => {
    const matchSearch = !search ||
      e.fullName.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase())
    const matchDept = filterDept === 'All' || e.department === filterDept
    return matchSearch && matchDept
  })

  const initials = name => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const avatarColor = name => {
    const colors = ['bg-blue-500','bg-violet-500','bg-emerald-500','bg-amber-500','bg-rose-500','bg-cyan-500']
    return colors[name.charCodeAt(0) % colors.length]
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Employees</h1>
        <p className="text-sm text-gray-400 mt-0.5">{employees.length} total employees across all departments</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          className="input text-sm w-64"
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="input text-sm w-44"
          value={filterDept}
          onChange={e => setFilterDept(e.target.value)}
        >
          {depts.map(d => <option key={d}>{d}</option>)}
        </select>
        <span className="text-xs text-gray-400 self-center">{filtered.length} results</span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Department</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${avatarColor(emp.fullName)} text-white text-xs font-bold flex items-center justify-center`}>
                        {initials(emp.fullName)}
                      </div>
                      <span className="font-medium text-gray-800">{emp.fullName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{emp.email}</td>
                  <td className="px-4 py-3">
                    {emp.department ? (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${DEPT_COLORS[emp.department] || 'bg-gray-100 text-gray-600'}`}>
                        {emp.department}
                      </span>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${emp.role === 'ADMIN' ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-500'}`}>
                      {emp.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">No employees match your search.</p>
          )}
        </div>
      )}
    </div>
  )
}
