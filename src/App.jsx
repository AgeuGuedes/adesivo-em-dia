import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { Home, Clock, Settings, LogOut, ShieldCheck, AlertCircle } from 'lucide-react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import SettingsPage from './pages/Settings'
import AdminPage from './pages/Admin'
import ResetPassword from './pages/ResetPassword'

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
          <img src="/icon2.png" alt="" className="w-8 h-8 rounded-xl object-cover"/>
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

function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4"
      onClick={onCancel}>
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"/>
      {/* sheet */}
      <div className="relative w-full max-w-sm bg-med-surface rounded-3xl shadow-2xl border border-med-border overflow-hidden animate-[slideUp_0.25s_ease-out]"
        onClick={e => e.stopPropagation()}>
        {/* top accent */}
        <div className="h-1 w-full bg-gradient-to-r from-med-primary/60 via-med-primary to-med-primary/60"/>
        <div className="p-7 text-center space-y-5">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 border border-red-100 mx-auto">
            <LogOut size={30} className="text-med-danger"/>
          </div>
          <div>
            <h3 className="text-xl font-black text-med-text tracking-tight">Tem certeza que quer sair?</h3>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onCancel}
              className="flex-1 py-4 rounded-2xl border-2 border-med-border bg-med-elevated text-med-text font-bold text-base hover:bg-med-surface transition-all active:scale-[0.97]">
              Cancelar
            </button>
            <button onClick={onConfirm}
              className="flex-1 py-4 rounded-2xl bg-med-danger hover:bg-red-600 text-white font-bold text-base transition-all shadow-card active:scale-[0.97]">
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function BottomNav() {
  const { caregiver, signOut } = useAuth()
  const [showLogout, setShowLogout] = useState(false)
  const isAdmin = caregiver?.is_admin === true
  return (
    <>
      {showLogout && (
        <LogoutModal
          onConfirm={() => { setShowLogout(false); signOut() }}
          onCancel={() => setShowLogout(false)}
        />
      )}
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
          <button onClick={() => setShowLogout(true)}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-semibold text-med-faint hover:text-med-danger transition-colors">
            <LogOut size={22} strokeWidth={1.6}/>
            <span>Sair</span>
          </button>
        </div>
      </nav>
    </>
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
      <Route path="/login"        element={user ? <Navigate to="/" replace/> : <Login/>}/>
      <Route path="/reset-senha"  element={<ResetPassword/>}/>
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
