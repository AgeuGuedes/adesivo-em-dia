import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { User, UserPlus, Trash2, Save } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

// Cliente isolado só para criar usuários — não interfere na sessão do admin
const tempSupabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
)

function Section({ title, icon: Icon, accent = 'blue', children }) {
  const border = accent === 'yellow' ? 'border-amber-200'
               : accent === 'red'    ? 'border-red-200'
               : 'border-med-border'
  const iconCl = accent === 'yellow' ? 'text-amber-600'
               : accent === 'red'    ? 'text-med-danger'
               : 'text-med-primary'
  return (
    <div className={`bg-med-surface rounded-3xl p-5 border shadow-card ${border}`}>
      <div className="flex items-center gap-2 mb-5">
        <Icon size={18} className={iconCl}/>
        <h3 className="text-lg font-bold text-med-text">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function Toast({ msg, type }) {
  if (!msg) return null
  const cls = type === 'error'
    ? 'bg-med-danger-light border-red-200 text-med-danger'
    : 'bg-med-success-light border-green-200 text-med-success'
  return <div className={`rounded-2xl border p-4 text-base text-center font-medium ${cls}`}>{msg}</div>
}

export default function Settings() {
  const { caregiver }                       = useAuth()
  const [patient, setPatient]               = useState(null)
  const [patientName, setPatientName]       = useState('')
  const [caregivers, setCaregivers]         = useState([])
  const [newName, setNewName]               = useState('')
  const [newEmail, setNewEmail]             = useState('')
  const [newPassword, setNewPassword]       = useState('')
  const [savingPatient, setSavingPatient]   = useState(false)
  const [addingCg, setAddingCg]             = useState(false)
  const [msg, setMsg]     = useState('')
  const [error, setError] = useState('')

  const isAdmin = caregiver?.is_admin === true

  useEffect(() => { loadData() }, [])

  function notify(text, isErr = false) {
    if (isErr) { setError(text); setMsg('') }
    else       { setMsg(text);   setError('') }
    setTimeout(() => { setMsg(''); setError('') }, 4000)
  }

  async function loadData() {
    const [{ data: pat }, { data: cgs }] = await Promise.all([
      supabase.from('patients').select('*').limit(1).maybeSingle(),
      supabase.from('caregivers').select('*').order('is_admin', { ascending: false }).order('created_at', { ascending: true }),
    ])
    setPatient(pat)
    setPatientName(pat?.name || '')
    setCaregivers(cgs || [])
  }

  async function savePatient(e) {
    e.preventDefault(); setSavingPatient(true)
    if (patient) await supabase.from('patients').update({ name: patientName }).eq('id', patient.id)
    else         await supabase.from('patients').insert({ name: patientName })
    await loadData(); notify('Nome salvo!'); setSavingPatient(false)
  }

  async function addCaregiver(e) {
    e.preventDefault(); setAddingCg(true)

    // Usa cliente isolado para não derrubar sessão do admin
    const { data: sd, error: se } = await tempSupabase.auth.signUp({ email: newEmail, password: newPassword })

    if (se) { notify('Erro: ' + se.message, true); setAddingCg(false); return }
    if (sd?.user) {
      const { error: ce } = await supabase.from('caregivers').insert({ user_id: sd.user.id, name: newName, email: newEmail })
      if (ce) notify('Usuário criado, mas erro ao salvar: ' + ce.message, true)
      else { notify(`${newName} cadastrada!`); setNewName(''); setNewEmail(''); setNewPassword(''); await loadData() }
    }
    setAddingCg(false)
  }

  async function removeCaregiver(id) {
    if (!window.confirm('Remover cuidadora?')) return
    await supabase.from('caregivers').delete().eq('id', id)
    await loadData(); notify('Cuidadora removida.')
  }

  const inputCls = "w-full bg-med-elevated border border-med-border rounded-2xl px-4 py-4 text-med-text text-lg focus:outline-none focus:border-med-primary focus:shadow-blue-glow transition-all placeholder:text-med-faint"

  return (
    <div className="p-5 max-w-lg mx-auto space-y-5 pb-28">
      <h2 className="text-2xl font-bold text-med-text">Configurações</h2>

      {/* Patient */}
      <Section title="Paciente" icon={User}>
        <form onSubmit={savePatient} className="space-y-3">
          <div>
            <label className="block text-med-muted text-sm font-semibold uppercase tracking-widest mb-2">Nome da paciente</label>
            <input type="text" value={patientName} onChange={e => setPatientName(e.target.value)} required
              className={inputCls} placeholder="Ex: Maria da Silva"/>
          </div>
          <button type="submit" disabled={savingPatient}
            className="flex items-center justify-center gap-2 w-full bg-med-primary hover:bg-med-primary-hover disabled:bg-med-faint text-white font-bold text-lg py-4 rounded-2xl transition-all">
            <Save size={18}/>{savingPatient ? 'Salvando...' : 'Salvar nome'}
          </button>
        </form>
      </Section>

      {/* Caregivers */}
      <Section title="Cuidadoras" icon={UserPlus}>
        {caregivers.length === 0
          ? <p className="text-med-faint text-base mb-5 text-center">Nenhuma cuidadora cadastrada.</p>
          : (
            <div className="space-y-2 mb-5">
              {caregivers.map(cg => (
                <div key={cg.id} className="flex items-center justify-between bg-med-elevated rounded-2xl px-4 py-3 border border-med-border">
                  <div className="min-w-0 flex-1">
                    <p className="text-med-text font-semibold text-lg">{cg.name}</p>
                    {(isAdmin || !cg.is_admin) && (
                      <p className="text-med-faint text-sm truncate">{cg.email}</p>
                    )}
                    <p className="text-med-faint text-xs mt-0.5">
                      {cg.is_admin ? 'Administrador' : 'Cuidadora'}
                    </p>
                  </div>
                  {isAdmin && (
                    <button onClick={() => removeCaregiver(cg.id)}
                      className="p-2 rounded-xl text-med-faint hover:text-med-danger hover:bg-med-danger-light transition-colors ml-2">
                      <Trash2 size={18}/>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
        }
        {isAdmin && (
          <div className="border-t border-med-border pt-5">
            <p className="text-med-muted text-sm font-semibold uppercase tracking-widest mb-3">Adicionar cuidadora</p>
            <form onSubmit={addCaregiver} className="space-y-3">
              {[
                { label: 'Nome',          val: newName,     set: setNewName,     type: 'text',     ph: 'Ex: Ana Paula' },
                { label: 'Email',         val: newEmail,    set: setNewEmail,    type: 'email',    ph: 'ana@email.com' },
                { label: 'Senha',         val: newPassword, set: setNewPassword, type: 'password', ph: 'Mínimo 6 caracteres', min: 6 },
              ].map(({ label, val, set, type, ph, min }) => (
                <div key={label}>
                  <label className="block text-med-muted text-sm font-medium mb-1">{label}</label>
                  <input type={type} value={val} onChange={e => set(e.target.value)}
                    required minLength={min}
                    className="w-full bg-med-elevated border border-med-border rounded-2xl px-4 py-3.5 text-med-text text-base focus:outline-none focus:border-med-primary focus:shadow-blue-glow transition-all placeholder:text-med-faint"
                    placeholder={ph}/>
                </div>
              ))}
              <button type="submit" disabled={addingCg}
                className="flex items-center justify-center gap-2 w-full bg-med-success hover:bg-green-700 disabled:bg-med-faint text-white font-bold text-lg py-4 rounded-2xl transition-all">
                <UserPlus size={18}/>{addingCg ? 'Cadastrando...' : 'Cadastrar cuidadora'}
              </button>
            </form>
          </div>
        )}
      </Section>


      <Toast msg={msg}   type="success"/>
      <Toast msg={error} type="error"/>
    </div>
  )
}
