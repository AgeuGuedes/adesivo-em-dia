import { useState } from 'react'
import { Lock, Mail } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) setError('Email ou senha incorretos.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-med-bg">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-med-primary-light border border-blue-200 shadow-card mb-4">
            <span className="text-4xl">🩹</span>
          </div>
          <h1 className="text-3xl font-black text-med-text tracking-tight">Adesivo em Dia</h1>
          <p className="text-med-muted text-base mt-1">Controle de Rivastigmina</p>
        </div>

        {/* Card */}
        <div className="bg-med-surface rounded-3xl p-6 shadow-card2 border border-med-border space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-med-muted text-sm font-semibold uppercase tracking-widest mb-2">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-med-faint"/>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full bg-med-elevated border border-med-border rounded-2xl pl-11 pr-4 py-4 text-med-text text-lg focus:outline-none focus:border-med-primary focus:shadow-blue-glow transition-all placeholder:text-med-faint"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-med-muted text-sm font-semibold uppercase tracking-widest mb-2">Senha</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-med-faint"/>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full bg-med-elevated border border-med-border rounded-2xl pl-11 pr-4 py-4 text-med-text text-lg focus:outline-none focus:border-med-primary focus:shadow-blue-glow transition-all placeholder:text-med-faint"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-med-danger-light border border-red-200 rounded-2xl p-4 text-med-danger text-base text-center font-medium">
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-med-primary hover:bg-med-primary-hover disabled:bg-med-faint text-white font-bold text-xl py-5 rounded-2xl transition-all shadow-card active:scale-[0.98] mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                  Entrando...
                </span>
              ) : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
