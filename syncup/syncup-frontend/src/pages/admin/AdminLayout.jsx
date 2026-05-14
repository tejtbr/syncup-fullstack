import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const adminNav = [
  { to: '/admin',           label: 'Overview',   icon: '⊞', end: true  },
  { to: '/admin/vibe',      label: 'VibeCheck',  icon: '💚', end: false },
  { to: '/admin/ideas',     label: 'Ideas',      icon: '💡', end: false },
  { to: '/admin/locations', label: 'Locations',  icon: '🏢', end: false },
  { to: '/admin/employees', label: 'Employees',  icon: '👥', end: false },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />

  const initials = user.fullName.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-slate-900 flex flex-col">
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-slate-700">
          <span className="text-lg font-bold text-white">SyncUp</span>
          <span className="ml-2 text-xs bg-brand-600 text-white px-2 py-0.5 rounded-full font-medium">Admin</span>
        </div>

        {/* Back to main app */}
        <div className="px-3 pt-3">
          <NavLink to="/" className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            ← Back to Dashboard
          </NavLink>
        </div>

        <nav className="flex-1 p-3 space-y-1 mt-2">
          {adminNav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-700">
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.fullName}</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="w-full mt-1 text-left px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  )
}
