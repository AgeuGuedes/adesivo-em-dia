import { useState, useEffect } from 'react'
import { CheckCircle, CalendarDays, Clock, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { getNextPosition, POSITION_LABELS, POSITION_DAY } from '../lib/rotation'
import BackDiagram from '../components/BackDiagram'

const DAY_NAMES = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']

function DayCircle({ day, color = 'blue', size = 'md', ring = false }) {
  const sz  = size === 'lg' ? 'w-14 h-14 text-2xl' : size === 'sm' ? 'w-10 h-10 text-base' : 'w-12 h-12 text-lg'
  const cls = color === 'red'
    ? 'bg-red-500 border-red-700 text-white shadow-md'
    : color === 'green'
    ? 'bg-med-success border-green-700 text-white shadow-md'
    : 'bg-med-primary border-med-primary-hover text-white shadow-md'
  return (
    <div className={`${sz} ${cls} rounded-full border-2 flex items-center justify-center font-black shrink-0 ${ring ? 'ring-2 ring-white ring-offset-1 ring-offset-med-primary' : ''}`}>
      {day}
    </div>
  )
}

function CountdownCompact({ appliedAt }) {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 })

  useEffect(() => {
    const target = new Date(appliedAt).getTime() + 24 * 60 * 60 * 1000
    function tick() {
      const diff = Math.max(0, target - Date.now())
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [appliedAt])

  const pad    = n => String(n).padStart(2, '0')
  const urgent = time.h < 2
  const color  = urgent ? 'text-red-500' : time.h < 6 ? 'text-amber-500' : 'text-med-faint'

  return (
    <div className="text-right shrink-0">
      <p className="text-med-faint text-xs uppercase tracking-widest mb-0.5">Faltam</p>
      <p className={`font-mono font-bold text-lg tabular-nums ${color}`}>
        {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
      </p>
    </div>
  )
}

function CelebrationOverlay() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-med-success">
      <div className="animate-scaleIn">
        <div className="w-36 h-36 rounded-full bg-white/20 flex items-center justify-center">
          <CheckCircle size={88} className="text-white" strokeWidth={1.4}/>
        </div>
      </div>
      <p className="text-white text-3xl font-black mt-7 animate-fadeUpD1 tracking-tight">
        Adesivo aplicado!
      </p>
      <p className="text-green-100 text-lg mt-2 animate-fadeUpD2">
        Registrado com sucesso
      </p>
    </div>
  )
}

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
  const [celebrating, setCelebrating]   = useState(false)
  const [todayDone, setTodayDone]       = useState(false)
  const [todayRecord, setTodayRecord]   = useState(null)
  const [loading, setLoading]           = useState(true)
  const [showDetails, setShowDetails]       = useState(false)
  const [showLastDetails, setShowLastDetails] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const [{ data: pat }, { data: last }] = await Promise.all([
      supabase.from('patients').select('*').limit(1).maybeSingle(),
      supabase.from('applications').select('*, caregivers(name)').order('applied_at', { ascending: false }).limit(1).maybeSingle(),
    ])
    setPatient(pat)
    setLastApplication(last)
    setNextPosition(getNextPosition(last?.position))

    const now        = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString()
    const todayEnd   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString()
    const { data: todayApp } = await supabase
      .from('applications')
      .select('*, caregivers(name)')
      .gte('applied_at', todayStart)
      .lte('applied_at', todayEnd)
      .order('applied_at', { ascending: false })
      .limit(1).maybeSingle()

    if (todayApp) { setTodayDone(true); setTodayRecord(todayApp) }
    setLoading(false)
  }

  async function handleConfirm() {
    if (!nextPosition || !caregiver) return
    setConfirming(true)
    await supabase.from('applications').insert({
      patient_id:   patient?.id,
      caregiver_id: caregiver.id,
      position:     nextPosition,
      observations: observations.trim() || null,
      applied_at:   new Date().toISOString(),
    })
    setObservations('')
    setCelebrating(true)
    setTimeout(async () => {
      await loadData()
      setCelebrating(false)
      setConfirming(false)
    }, 2200)
  }

  if (celebrating) return <CelebrationOverlay/>

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 rounded-full border-[3px] border-med-primary border-t-transparent animate-spin"/>
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
    const t              = new Date(todayRecord.applied_at)
    const timeStr        = t.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    const nextPos        = getNextPosition(todayRecord.position)
    const nextInfo       = POSITION_LABELS[nextPos]
    const nextDay        = POSITION_DAY[nextPos]
    const recInfo        = POSITION_LABELS[todayRecord.position]
    const recDay         = POSITION_DAY[todayRecord.position]
    const nextAppTime    = new Date(t.getTime() + 24 * 60 * 60 * 1000)
    const nextAppTimeStr = nextAppTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    const nextAppDateStr = nextAppTime.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
    const nextAppDateCap = nextAppDateStr.charAt(0).toUpperCase() + nextAppDateStr.slice(1)

    return (
      <div className="p-5 max-w-lg mx-auto space-y-4 pb-28 animate-fadeIn">

        {/* Header */}
        <div className="py-1">
          {patient && <p className="text-med-text font-black text-2xl leading-tight">{patient.name}</p>}
        </div>

        {/* Confirmação */}
        <div className="bg-green-50 rounded-3xl p-5 border border-green-200 shadow-card2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-med-success flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle size={30} className="text-white" strokeWidth={2}/>
            </div>
            <div>
              <h2 className="text-xl font-black text-med-success leading-tight">Adesivo aplicado!</h2>
              <p className="text-green-700 text-base mt-0.5">{t.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} · {timeStr} · {todayRecord.caregivers?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-green-200">
            <DayCircle day={recDay} color="red" size="sm"/>
            <div>
              <p className="text-green-600 text-xs uppercase tracking-widest font-semibold">Local aplicado</p>
              <p className="text-med-text font-bold text-lg leading-tight">
                {recInfo?.label}
                <span className="ml-2 text-red-400 text-sm font-semibold">{todayRecord.position}</span>
              </p>
            </div>
          </div>
          {todayRecord.observations && (
            <p className="mt-3 text-green-700 text-sm italic border-t border-green-200 pt-3 break-words">
              "{todayRecord.observations}"
            </p>
          )}
        </div>

        {/* Diagrama */}
        <div className="bg-med-surface rounded-3xl py-4 px-3 shadow-card border border-med-border">
          <BackDiagram appliedPosition={todayRecord.position}/>
        </div>

        {/* Próxima aplicação — card unificado */}
        <div className="bg-med-surface rounded-3xl p-6 border border-med-border shadow-card space-y-4">
          <div>
            <p className="text-med-faint text-xs uppercase tracking-widest mb-1 font-semibold">Próxima aplicação</p>
            <p className="text-med-text text-4xl font-black leading-none tracking-tight">{nextAppTimeStr}</p>
            <p className="text-med-muted text-base mt-1.5">{nextAppDateCap}</p>
          </div>
          <div className="border-t border-med-border"/>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <DayCircle day={nextDay} color="blue" size="sm"/>
              <div>
                <p className="text-med-faint text-xs uppercase tracking-widest font-semibold">Local</p>
                <p className="text-med-text font-bold text-lg leading-tight">
                  {nextInfo?.label}
                  <span className="ml-2 text-med-primary text-sm font-semibold">{nextPos}</span>
                </p>
              </div>
            </div>
            <CountdownCompact appliedAt={todayRecord.applied_at}/>
          </div>
        </div>

        {/* Corrigir */}
        <button onClick={() => setTodayDone(false)}
          className="w-full py-4 rounded-2xl border border-med-border text-med-muted text-base font-semibold hover:bg-med-elevated transition-colors bg-med-surface shadow-card flex items-center justify-center gap-2 active:scale-[0.98]">
          <RotateCcw size={16}/>
          Corrigir aplicação
        </button>
      </div>
    )
  }

  /* ── TELA PRINCIPAL ── */
  return (
    <div className="p-5 max-w-lg mx-auto space-y-4 pb-28 animate-fadeIn">

      {/* Header */}
      <div className="py-1">
        {patient && <p className="text-med-text font-black text-2xl leading-tight">{patient.name}</p>}
        <p className="text-med-muted text-base mt-0.5">{todayCap}</p>
      </div>

      {/* Position card */}
      <div className="bg-gradient-to-br from-[#a07ee0] to-med-primary rounded-3xl px-6 py-6 shadow-card2">
        <p className="text-purple-200 text-sm uppercase tracking-widest mb-4 font-semibold">Aplicar hoje em</p>
        <div className="flex items-center gap-5">
          <DayCircle day={dayNum} color="blue" size="lg" ring={true}/>
          <div>
            <p className="text-white text-3xl font-black leading-tight">{posInfo?.label}</p>
            <span className="inline-block mt-2 bg-white/20 text-white text-base font-bold px-4 py-1 rounded-full">
              {nextPosition}
            </span>
          </div>
        </div>
        {lastApplication && (() => {
          const nextT       = new Date(new Date(lastApplication.applied_at).getTime() + 24 * 60 * 60 * 1000)
          const nextTimeStr = nextT.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          return (
            <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2">
              <Clock size={14} className="text-purple-200 shrink-0"/>
              <p className="text-purple-200 text-sm font-medium">Ideal hoje às {nextTimeStr}</p>
            </div>
          )
        })()}
      </div>

      {/* Back diagram */}
      <div className="bg-med-surface rounded-3xl py-5 px-3 shadow-card border border-med-border">
        <BackDiagram activePosition={nextPosition}/>
      </div>

      {/* Observations */}
      <div>
        <label className="block text-med-muted text-sm font-bold uppercase tracking-widest mb-2">
          Observações (opcional)
        </label>
        <textarea
          value={observations} onChange={e => setObservations(e.target.value)}
          rows={2}
          className="w-full bg-med-surface border border-med-border rounded-2xl px-4 py-4 text-med-text text-lg focus:outline-none focus:border-med-primary focus:shadow-blue-glow resize-none placeholder:text-med-faint transition-all shadow-card"
          placeholder="Ex: vermelhidão, trocar local..."
        />
      </div>

      {/* Confirm button */}
      <button
        onClick={handleConfirm}
        disabled={confirming || !caregiver}
        className="w-full bg-med-success hover:bg-green-700 disabled:bg-med-faint text-white font-black text-2xl py-7 rounded-3xl transition-all shadow-card2 active:scale-[0.97] select-none"
      >
        {confirming ? (
          <span className="flex items-center justify-center gap-3">
            <span className="w-7 h-7 border-[3px] border-white border-t-transparent rounded-full animate-spin"/>
            Registrando...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-3">
            <CheckCircle size={28} strokeWidth={2.5}/>
            CONFIRMAR APLICAÇÃO
          </span>
        )}
      </button>

      {!caregiver && (
        <p className="text-center text-amber-700 text-base bg-amber-50 rounded-2xl p-4 border border-amber-200 font-medium">
          Seu usuário não está vinculado a uma cuidadora. Peça ao administrador.
        </p>
      )}

      {/* Última aplicação expandível */}
      {lastApplication && (() => {
        const lastInfo = POSITION_LABELS[lastApplication.position]
        const lastDay  = POSITION_DAY[lastApplication.position]
        const lastT    = new Date(lastApplication.applied_at)
        const lastTime = lastT.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        const lastDate = lastT.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
        return (
          <>
            <button onClick={() => setShowLastDetails(v => !v)}
              className="w-full flex items-center justify-between bg-med-surface border border-med-border rounded-2xl px-5 py-4 shadow-card hover:bg-med-elevated transition-colors active:scale-[0.98]">
              <div className="text-left">
                <p className="text-med-text font-semibold text-base">Última aplicação</p>
                <p className="text-med-faint text-sm mt-0.5">{lastInfo?.label} · {lastApplication.position} · Dia {lastDay}</p>
              </div>
              {showLastDetails ? <ChevronUp size={18} className="text-med-muted shrink-0"/> : <ChevronDown size={18} className="text-med-muted shrink-0"/>}
            </button>
            {showLastDetails && (
              <div className="bg-med-surface rounded-3xl p-5 border border-med-border shadow-card space-y-4 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <DayCircle day={lastDay} color="red" size="sm"/>
                  <div>
                    <p className="text-med-text font-bold text-lg leading-tight">
                      {lastInfo?.label}
                      <span className="ml-2 text-red-400 text-sm font-semibold">{lastApplication.position}</span>
                    </p>
                    <p className="text-med-muted text-sm mt-0.5">
                      {lastDate} · {lastTime} · {lastApplication.caregivers?.name}
                    </p>
                  </div>
                </div>
                <BackDiagram appliedPosition={lastApplication.position}/>
              </div>
            )}
          </>
        )
      })()}

      {/* Schedule strip */}
      {schedule.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays size={17} className="text-med-muted"/>
            <p className="text-med-muted text-sm font-bold uppercase tracking-widest">Próximas 12 aplicações</p>
          </div>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2">
            {schedule.map(({ dayName, day, month, dayNum, isToday }, i) => (
              <div key={i}
                className={`shrink-0 w-[76px] rounded-2xl p-3 text-center border transition-colors shadow-card ${
                  isToday ? 'bg-med-primary border-med-primary' : 'bg-med-surface border-med-border'
                }`}
              >
                <p className={`text-xs font-bold uppercase ${isToday ? 'text-purple-200' : 'text-med-faint'}`}>{dayName}</p>
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
