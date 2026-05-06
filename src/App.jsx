import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { Home, Clock, Settings, LogOut, ShieldCheck } from 'lucide-react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import SettingsPage from './pages/Settings'
import AdminPage from './pages/Admin'

const NAV_ITEMS = [
  { to: '/',              label: 'Hoje',      Icon: Home     },
  { to: '/historico',     label: 'Histórico', Icon: Clock    },
  { to: '/configuracoes', label: 'Config',    Icon: Settings },
]

function TopBar() {
  const { caregiver } = useAuth()
  return (
    <header className="bg-med-surface border-b border-med-border px-5 py-3 shadow-card">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl leading-none">🩹</span>
          <span className="text-med-text font-bold text-lg tracking-tight">Adesivo em Dia</span>
        </div>
        {caregiver && (
          <div className="text-right">
            <p className="text-med-faint text-xs">Olá,</p>
            <p className="text-med-muted text-sm font-semibold leading-tight">{caregiver.name}</p>
          </div>
        )}
      </div>
    </header>
  )
}

function BottomNav() {
  const { caregiver, signOut } = useAuth()
  const isAdmin = caregiver?.is_admin === true
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-med-surface border-t border-med-border shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
      <div className="max-w-lg mx-auto flex items-stretch">
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-semibold transition-colors ${
                isActive ? 'text-med-primary' : 'text-med-faint'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.6}/>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
        {isAdmin && (
          <NavLink to="/admin"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-semibold transition-colors ${
                isActive ? 'text-amber-600' : 'text-med-faint'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <ShieldCheck size={22} strokeWidth={isActive ? 2.2 : 1.6}/>
                <span>Admin</span>
              </>
            )}
          </NavLink>
        )}
        <button onClick={signOut}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-semibold text-med-faint hover:text-med-danger transition-colors">
          <LogOut size={22} strokeWidth={1.6}/>
          <span>Sair</span>
        </button>
      </div>
    </nav>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-med-bg">
      <div className="w-8 h-8 rounded-full border-2 border-med-primary border-t-transparent animate-spin"/>
    </div>
  )
  if (!user) return <Navigate to="/login" replace/>
  return children
}

function AppRoutes() {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-med-bg">
      <div className="w-8 h-8 rounded-full border-2 border-med-primary border-t-transparent animate-spin"/>
    </div>
  )

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace/> : <Login/>}/>
      <Route path="/*" element={
        <ProtectedRoute>
          <div className="min-h-screen bg-med-bg flex flex-col">
            <TopBar/>
            <main className="flex-1 overflow-y-auto">
              <Routes>
                <Route path="/"               element={<Dashboard/>}/>
                <Route path="/historico"      element={<History/>}/>
                <Route path="/configuracoes"  element={<SettingsPage/>}/>
                <Route path="/admin"          element={<AdminPage/>}/>
              </Routes>
            </main>
            <BottomNav/>
          </div>
        </ProtectedRoute>
      }/>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes/>
      </BrowserRouter>
    </AuthProvider>
  )
}
