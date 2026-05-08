import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck, RotateCcw, Trash2, AlertTriangle,
  CalendarDays, Users, Edit3, Check, X, ChevronDown, ChevronUp
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { ROTATION_SEQUENCE, POSITION_LABELS, POSITION_DAY, getNextPosition } from '../lib/rotation'

function Card({ title, icon: Icon, accent = 'blue', children }) {
  const border = accent === 'yellow' ? 'border-amber-200 bg-amber-50/30'
               : accent === 'red'    ? 'border-red-200 bg-red-50/30'
               : accent === 'green'  ? 'border-green-200 bg-green-50/30'
               : 'border-med-border bg-med-surface'
  const iconCl = accent === 'yellow' ? 'text-amber-600'
               : accent === 'red'    ? 'text-red-500'
               : accent === 'green'  ? 'text-green-600'
               : 'text-med-primary'
  return (
    <div className={`rounded-3xl p-5 border shadow-card ${border}`}>
      <div className="flex items-center gap-2 mb-4">
        <Icon size={18} className={iconCl}/>
        <h3 className="text-base font-bold text-med-text">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function Toast({ msg, type, onClose }) {
  if (!msg) return null
  const cls = type === 'error'
    ? 'bg-red-50 border-red-200 text-red-700'
    : 'bg-green-50 border-green-200 text-green-700'
  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl border px-5 py-3 shadow-card2 text-sm font-semibold ${cls}`}>
      {msg}
      <button onClick={onClose}><X size={15}/></button>
    </div>
  )
}

function ConfirmModal({ title, description, confirmLabel = 'Confirmar', danger = false, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"/>
      <div className="relative w-full max-w-sm bg-med-surface rounded-3xl shadow-2xl border border-med-border overflow-hidden animate-[slideUp_0.25s_ease-out]"
        onClick={e => e.stopPropagation()}>
        <div className={`h-1 w-full ${danger ? 'bg-red-500' : 'bg-amber-400'}`}/>
        <div className="p-7 text-center space-y-4">
          <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mx-auto ${danger ? 'bg-red-50 border border-red-100' : 'bg-amber-50 border border-amber-100'}`}>
            <AlertTriangle size={26} className={danger ? 'text-red-500' : 'text-amber-500'}/>
          </div>
          <div>
            <h3 className="text-lg font-black text-med-text">{title}</h3>
            {description && <p className="text-med-muted text-sm mt-1.5 leading-relaxed">{description}</p>}
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onCancel}
              className="flex-1 py-4 rounded-2xl border-2 border-med-border bg-med-elevated text-med-text font-bold text-base transition-all active:scale-[0.97]">
              Cancelar
            </button>
            <button onClick={onConfirm}
              className={`flex-1 py-4 rounded-2xl text-white font-bold text-base transition-all shadow-card active:scale-[0.97] ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'}`}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Admin() {
  const { caregiver } = useAuth()
  const navigate      = useNavigate()

  const [patient, setPatient]       = useState(null)
  const [records, setRecords]       = useState([])
  const [stats, setStats]           = useState([])
  const [nextPos, setNextPos]       = useState(null)
  const [forcedDay, setForcedDay]   = useState('')
  const [editingId, setEditingId]   = useState(null)
  const [editObs, setEditObs]       = useState('')
  const [loading, setLoading]       = useState(true)
  const [toast, setToast]           = useState({ msg: '', type: 'success' })
  const [showAll, setShowAll]       = useState(false)
  const [modal, setModal]           = useState(null) // { type, id? }

  const isAdmin = caregiver?.is_admin === true
  const HISTORY_LIMIT = 10

  useEffect(() => {
    if (!isAdmin) { navigate('/'); return }
    loadAll()
  }, [isAdmin])

  function notify(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3500)
  }

  async function loadAll() {
    setLoading(true)
    const [{ data: pat }, { data: last }, { data: allRecs }, { data: cgs }] = await Promise.all([
      supabase.from('patients').select('*').limit(1).maybeSingle(),
      supabase.from('applications').select('position').order('applied_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('applications').select('*, caregivers(name)').order('applied_at', { ascending: false }).limit(50),
      supabase.from('caregivers').select('id, name'),
    ])
    setPatient(pat)
    setNextPos(getNextPosition(last?.position))
    setRecords(allRecs || [])
    if (allRecs && cgs) {
      const counts = {}
      allRecs.forEach(r => {
        const name = r.caregivers?.name || 'Sistema'
        counts[name] = (counts[name] || 0) + 1
      })
      setStats(Object.entries(counts).sort((a, b) => b[1] - a[1]))
    }
    setLoading(false)
  }

  async function forceNextDay() {
    if (!forcedDay) return
    const desiredPos = ROTATION_SEQUENCE[Number(forcedDay) - 1]
    const prevIdx    = (ROTATION_SEQUENCE.indexOf(desiredPos) - 1 + 12) % 12
    const prevPos    = ROTATION_SEQUENCE[prevIdx]
    const { error } = await supabase.from('applications').insert({
      patient_id:   patient?.id,
      caregiver_id: caregiver?.id,
      position:     prevPos,
      observations: '⚙️ Ajuste de rodízio pelo administrador',
      applied_at:   new Date().toISOString(),
    })
    if (error) return notify('Erro ao ajustar rodízio: ' + error.message, 'error')
    setForcedDay('')
    await loadAll()
    notify(`Rodízio ajustado! Próximo: Dia ${forcedDay} (${desiredPos})`)
  }

  async function deleteRecord(id) {
    const { error } = await supabase.from('applications').delete().eq('id', id)
    if (error) return notify('Erro ao remover: ' + error.message, 'error')
    await loadAll()
    notify('Registro removido.')
  }

  async function deleteAll() {
    const { error } = await supabase.from('applications').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (error) return notify('Erro ao apagar: ' + error.message, 'error')
    await loadAll()
    notify('Histórico apagado. Rodízio resetado para Dia 1.')
  }

  async function deleteLast() {
    if (!records[0]) return notify('Nenhum registro.', 'error')
    const { error } = await supabase.from('applications').delete().eq('id', records[0].id)
    if (error) return notify('Erro ao remover: ' + error.message, 'error')
    await loadAll()
    notify('Última confirmação removida.')
  }

  function startEdit(rec) { setEditingId(rec.id); setEditObs(rec.observations || '') }

  async function saveEdit(id) {
    const { error } = await supabase.from('applications').update({ observations: editObs.trim() || null }).eq('id', id)
    if (error) return notify('Erro ao salvar: ' + error.message, 'error')
    setEditingId(null)
    await loadAll()
    notify('Observação atualizada.')
  }

  async function handleModalConfirm() {
    const type = modal?.type
    const id   = modal?.id
    setModal(null)
    if (type === 'deleteLast')   await deleteLast()
    if (type === 'deleteAll')    await deleteAll()
    if (type === 'deleteRecord') await deleteRecord(id)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 rounded-full border-[3px] border-med-primary border-t-transparent animate-spin"/>
    </div>
  )

  if (!isAdmin) return (
    <div className="flex items-center justify-center min-h-[60vh] p-5 text-center">
      <div>
        <ShieldCheck size={48} className="mx-auto mb-3 text-med-faint"/>
        <p className="text-med-muted text-lg">Acesso restrito ao administrador.</p>
      </div>
    </div>
  )

  const nextDay  = POSITION_DAY[nextPos]
  const nextInfo = POSITION_LABELS[nextPos]
  const visibleRecords = showAll ? records : records.slice(0, HISTORY_LIMIT)

  return (
    <div className="p-5 max-w-lg mx-auto space-y-5 pb-28 animate-fadeIn">
      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: '' })}/>

      {modal?.type === 'deleteLast' && (
        <ConfirmModal
          title="Desfazer última confirmação?"
          description="O último registro será removido e o rodízio voltará um passo."
          confirmLabel="Desfazer"
          danger={false}
          onConfirm={handleModalConfirm}
          onCancel={() => setModal(null)}
        />
      )}
      {modal?.type === 'deleteAll' && (
        <ConfirmModal
          title="Apagar todo o histórico?"
          description="Esta ação não pode ser desfeita. O rodízio voltará ao Dia 1."
          confirmLabel="Apagar tudo"
          danger={true}
          onConfirm={handleModalConfirm}
          onCancel={() => setModal(null)}
        />
      )}
      {modal?.type === 'deleteRecord' && (
        <ConfirmModal
          title="Remover este registro?"
          description="O registro será excluído permanentemente."
          confirmLabel="Remover"
          danger={true}
          onConfirm={handleModalConfirm}
          onCancel={() => setModal(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center shadow-card">
          <ShieldCheck size={22} className="text-amber-600"/>
        </div>
        <div>
          <h1 className="text-2xl font-black text-med-text">Painel Admin</h1>
          <p className="text-med-muted text-sm">Acesso exclusivo · {caregiver?.name}</p>
        </div>
      </div>

      {/* Status */}
      <div className="bg-gradient-to-br from-[#a07ee0] to-med-primary rounded-3xl px-5 py-5 text-white shadow-card2 flex items-center justify-between">
        <div>
          <p className="text-purple-200 text-xs uppercase tracking-widest font-semibold">Próxima aplicação</p>
          <p className="text-white text-2xl font-black mt-1">{nextInfo?.label}</p>
          <p className="text-purple-200 text-sm mt-0.5">Dia {nextDay} · {nextPos}</p>
        </div>
        <div className="text-6xl font-black text-white/20 leading-none">{nextDay}</div>
      </div>

      {/* Controle do Rodízio */}
      <Card title="Controle do Rodízio" icon={CalendarDays} accent="yellow">
        <p className="text-med-muted text-sm mb-4">
          Defina qual dia do ciclo deve ser aplicado a seguir, sem apagar o histórico.
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <select value={forcedDay} onChange={e => setForcedDay(e.target.value)}
              className="w-full appearance-none bg-white border border-med-border rounded-2xl px-4 py-4 text-med-text text-base font-semibold focus:outline-none focus:border-med-primary pr-10">
              <option value="">Escolher próximo dia...</option>
              {ROTATION_SEQUENCE.map((pos, i) => (
                <option key={pos} value={i + 1}>
                  Dia {i + 1} — {POSITION_LABELS[pos]?.label} ({pos})
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-med-faint pointer-events-none"/>
          </div>
          <button onClick={forceNextDay} disabled={!forcedDay}
            className="bg-amber-500 hover:bg-amber-600 disabled:bg-med-faint text-white font-bold px-5 py-4 rounded-2xl transition-all active:scale-[0.97]">
            Definir
          </button>
        </div>
      </Card>

      {/* Ações Rápidas */}
      <Card title="Ações" icon={RotateCcw} accent="red">
        <div className="space-y-3">
          {/* Menos perigoso */}
          <button onClick={() => setModal({ type: 'deleteLast' })}
            className="flex items-center gap-3 w-full bg-white hover:bg-amber-50 border border-amber-200 rounded-2xl px-4 py-4 text-med-text font-semibold transition-all active:scale-[0.98]">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <RotateCcw size={17} className="text-amber-600"/>
            </div>
            <div className="text-left">
              <p className="font-bold text-med-text">Desfazer última confirmação</p>
              <p className="text-med-faint text-xs mt-0.5">Remove o registro mais recente</p>
            </div>
          </button>

          {/* Divisor com aviso */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-red-200"/>
            <span className="text-red-400 text-xs font-bold uppercase tracking-widest">Zona de risco</span>
            <div className="flex-1 h-px bg-red-200"/>
          </div>

          {/* Muito perigoso */}
          <button onClick={() => setModal({ type: 'deleteAll' })}
            className="flex items-center gap-3 w-full bg-white hover:bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-4 text-red-600 font-semibold transition-all active:scale-[0.98]">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle size={17} className="text-red-500"/>
            </div>
            <div className="text-left">
              <p className="font-bold">Apagar TODO o histórico</p>
              <p className="text-red-400 text-xs mt-0.5">Rodízio volta ao Dia 1 · irreversível</p>
            </div>
          </button>
        </div>
      </Card>

      {/* Estatísticas */}
      {stats.length > 0 && (
        <Card title="Estatísticas das Cuidadoras" icon={Users} accent="green">
          <div className="space-y-2">
            {stats.map(([name, count]) => (
              <div key={name} className="flex items-center justify-between bg-white rounded-2xl px-4 py-3.5 border border-med-border">
                <span className="text-med-text font-semibold text-base">{name}</span>
                <span className="bg-med-primary-light text-med-primary text-sm font-bold px-3 py-1 rounded-full">
                  {count} aplicaç{count !== 1 ? 'ões' : 'ão'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Histórico */}
      <Card title={`Histórico (${records.length})`} icon={Edit3}>
        {records.length === 0 ? (
          <p className="text-med-faint text-center py-4">Nenhum registro.</p>
        ) : (
          <>
            <div className="space-y-2">
              {visibleRecords.map((rec, i) => {
                const d        = new Date(rec.applied_at)
                const date     = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
                const time     = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                const day      = POSITION_DAY[rec.position] ?? '?'
                const isSystem = rec.observations?.includes('⚙️')

                return (
                  <div key={rec.id}
                    className={`rounded-2xl border p-3.5 ${
                      isSystem ? 'bg-amber-50 border-amber-200' :
                      i === 0  ? 'bg-purple-50 border-purple-200' :
                                 'bg-white border-med-border'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-black text-med-primary">Dia {day}</span>
                          <span className="text-sm font-bold text-med-text">{rec.position}</span>
                          {isSystem && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Sistema</span>}
                          {i === 0 && !isSystem && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">Último</span>}
                        </div>
                        <p className="text-med-faint text-xs mt-0.5">
                          {date} {time} · {rec.caregivers?.name || 'Sistema'}
                        </p>
                        {editingId === rec.id ? (
                          <div className="mt-2 flex gap-2">
                            <input value={editObs} onChange={e => setEditObs(e.target.value)}
                              className="flex-1 bg-white border border-med-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-med-primary"
                              placeholder="Observação..." autoFocus/>
                            <button onClick={() => saveEdit(rec.id)}
                              className="p-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors">
                              <Check size={15}/>
                            </button>
                            <button onClick={() => setEditingId(null)}
                              className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors">
                              <X size={15}/>
                            </button>
                          </div>
                        ) : rec.observations ? (
                          <p className="text-med-faint text-xs italic mt-0.5 break-words">"{rec.observations}"</p>
                        ) : null}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {!isSystem && (
                          <button onClick={() => startEdit(rec)}
                            className="p-2 rounded-xl text-med-faint hover:text-med-primary hover:bg-purple-50 transition-colors">
                            <Edit3 size={14}/>
                          </button>
                        )}
                        <button onClick={() => setModal({ type: 'deleteRecord', id: rec.id })}
                          className="p-2 rounded-xl text-med-faint hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Ver mais / menos */}
            {records.length > HISTORY_LIMIT && (
              <button onClick={() => setShowAll(v => !v)}
                className="w-full mt-3 py-3 rounded-2xl border border-med-border text-med-muted text-sm font-semibold hover:bg-med-elevated transition-colors flex items-center justify-center gap-2">
                {showAll
                  ? <><ChevronUp size={15}/> Ver menos</>
                  : <><ChevronDown size={15}/> Ver mais ({records.length - HISTORY_LIMIT} registros)</>
                }
              </button>
            )}
          </>
        )}
      </Card>
    </div>
  )
}
