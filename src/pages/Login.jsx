import { useState } from 'react'
import { Lock, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

const inputCls = "w-full bg-med-elevated border border-med-border rounded-2xl pl-11 pr-4 py-4 text-med-text text-lg focus:outline-none focus:border-med-primary focus:shadow-blue-glow transition-all placeholder:text-med-faint"

function FieldIcon({ icon: Icon }) {
  return <Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-med-faint"/>
}

export default function Login() {
  const [view, setView]         = useState('login') // 'login' | 'forgot'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [msg, setMsg]           = useState('')
  const [loading, setLoading]   = useState(false)

  function goTo(v) { setView(v); setError(''); setMsg('') }

  async function handleLogin(e) {
    e.preventDefault(); setError(''); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Email ou senha incorretos.')
    setLoading(false)
  }

  async function handleForgot(e) {
    e.preventDefault(); setError(''); setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-senha',
    })
    if (error) setError('Erro: ' + error.message)
    else setMsg('Link enviado! Verifique seu email.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-med-bg">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl shadow-card mb-4 overflow-hidden mx-auto">
            <img src="/icon2.png" alt="Adesivo em Dia" className="w-full h-full object-cover"/>
          </div>
          <h1 className="text-3xl font-black text-med-text tracking-tight">Adesivo em Dia</h1>
          <p className="text-med-muted text-base mt-1">Controle de Rivastigmina</p>
        </div>

        <div className="bg-med-surface rounded-3xl p-6 shadow-card2 border border-med-border space-y-4">

          {/* ── LOGIN ── */}
          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-med-muted text-sm font-semibold uppercase tracking-widest mb-2">Email</label>
                <div className="relative">
                  <FieldIcon icon={Mail}/>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    className={inputCls} placeholder="seu@email.com"/>
                </div>
              </div>
              <div>
                <label className="block text-med-muted text-sm font-semibold uppercase tracking-widest mb-2">Senha</label>
                <div className="relative">
                  <FieldIcon icon={Lock}/>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                    className={inputCls} placeholder="••••••••"/>
                </div>
              </div>
              <div className="flex justify-end -mt-2">
                <button type="button" onClick={() => goTo('forgot')}
                  className="text-med-primary text-sm font-semibold hover:underline">
                  Esqueci minha senha
                </button>
              </div>
              {error && <p className="bg-red-50 border border-red-200 rounded-2xl p-3 text-red-600 text-sm text-center font-medium">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full bg-med-primary hover:bg-med-primary-hover disabled:bg-med-faint text-white font-bold text-xl py-5 rounded-2xl transition-all shadow-card active:scale-[0.98]">
                {loading
                  ? <span className="flex items-center justify-center gap-3"><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>Entrando...</span>
                  : 'Entrar'}
              </button>
            </form>
          )}

          {/* ── ESQUECI A SENHA ── */}
          {view === 'forgot' && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <button onClick={() => goTo('login')} className="p-1 rounded-xl hover:bg-med-elevated transition-colors">
                  <ArrowLeft size={18} className="text-med-muted"/>
                </button>
                <h2 className="text-lg font-bold text-med-text">Recuperar senha</h2>
              </div>
              {msg ? (
                <div className="text-center py-4 space-y-3">
                  <CheckCircle size={48} className="mx-auto text-med-success"/>
                  <p className="text-med-text font-semibold">{msg}</p>
                  <p className="text-med-muted text-sm">Clique no link do email para criar uma nova senha.</p>
                  <button onClick={() => goTo('login')} className="text-med-primary text-sm font-bold hover:underline">
                    Voltar ao login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgot} className="space-y-4">
                  <p className="text-med-muted text-sm">Digite seu email e enviaremos um link para criar uma nova senha.</p>
                  <div>
                    <label className="block text-med-muted text-sm font-semibold uppercase tracking-widest mb-2">Email</label>
                    <div className="relative">
                      <FieldIcon icon={Mail}/>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                        className={inputCls} placeholder="seu@email.com"/>
                    </div>
                  </div>
                  {error && <p className="bg-red-50 border border-red-200 rounded-2xl p-3 text-red-600 text-sm text-center font-medium">{error}</p>}
                  <button type="submit" disabled={loading}
                    className="w-full bg-med-primary hover:bg-med-primary-hover disabled:bg-med-faint text-white font-bold text-xl py-5 rounded-2xl transition-all shadow-card active:scale-[0.98]">
                    {loading
                      ? <span className="flex items-center justify-center gap-3"><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>Enviando...</span>
                      : 'Enviar link'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
