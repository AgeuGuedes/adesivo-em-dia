import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { User, UserPlus, Trash2, Save, ShieldCheck, RotateCcw, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { POSITION_LABELS, POSITION_DAY } from '../lib/rotation'

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
  const [recentRecords, setRecentRecords]   = useState([])
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
    const [{ data: pat }, { data: cgs }, { data: recs }] = await Promise.all([
      supabase.from('patients').select('*').limit(1).maybeSingle(),
      supabase.from('caregivers').select('*').order('name'),
      supabase.from('applications').select('*, caregivers(name)').order('applied_at', { ascending: false }).limit(10),
    ])
    setPatient(pat)
    setPatientName(pat?.name || '')
    setCaregivers(cgs || [])
    setRecentRecords(recs || [])
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

  async function deleteRecord(id) {
    await supabase.from('applications').delete().eq('id', id)
    await loadData(); notify('Registro removido.')
  }

  async function deleteLastRecord() {
    if (!recentRecords[0]) return notify('Nenhum registro.', true)
    if (!window.confirm('Remover última confirmação?')) return
    await supabase.from('applications').delete().eq('id', recentRecords[0].id)
    await loadData(); notify('Última confirmação removida.')
  }

  async function deleteAllRecords() {
    if (!window.confirm('⚠️ APAGAR TODOS os registros?\n\nO rodízio volta ao dia 1. Só use em testes!')) return
    if (!window.confirm('Tem certeza absoluta?')) return
    await supabase.from('applications').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await loadData(); notify('Todos os registros apagados. Rodízio resetado para o Dia 1.')
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
                  <div>
                    <p className="text-med-text font-semibold text-lg">{cg.name}</p>
                    <p className="text-med-faint text-sm">
                      {(isAdmin || !cg.is_admin) ? cg.email + ' · ' : ''}
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

      {/* Admin Panel */}
      {isAdmin && (
        <Section title="Painel Admin" icon={ShieldCheck} accent="yellow">
          <p className="text-med-muted text-sm mb-4 bg-amber-50 rounded-xl p-3 border border-amber-100">
            Somente você vê esta seção. Use para corrigir registros durante testes.
          </p>
          <div className="space-y-3 mb-5">
            <button onClick={deleteLastRecord}
              className="flex items-center gap-3 w-full bg-med-elevated hover:bg-amber-50 border border-med-border rounded-2xl px-4 py-4 text-med-text font-semibold text-base transition-colors">
              <RotateCcw size={18} className="text-amber-600 shrink-0"/>
              Desfazer última confirmação
            </button>
            <button onClick={deleteAllRecords}
              className="flex items-center gap-3 w-full bg-med-danger-light hover:bg-red-100 border border-red-200 rounded-2xl px-4 py-4 text-med-danger font-semibold text-base transition-colors">
              <AlertTriangle size={18} className="shrink-0"/>
              Apagar TODOS os registros (reset Dia 1)
            </button>
          </div>

          {recentRecords.length > 0 && (
            <div>
              <p className="text-med-muted text-sm font-semibold uppercase tracking-widest mb-3">Últimos registros</p>
              <div className="space-y-2">
                {recentRecords.map((rec, i) => {
                  const d    = new Date(rec.applied_at)
                  const date = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                  const day  = POSITION_DAY[rec.position]
                  return (
                    <div key={rec.id} className="flex items-center justify-between bg-med-elevated rounded-xl px-3 py-2.5 border border-med-border">
                      <div>
                        <span className={`text-sm font-bold ${i === 0 ? 'text-med-primary' : 'text-med-muted'}`}>
                          Dia {day} · {rec.position}
                        </span>
                        <span className="text-med-faint text-xs ml-2">{date} {time} · {rec.caregivers?.name || '?'}</span>
                      </div>
                      <button onClick={() => deleteRecord(rec.id)}
                        className="p-1.5 rounded-lg text-med-faint hover:text-med-danger hover:bg-med-danger-light transition-colors ml-2">
                        <Trash2 size={15}/>
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </Section>
      )}

      <Toast msg={msg}   type="success"/>
      <Toast msg={error} type="error"/>
    </div>
  )
}
