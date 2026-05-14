import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage           from './pages/LoginPage'
import RegisterPage        from './pages/RegisterPage'
import DashboardPage       from './pages/DashboardPage'
import TeamPage            from './pages/TeamPage'
import TeamsListPage       from './pages/TeamsListPage'
import AnalyticsPage       from './pages/AnalyticsPage'
import LocationPage        from './pages/LocationPage'
import VibeDashboardPage   from './pages/VibeDashboardPage'
import IdeasPage           from './pages/IdeasPage'
import Layout              from './components/common/Layout'
import AdminLayout         from './pages/admin/AdminLayout'
import AdminOverviewPage   from './pages/admin/AdminOverviewPage'
import AdminVibePage       from './pages/admin/AdminVibePage'
import AdminIdeasPage      from './pages/admin/AdminIdeasPage'
import AdminLocationsPage  from './pages/admin/AdminLocationsPage'
import AdminEmployeesPage  from './pages/admin/AdminEmployeesPage'

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Main employee app */}
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index               element={<DashboardPage />} />
          <Route path="teams"        element={<TeamsListPage />} />
          <Route path="teams/:id"    element={<TeamPage />} />
          <Route path="analytics"    element={<AnalyticsPage />} />
          <Route path="locations"    element={<LocationPage />} />
          <Route path="vibes"        element={<VibeDashboardPage />} />
          <Route path="ideas"        element={<IdeasPage />} />
        </Route>

        {/* Admin section */}
        <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
          <Route index               element={<AdminOverviewPage />} />
          <Route path="vibe"         element={<AdminVibePage />} />
          <Route path="ideas"        element={<AdminIdeasPage />} />
          <Route path="locations"    element={<AdminLocationsPage />} />
          <Route path="employees"    element={<AdminEmployeesPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
