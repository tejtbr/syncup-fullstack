import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/',          label: 'Dashboard',  icon: '⊞',  end: true  },
  { to: '/teams',     label: 'My Teams',   icon: '⊕',  end: false },
  { to: '/analytics', label: 'Analytics',  icon: '📊', end: false },
  { to: '/locations', label: 'Locations',  icon: '🏢', end: false },
  { to: '/vibes',     label: 'VibeCheck',  icon: '💚', end: false },
]

function Avatar({ user }) {
  const initials = user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="w-8 h-8 rounded-full bg-brand-500 text-white text-xs font-semibold flex items-center justify-center">
      {initials}
    </div>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col">
        <div className="h-14 flex items-center px-5 border-b border-gray-100">
          <span className="text-lg font-bold text-brand-600">SyncUp</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-2 px-2 py-2">
            <Avatar user={user} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{user.fullName}</p>
              <p className="text-xs text-gray-400 truncate">{user.department || 'No dept'}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="w-full mt-1 text-left px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
