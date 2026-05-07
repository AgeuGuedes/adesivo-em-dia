import { useState, useEffect } from 'react'
import { Lock, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

const inputCls = "w-full bg-med-elevated border border-med-border rounded-2xl pl-11 pr-4 py-4 text-med-text text-lg focus:outline-none focus:border-med-primary focus:shadow-blue-glow transition-all placeholder:text-med-faint"

export default function ResetPassword() {
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [done, setDone]           = useState(false)
  const [ready, setReady]         = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Supabase detecta o token na URL e dispara PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    // Também verifica se já tem sessão ativa (usuário já autenticado via link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleReset(e) {
    e.preventDefault(); setError('')
    if (password !== confirm) { setError('As senhas não coincidem.'); return }
    if (password.length < 6)  { setError('Mínimo 6 caracteres.'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError('Erro: ' + error.message); setLoading(false); return }
    setDone(true)
    setTimeout(() => { supabase.auth.signOut(); navigate('/login') }, 2500)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-med-bg">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl shadow-card mb-4 overflow-hidden mx-auto">
            <img src="/icon2.png" alt="Adesivo em Dia" className="w-full h-full object-cover"/>
          </div>
          <h1 className="text-3xl font-black text-med-text tracking-tight">Adesivo em Dia</h1>
        </div>

        <div className="bg-med-surface rounded-3xl p-6 shadow-card2 border border-med-border">
          {done ? (
            <div className="text-center py-4 space-y-3">
              <CheckCircle size={48} className="mx-auto text-med-success"/>
              <p className="text-med-text font-bold text-lg">Senha alterada!</p>
              <p className="text-med-muted text-sm">Redirecionando para o login...</p>
            </div>
          ) : !ready ? (
            <div className="text-center py-6">
              <div className="w-8 h-8 rounded-full border-2 border-med-primary border-t-transparent animate-spin mx-auto mb-3"/>
              <p className="text-med-muted">Validando link...</p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-med-text text-center mb-4">Nova senha</h2>
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-med-muted text-sm font-semibold uppercase tracking-widest mb-2">Nova senha</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-med-faint"/>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                      className={inputCls} placeholder="Mínimo 6 caracteres"/>
                  </div>
                </div>
                <div>
                  <label className="block text-med-muted text-sm font-semibold uppercase tracking-widest mb-2">Confirmar senha</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-med-faint"/>
                    <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
                      className={inputCls} placeholder="Repita a senha"/>
                  </div>
                </div>
                {error && <p className="bg-red-50 border border-red-200 rounded-2xl p-3 text-red-600 text-sm text-center font-medium">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full bg-med-primary hover:bg-med-primary-hover disabled:bg-med-faint text-white font-bold text-xl py-5 rounded-2xl transition-all shadow-card active:scale-[0.98]">
                  {loading
                    ? <span className="flex items-center justify-center gap-3"><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>Salvando...</span>
                    : 'Salvar nova senha'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
