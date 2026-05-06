import { useState, useEffect } from 'react'
import { CheckCircle, CalendarDays, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { getNextPosition, POSITION_LABELS, POSITION_DAY, ROTATION_SEQUENCE } from '../lib/rotation'
import BackDiagram from '../components/BackDiagram'

const DAY_NAMES = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']

function buildSchedule(startPos) {
  if (!startPos) return []
  const today = new Date()
  let pos = startPos
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const item = {
      dayName: DAY_NAMES[d.getDay()],
      day:   String(d.getDate()).padStart(2, '0'),
      month: String(d.getMonth() + 1).padStart(2, '0'),
      position: pos,
      dayNum: POSITION_DAY[pos],
      isToday: i === 0,
    }
    pos = getNextPosition(pos)
    return item
  })
}

export default function Dashboard() {
  const { caregiver } = useAuth()
  const [patient, setPatient]           = useState(null)
  const [nextPosition, setNextPosition] = useState(null)
  const [lastApplication, setLastApplication] = useState(null)
  const [observations, setObservations] = useState('')
  const [confirming, setConfirming]     = useState(false)
  const [todayDone, setTodayDone]       = useState(false)
  const [todayRecord, setTodayRecord]   = useState(null)
  const [loading, setLoading]           = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const [{ data: pat }, { data: last }] = await Promise.all([
      supabase.from('patients').select('*').limit(1).maybeSingle(),
      supabase.from('applications').select('*').order('applied_at', { ascending: false }).limit(1).maybeSingle(),
    ])
    setPatient(pat)
    setLastApplication(last)
    const next = getNextPosition(last?.position)
    setNextPosition(next)

    const today = new Date().toISOString().split('T')[0]
    const { data: todayApp } = await supabase
      .from('applications')
      .select('*, caregivers(name)')
      .gte('applied_at', today + 'T00:00:00')
      .lte('applied_at', today + 'T23:59:59')
      .order('applied_at', { ascending: false })
      .limit(1).maybeSingle()

    if (todayApp) { setTodayDone(true); setTodayRecord(todayApp) }
    setLoading(false)
  }

  async function handleConfirm() {
    if (!nextPosition || !caregiver) return
    setConfirming(true)
    await supabase.from('applications').insert({
      patient_id:  patient?.id,
      caregiver_id: caregiver.id,
      position:    nextPosition,
      observations: observations.trim() || null,
      applied_at:  new Date().toISOString(),
    })
    setObservations('')
    await loadData()
    setConfirming(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 rounded-full border-2 border-med-primary border-t-transparent animate-spin"/>
    </div>
  )

  const schedule = buildSchedule(nextPosition)
  const posInfo  = nextPosition ? POSITION_LABELS[nextPosition] : null
  const dayNum   = nextPosition ? POSITION_DAY[nextPosition] : null
  const today    = new Date()
  const todayStr = today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  const todayCap = todayStr.charAt(0).toUpperCase() + todayStr.slice(1)

  /* ── JÁ APLICADO HOJE ── */
  if (todayDone && todayRecord) {
    const t       = new Date(todayRecord.applied_at)
    const timeStr = t.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    const nextPos = getNextPosition(todayRecord.position)
    const nextInfo = POSITION_LABELS[nextPos]
    const nextDay  = POSITION_DAY[nextPos]
    const recInfo  = POSITION_LABELS[todayRecord.position]
    const recDay   = POSITION_DAY[todayRecord.position]

    return (
      <div className="p-5 max-w-lg mx-auto space-y-4 pb-28">
        <div className="bg-med-surface rounded-3xl p-6 shadow-card2 border border-green-200 text-center">
          <CheckCircle className="mx-auto mb-3 text-med-success" size={52} strokeWidth={1.5}/>
          <h2 className="text-2xl font-bold text-med-success mb-1">Adesivo aplicado hoje!</h2>
          <p className="text-med-muted text-base mb-4">{timeStr} · {todayRecord.caregivers?.name}</p>

          <div className="bg-med-elevated rounded-2xl p-4 text-left border border-med-border">
            <p className="text-med-muted text-xs uppercase tracking-widest mb-1">Local aplicado</p>
            <p className="text-med-text text-2xl font-black">{recInfo?.label}</p>
            <span className="inline-block mt-1 bg-med-primary-light text-med-primary text-sm font-bold px-3 py-1 rounded-full">
              Dia {recDay} · {todayRecord.position}
            </span>
          </div>
          {todayRecord.observations && (
            <div className="mt-3 bg-med-elevated rounded-2xl p-4 text-left border border-med-border">
              <p className="text-med-muted text-xs mb-1">Observações</p>
              <p className="text-med-text italic">"{todayRecord.observations}"</p>
            </div>
          )}
        </div>

        <div className="bg-med-surface rounded-2xl p-4 flex items-center gap-3 shadow-card border border-med-border">
          <ChevronRight className="text-med-faint shrink-0" size={20}/>
          <div>
            <p className="text-med-muted text-sm">Próxima aplicação</p>
            <p className="text-med-text font-bold text-lg">
              {nextInfo?.label} · <span className="text-med-primary">Dia {nextDay}</span>
            </p>
          </div>
        </div>

        <button onClick={() => setTodayDone(false)}
          className="w-full py-3 rounded-2xl border border-med-border text-med-muted text-base font-medium hover:bg-med-elevated transition-colors bg-med-surface shadow-card">
          Ver detalhes / corrigir
        </button>
      </div>
    )
  }

  /* ── TELA PRINCIPAL ── */
  return (
    <div className="p-5 max-w-lg mx-auto space-y-4 pb-28">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {patient && <p className="text-med-text font-bold text-xl leading-tight">{patient.name}</p>}
          <p className="text-med-muted text-sm mt-0.5">{todayCap}</p>
        </div>
        {lastApplication && (
          <div className="text-right">
            <p className="text-med-faint text-xs uppercase tracking-wider">Último</p>
            <p className="text-med-muted text-sm font-semibold">
              Dia {POSITION_DAY[lastApplication.position]} · {lastApplication.position}
            </p>
          </div>
        )}
      </div>

      {/* Position highlight card */}
      <div className="bg-med-primary rounded-3xl px-5 py-5 text-center shadow-card2">
        <p className="text-blue-200 text-sm uppercase tracking-widest mb-1">Aplicar hoje em</p>
        <p className="text-white text-3xl font-black leading-tight">{posInfo?.label}</p>
        <div className="flex justify-center mt-2 gap-2">
          <span className="bg-white/20 text-white text-base font-bold px-4 py-1.5 rounded-full">
            Dia {dayNum} · {nextPosition}
          </span>
        </div>
      </div>

      {/* Back diagram */}
      <div className="bg-med-surface rounded-3xl py-5 px-3 shadow-card border border-med-border">
        <BackDiagram activePosition={nextPosition}/>
      </div>

      {/* Observations */}
      <div>
        <label className="block text-med-muted text-sm font-semibold uppercase tracking-widest mb-2">
          Observações (opcional)
        </label>
        <textarea
          value={observations} onChange={e => setObservations(e.target.value)}
          rows={2}
          className="w-full bg-med-surface border border-med-border rounded-2xl px-4 py-3 text-med-text text-lg focus:outline-none focus:border-med-primary focus:shadow-blue-glow resize-none placeholder:text-med-faint transition-all shadow-card"
          placeholder="Ex: vermelhidão, trocar local..."
        />
      </div>

      {/* Confirm button */}
      <button
        onClick={handleConfirm}
        disabled={confirming || !caregiver}
        className="w-full bg-med-success hover:bg-green-700 disabled:bg-med-faint disabled:text-white text-white font-black text-2xl py-6 rounded-3xl transition-all shadow-card2 active:scale-[0.98]"
      >
        {confirming ? (
          <span className="flex items-center justify-center gap-3">
            <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"/>
            Registrando...
          </span>
        ) : '✓  CONFIRMAR APLICAÇÃO'}
      </button>

      {!caregiver && (
        <p className="text-center text-amber-600 text-sm bg-amber-50 rounded-2xl p-3 border border-amber-200">
          Seu usuário não está vinculado a uma cuidadora. Peça ao administrador.
        </p>
      )}

      {/* Schedule strip */}
      {schedule.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays size={16} className="text-med-muted"/>
            <p className="text-med-muted text-sm font-semibold uppercase tracking-widest">Próximas 12 aplicações</p>
          </div>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2">
            {schedule.map(({ dayName, day, month, position, dayNum, isToday }, i) => (
              <div key={i}
                className={`shrink-0 w-[72px] rounded-2xl p-2.5 text-center border transition-colors shadow-card ${
                  isToday
                    ? 'bg-med-primary border-med-primary text-white'
                    : 'bg-med-surface border-med-border'
                }`}
              >
                <p className={`text-xs font-bold uppercase ${isToday ? 'text-blue-200' : 'text-med-faint'}`}>{dayName}</p>
                <p className={`text-sm font-semibold mt-0.5 ${isToday ? 'text-white' : 'text-med-muted'}`}>{day}/{month}</p>
                <p className={`text-sm font-black mt-1 ${isToday ? 'text-white' : 'text-med-primary'}`}>Dia {dayNum}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
